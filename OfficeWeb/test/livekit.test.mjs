// LiveKit room authorisation: consent must be enforced by the server, because a
// token is the only way into a room. Run with `npm test`.
import test from "node:test";
import assert from "node:assert/strict";
import { io } from "socket.io-client";
import { createOfficeServer } from "../server.mjs";
import {
  grantRoom,
  livekit,
  MEETING_ROOM,
  screenRoom,
  voiceRoom,
} from "../livekit.mjs";

const person = (id, meeting = false) => ({ id, meeting });
const grant = (socketId, requested, people, sessions = new Map()) =>
  grantRoom({
    socketId,
    requested,
    person: people.get(socketId),
    people,
    sessions,
  });

test("会议室：未加入者拿不到 token", () => {
  const people = new Map([["a", person("a")]]);
  assert.equal(grant("a", MEETING_ROOM, people), null);
});

test("会议室：加入后放行", () => {
  const people = new Map([["a", { ...person("a", true), meetingRoom: 'meeting-private' }]]);
  assert.equal(grant("a", 'meeting-private', people), 'meeting-private');
  assert.equal(grant("a", 'meeting-other', people), null);
  assert.equal(grant("a", MEETING_ROOM, people), null);
});

test("屏幕房间：分享者本人可进入", () => {
  const people = new Map([["owner", person("owner")]]);
  assert.equal(grant("owner", screenRoom("owner"), people), screenRoom("owner"));
});

test("屏幕房间：无已批准会话的观看者被拒", () => {
  const people = new Map([["owner", person("owner")], ["viewer", person("viewer")]]);
  assert.equal(grant("viewer", screenRoom("owner"), people), null);
});

test("屏幕房间：已批准会话的观看者放行", () => {
  const people = new Map([["owner", person("owner")], ["viewer", person("viewer")]]);
  const sessions = new Map([
    ["s1", { kind: "screen", owner: "owner", peers: ["owner", "viewer"] }],
  ]);
  assert.equal(grant("viewer", screenRoom("owner"), people, sessions), screenRoom("owner"));
});

test("屏幕房间：会话种类不符时不放行", () => {
  const people = new Map([["owner", person("owner")], ["viewer", person("viewer")]]);
  const sessions = new Map([
    ["s1", { kind: "voice", owner: "owner", peers: ["owner", "viewer"] }],
  ]);
  assert.equal(grant("viewer", screenRoom("owner"), people, sessions), null);
});

test("屏幕房间：房主不存在时被拒", () => {
  const people = new Map([["viewer", person("viewer")]]);
  assert.equal(grant("viewer", screenRoom("ghost"), people), null);
});

test("语音房间：会话内对端放行", () => {
  const people = new Map([["a", person("a")], ["b", person("b")]]);
  const sessions = new Map([
    ["v1", { kind: "voice", owner: "b", peers: ["a", "b"] }],
  ]);
  assert.equal(grant("a", voiceRoom("v1"), people, sessions), voiceRoom("v1"));
});

test("语音房间：非会话成员被拒", () => {
  const people = new Map([["c", person("c")]]);
  const sessions = new Map([
    ["v1", { kind: "voice", owner: "b", peers: ["a", "b"] }],
  ]);
  assert.equal(grant("c", voiceRoom("v1"), people, sessions), null);
});

test("语音房间：会话结束后房间失效", () => {
  const people = new Map([["a", person("a")]]);
  const sessions = new Map();
  assert.equal(grant("a", voiceRoom("v1"), people, sessions), null);
});

test("未知名与非字符串请求一律拒绝", () => {
  const people = new Map([["a", person("a", true)]]);
  assert.equal(grant("a", "admin", people), null);
  assert.equal(grant("a", undefined, people), null);
  assert.equal(grant("a", "screen-", people), null);
});

test("端到端：同意后才签发，结束后收回", async (t) => {
  if (!livekit.ready) {
    t.skip("未配置 LiveKit（缺少 OfficeWeb/.env）");
    return;
  }
  const { http } = createOfficeServer({ authentication: false });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  const connect = (name) =>
    new Promise((resolve) => {
      const socket = io(`http://127.0.0.1:${port}`, { transports: ["websocket"] });
      socket.on("connect", () => {
        socket.emit("join", { name });
        socket.on("people", (people) => {
          if (people.length) resolve(socket);
        });
      });
    });
  const once = (socket, event) =>
    new Promise((resolve) => socket.once(event, resolve));

  const a = await connect("甲");
  const b = await connect("乙");
  try {
    const before = await a.emitWithAck("livekit-token", screenRoom(b.id));
    assert.ok(before.error, "未同意时不应签发 token");

    b.emit("sharing", true);
    const invited = once(b, "request");
    a.emit("request", { target: b.id, kind: "screen" });
    const invite = await invited;
    const accepted = once(a, "session");
    b.emit("respond", { id: invite.id, accept: true });
    const session = await accepted;

    assert.equal(session.room, `call-${session.id}`);
    const granted = await a.emitWithAck("livekit-token", session.room);
    assert.ok(granted.token, "同意后应签发 token");
    assert.equal(granted.room, session.room);

    a.emit("end", session.id);
    await new Promise((r) => setTimeout(r, 150));
    const revoked = await a.emitWithAck("livekit-token", session.room);
    assert.ok(revoked.error, "会话结束后房间应失效");
  } finally {
    a.disconnect();
    b.disconnect();
    http.close();
  }
});
