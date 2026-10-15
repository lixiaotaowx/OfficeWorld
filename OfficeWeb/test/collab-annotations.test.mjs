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

test("加入时上报的能力决定别人能不能标注他的屏幕", async () => {
  await withServer(async ({ connect, peopleOf }) => {
    // The desktop app hosts a real layer; a browser tab cannot. The flag travels with
    // the person so the call panel can withhold the tools for a browser sharer
    // (user, 2026-09-15: avoid offering to draw on a screen that cannot show it).
    const desktop = await connect("客户端", { annotate: true });
    const web = await connect("网页版", { annotate: false });
    const noFlag = await connect("没上报");

    const of = (socket) => peopleOf(socket).find((person) => person.id === socket.id);
    assert.equal(of(desktop).annotate, true, "客户端要标记为可标注");
    assert.equal(of(web).annotate, false, "网页登录必须标记为不可标注");
    assert.equal(of(noFlag).annotate, false, "没有上报的客户端按不可标注处理");
    // Everybody sees the flag, not just the person it belongs to.
    const seenByWeb = peopleOf(web).find((person) => person.id === desktop.id);
    assert.equal(seenByWeb.annotate, true, "别人也要能看到这个能力");
  });
});

test("换笔：上一笔的尾巴与 done 必须完整先走，不能被下一笔顶掉", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const waiting = next(b, "request");
    a.emit("request", { target: b.id, kind: "voice" });
    const request = await waiting;
    const accepted = next(a, "session");
    b.emit("respond", { id: request.id, accept: true });
    const session = await accepted;

    const seenB = collect(b, "annotate");
    // A long first stroke whose backlog does NOT fit in one 40 ms flush (8 x 12 = 96
    // points), released, and then the next stroke started immediately.
    for (let index = 0; index < 8; index += 1)
      a.emit("annotate", { scope: session.room, stroke: "s1",
        points: Array.from({ length: 12 }, (_, at) => [index / 10 + at / 1000, 0.5]) });
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [], done: true });
    a.emit("annotate", { scope: session.room, stroke: "s2", points: [[0.8, 0.2]] });
    a.emit("annotate", { scope: session.room, stroke: "s2", points: [[0.81, 0.2]], done: true });
    await wait(320);

    const first = seenB.filter((message) => message.stroke === "s1");
    assert.equal(first.reduce((sum, message) => sum + message.points.length, 0), 96,
      "第一笔的 96 个点一个都不能被下一笔顶掉");
    assert.ok(first.some((message) => message.done),
      "第一笔的 done 必须发出，否则分享者那边会把下一笔并进同一笔、画出一条连接线");
    assert.equal(first.at(-1).done, true, "done 必须是第一笔的最后一条");

    const second = seenB.filter((message) => message.stroke === "s2");
    assert.deepEqual(second.flatMap((message) => message.points), [[0.8, 0.2], [0.81, 0.2]],
      "第二笔必须自成一笔");
    assert.equal(second.at(-1).done, true);

    const lastFirst = seenB.map((message) => message.stroke).lastIndexOf("s1");
    const firstSecond = seenB.findIndex((message) => message.stroke === "s2");
    assert.ok(lastFirst < firstSecond, "两笔的顺序不能交叉");
  });
});

test("观众挑的笔色必须活着中继到对面（用户 2026-10-15「标记没有颜色」的真因）", async () => {
  // 转发这一层是**按字段重建**消息的：`color` 没列进那个对象就被静默丢掉，
  // 页面发的颜色根本到不了分享者的浮层 —— 现象就是"能画，但永远是按人固定的那一色"。
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const waiting = next(b, "request");
    a.emit("request", { target: b.id, kind: "voice" });
    const request = await waiting;
    const accepted = next(a, "session");
    b.emit("respond", { id: request.id, accept: true });
    const session = await accepted;

    const seenB = collect(b, "annotate");
    // 起笔那条带颜色，续画与收尾不带（页面就是这么发的）。
    a.emit("annotate", { scope: session.room, stroke: "s1", color: "#4a9fd8", points: [[0.1, 0.1]] });
    await wait(120);
    assert.equal(seenB.length, 1);
    assert.equal(seenB[0].color, "#4a9fd8", "颜色必须跟着这一笔转发出去");

    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.2, 0.2]] });
    a.emit("annotate", { scope: session.room, stroke: "s1", points: [[0.3, 0.3]], done: true });
    await wait(200);
    assert.ok(seenB.length >= 2, "续画的点要照常转发");
    assert.equal(seenB.at(-1).done, true);

    // 不在色板里的颜色不转发（这一层只做白名单；"认不得退回固定色"是浮层的事）。
    const before = seenB.length;
    a.emit("annotate", { scope: session.room, stroke: "s2", color: "javascript:alert(1)", points: [[0.4, 0.4]] });
    await wait(120);
    assert.ok(seenB.length > before, "笔画本身照旧要转发");
    assert.equal("color" in seenB.at(-1), false, "不认得的颜色不许塞进去");
  });
});
