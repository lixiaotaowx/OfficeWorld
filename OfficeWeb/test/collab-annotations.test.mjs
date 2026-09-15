// Annotation relay: strokes only reach the peers of one call or one meeting, the
// coordinates are clamped to the shared image, and a flood is dropped.
import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { withServer, wait } from "./helpers.mjs";
import { createCollabAnnotations } from "../collab-annotations.mjs";

const next = (socket, event) => Promise.race([
  once(socket, event).then(([value]) => value),
  new Promise((_, reject) => setTimeout(() => reject(Error(`timeout: ${event}`)), 2500).unref()),
]);
const collect = (socket, event) => {
  const seen = [];
  socket.on(event, (value) => seen.push(value));
  return seen;
};

test("标注只发给同一通话的人，坐标被夹紧，超频排队补发而不是丢弃", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙"), c = await connect("丙");
    const waiting = next(b, "request");
    a.emit("request", { target: b.id, kind: "voice" });
    const request = await waiting;
    const accepted = next(a, "session");
    b.emit("respond", { id: request.id, accept: true });
    const session = await accepted;
    assert.match(session.room, /^call-/);

    const seenB = collect(b, "annotate");
    const seenC = collect(c, "annotate");

    // Non-finite points are dropped; out-of-range ones are clamped, not rejected.
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.25, 0.5], [-3, 9], ["x", 2]] });
    await wait(80);
    assert.equal(seenB.length, 1);
    assert.deepEqual(seenB[0].points, [[0.25, 0.5], [0, 1]]);
    assert.equal(seenB[0].name, "甲");
    assert.equal(seenB[0].done, false);
    assert.equal(seenC.length, 0, "通话外的人不应看到笔画");

    // Two messages inside one 40 ms window: the second used to be dropped, which left
    // a visible gap in the stroke. It must be queued and sent on the next tick.
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.3, 0.3]] });
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.31, 0.31]] });
    await wait(120);
    assert.deepEqual(seenB.slice(1).map((message) => message.points),
      [[[0.3, 0.3]], [[0.31, 0.31]]], "同一时间窗内的点必须排队补发，不能丢");

    // A fast drag: many small batches in one tick. Every point must arrive, and the
    // stroke may only be marked done after its last point.
    const total = seenB.reduce((sum, message) => sum + message.points.length, 0);
    for (let index = 0; index < 10; index += 1)
      a.emit("annotate", { scope: session.room, stroke: "s2",
        points: [[index / 10, index / 10], [index / 10 + 0.01, index / 10]] });
    await wait(200);
    assert.equal(seenB.reduce((sum, message) => sum + message.points.length, 0) - total, 20,
      "十批点必须全部到达");
    assert.equal(seenB.filter((message) => message.stroke === "s2" && message.done).length, 0,
      "还没结束的笔画不能被标记完成");

    const beforeDone = seenB.length;
    a.emit("annotate", { scope: session.room, stroke: "s2", points: [[0.9, 0.9]], done: true });
    await wait(120);
    assert.equal(seenB.length, beforeDone + 1);
    assert.equal(seenB.at(-1).done, true, "结束消息必须最后到达");
    assert.deepEqual(seenB.at(-1).points, [[0.9, 0.9]]);

    // A socket that is not part of the session cannot draw into its scope.
    const before = seenB.length;
    c.emit("annotate", { scope: session.room, stroke: "x", points: [[0.5, 0.5]] });
    await wait(120);
    assert.equal(seenB.length, before, "越权的 scope 不应转发");

    const cleared = next(b, "annotate-clear");
    a.emit("annotate-clear", { scope: session.room });
    assert.equal((await cleared).id, a.id);
    const undone = next(b, "annotate-undo");
    a.emit("annotate-undo", { scope: session.room });
    assert.equal((await undone).id, a.id);
  });
});

test("会议范围只发给同一会议的成员，会议外的人不能画进去", () => {
  const sent = [];
  const io = { to: (id) => ({ emit: (event, payload) => sent.push({ to: id, event, payload }) }) };
  const people = new Map([
    ["a", { id: "a", clientId: "ca", name: "甲", meetingRoom: "meeting-1" }],
    ["b", { id: "b", clientId: "cb", name: "乙", meetingRoom: "meeting-1" }],
    ["c", { id: "c", clientId: "cc", name: "丙", meetingRoom: "meeting-2" }],
  ]);
  const annotations = createCollabAnnotations({ io, people, sessions: new Map() });
  const handlers = (id) => {
    const map = new Map();
    annotations.attach({ id, on: (event, fn) => map.set(event, fn) });
    return map;
  };
  const member = handlers("a");
  member.get("annotate")({ scope: "meeting-1", stroke: "s", points: [[0.1, 0.1]] });
  assert.deepEqual(sent.map((message) => message.to), ["b"]);
  assert.equal(sent[0].payload.clientId, "ca");

  const outsider = handlers("c");
  outsider.get("annotate")({ scope: "meeting-1", stroke: "s", points: [[0.2, 0.2]] });
  assert.equal(sent.length, 1, "会议外的人不应转发");

  // Unknown and missing scopes are ignored rather than broadcast.
  member.get("annotate")({ scope: 12345, stroke: "s", points: [[0.1, 0.1]] });
  member.get("annotate")({ stroke: "s", points: [[0.1, 0.1]] });
  member.get("annotate")({ scope: "meeting-1", points: [[0.1, 0.1]] });
  assert.equal(sent.length, 1);

  // Disconnecting clears the per-socket tables so they cannot grow forever.
  annotations.forget("a");
  assert.equal(typeof annotations.forget("a"), "undefined");
});
