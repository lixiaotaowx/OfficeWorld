// Somebody shown out of the space stays out: the chat lists hide them and the mark
// survives a restart, until they log in again (user, 2026-09-15).
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createMembership } from "../membership.mjs";

const fakeIo = () => {
  const sockets = new Map();
  return { sockets: { sockets }, sent: [], emit(event, payload) { this.sent.push({ event, payload }); } };
};
const accounts = (revoked) => ({
  listContacts: () => [{ id: "a", name: "甲" }, { id: "b", name: "乙" }],
  revokeSessions: (id) => { revoked.push(id); return true; },
});

test("请出的人跨重启仍然隐藏，重新登录才恢复", () => {
  const dir = mkdtempSync(join(tmpdir(), "membership-"));
  const path = join(dir, "ejected.json");
  const revoked = [];
  try {
    const first = createMembership({ io: fakeIo(), accounts: accounts(revoked), path });
    assert.deepEqual(first.hidden(), [], "一开始没有人被请出");
    assert.deepEqual(first.contacts().map((c) => c.id), ["a", "b"]);

    first.eject("a");
    assert.deepEqual(revoked, ["a"], "请出要撤销他的会话");
    assert.deepEqual(first.hidden(), ["a"]);
    assert.deepEqual(first.contacts().map((c) => c.id), ["b"], "名册里不再有他");

    // A restart must not quietly forgive them.
    const second = createMembership({ io: fakeIo(), accounts: accounts(revoked), path });
    assert.deepEqual(second.hidden(), ["a"], "重启后仍然隐藏");
    assert.deepEqual(second.contacts().map((c) => c.id), ["b"]);

    second.login("a");
    assert.deepEqual(second.hidden(), [], "重新登录恢复为成员");
    const third = createMembership({ io: fakeIo(), accounts: accounts(revoked), path });
    assert.deepEqual(third.hidden(), [], "恢复也要落盘");
    assert.deepEqual(third.contacts().map((c) => c.id), ["a", "b"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("请出会即时广播隐藏名单，重复请出不做多余动作", () => {
  const dir = mkdtempSync(join(tmpdir(), "membership-"));
  try {
    const io = fakeIo();
    const revoked = [];
    const membership = createMembership({ io, accounts: accounts(revoked), path: join(dir, "ejected.json") });
    membership.eject("a");
    assert.deepEqual(io.sent, [{ event: "chat-directory", payload: { hidden: ["a"] } }]);
    membership.eject("a");
    assert.equal(io.sent.length, 1, "同一个人被请出两次只处理一次");
    assert.deepEqual(revoked, ["a"]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
