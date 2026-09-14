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

test("标注只发给同一通话的人，坐标被夹紧，超频与越权被丢弃", async () => {
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

    // Two messages in the same tick: the second falls inside the 40 ms window and
    // is dropped, so exactly one more message arrives.
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.3, 0.3]] });
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.31, 0.31]] });
    await wait(80);
    assert.equal(seenB.length, 2, "同一时间窗内的第二条应被丢弃");
    assert.deepEqual(seenB[1].points, [[0.3, 0.3]]);
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.4, 0.4]], done: true });
    await wait(60);
    assert.equal(seenB.length, 3);
    assert.equal(seenB[2].done, true);

    // A socket that is not part of the session cannot draw into its scope.
    c.emit("annotate", { scope: session.room, stroke: "x", points: [[0.5, 0.5]] });
    await wait(80);
    assert.equal(seenB.length, 3, "越权的 scope 不应转发");

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
