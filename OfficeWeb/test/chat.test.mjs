import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createChatStore, RETENTION } from "../chat-store.mjs";
import { withServer } from "./helpers.mjs";

test("7 天边界、磁盘恢复、去重及分页补收", () => {
  const dir = mkdtempSync(join(tmpdir(), "office-chat-"));
  let time = 1800000000000;
  const person = { clientId: "account-a", name: "同事甲" };
  try {
    let store = createChatStore(dir, () => time);
    const first = store.append(person, "保留", "request-one");
    assert.equal(store.append(person, "保留", "request-one").id, first.id);
    time += RETENTION;
    assert.equal(store.page().messages.length, 1, "恰好七天仍可补收");
    store = createChatStore(dir, () => time);
    assert.equal(store.page().messages[0].id, first.id, "重启后可恢复");
    time++;
    store.prune();
    assert.equal(store.page().messages.length, 0);
    assert.equal(readdirSync(dir).length, 0, "过期文件实际删除");
    for (let i = 0; i < 405; i++) store.append(person, `消息${i}`, `request-${i}`);
    const a = store.page(), b = store.page(a.cursor), c = store.page(b.cursor);
    assert.equal(a.messages.length, 200); assert.equal(b.messages.length, 200);
    assert.equal(c.messages.length, 5); assert.equal(c.more, false);
    assert.equal(new Set([...a.messages, ...b.messages, ...c.messages].map(m => m.id)).size, 405);
    assert.equal(store.page(c.cursor).messages.length, 0);
    const d = store.append({ clientId: "account-b", name: "同事乙" }, "独立请求", "request-0");
    assert.equal(d.name, "同事乙");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("实时广播、离线补收、发送确认与重复请求", async () => {
  await withServer(async ({ connect }) => {
    const a = await connect("同事甲", { id: "a" });
    const b = await connect("同事乙", { id: "b" });
    const received = new Promise(resolve => b.once("chat", resolve));
    const payload = { text: "你好离线同事", requestId: "request-a" };
    const sent = await a.timeout(2000).emitWithAck("chat", payload);
    assert.equal(sent.ok, true);
    assert.equal((await received).id, sent.message.id);
    assert.equal((await a.emitWithAck("chat", payload)).message.id, sent.message.id);
    b.disconnect();
    await a.emitWithAck("chat", { text: "离线时发送", requestId: "request-b" });
    const returned = await connect("同事乙", { id: "b" });
    const history = await returned.emitWithAck("chat-history", "");
    assert.equal(history.messages.length, 2);
    assert.equal(history.messages[1].text, "离线时发送");
    assert.equal((await a.emitWithAck("chat", { text: "x".repeat(1001), requestId: "bad" })).ok, false);
    assert.equal((await a.emitWithAck("chat-history", {})).ok, false);
  });
});

test("磁盘写入失败不能确认成功或广播", () => {
  const dir = mkdtempSync(join(tmpdir(), "office-chat-failure-"));
  const store = createChatStore(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.throws(() => store.append({ clientId: "a", name: "甲" }, "失败", "failure"));
  assert.equal(store.page().messages.length, 0);
});
