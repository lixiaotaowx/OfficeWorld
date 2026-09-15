// The ring that nobody answers must end in a visible popup for both sides, and the
// caller must be told to try again (user, 2026-09-15: "拨打时间30秒没人接就提示未接通，
// 稍后重试"). The ring length is injected so this test does not wait 30 seconds.
import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { withServer, wait } from "./helpers.mjs";

const nextExpiry = (socket) => Promise.race([
  once(socket, "request-expired").then(([value]) => value),
  new Promise((_, reject) => setTimeout(() => reject(Error("timeout: request-expired")), 3000).unref()),
]);

async function call(a, b) {
  const waiting = once(b, "request");
  a.emit("request", { target: b.id, kind: "voice" });
  const [invite] = await waiting;
  return invite;
}

test("响铃到点没人接：两边都收到 timeout，呼叫方按未接通处理", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const expired = Promise.all([nextExpiry(a), nextExpiry(b)]);
    const invite = await call(a, b);
    const [forCaller, forCallee] = await expired;
    assert.equal(forCaller.id, invite.id);
    assert.equal(forCaller.reason, "timeout", "呼叫方要知道是没人接");
    assert.equal(forCallee.reason, "timeout", "被叫方要知道这是未接来电");
  }, { inviteRingMs: 120 });
});

test("主动取消不算未接：reason 是 cancelled，不会弹未接电话", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const expired = nextExpiry(b);
    const invite = await call(a, b);
    a.emit("cancel-request", invite.id);
    assert.equal((await expired).reason, "cancelled");
  }, { inviteRingMs: 5000 });
});

test("接听时 reason 是 answered，双方都不会弹未接", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("甲"), b = await connect("乙");
    const expired = nextExpiry(a);
    const invite = await call(a, b);
    const answered = once(b, "session");
    await b.emitWithAck("respond", { id: invite.id, accept: true });
    await answered;
    assert.equal((await expired).reason, "answered");
    await wait(50);
  }, { inviteRingMs: 5000 });
});
