import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as createVite } from "vite";
import { createOfficeServer } from "../../server.mjs";
import { io } from "socket.io-client";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.APPDATA + "/npm/node_modules/playwright");
const dir = mkdtempSync(join(tmpdir(), "chat-browser-"));
const server = createOfficeServer({ authentication: false, statePath: join(dir, "state.json") });
await new Promise(r => server.http.listen(0, "127.0.0.1", r));
const target = `http://127.0.0.1:${server.http.address().port}`;
const vite = await createVite({ configFile: false, root: resolve("."),
  server: { host: "127.0.0.1", port: 0, proxy: { "/socket.io": { target, ws: true } } } });
await vite.listen();
const url = `http://127.0.0.1:${vite.httpServer.address().port}/test/chat-harness.html`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const sender = io(target);
try {
  await new Promise(r => sender.on("connect", r));
  sender.emit("join", { id: "sender", name: "发送者" });
  await page.goto(url);
  await page.waitForFunction(() => window.startChat);
  await page.evaluate(() => window.startChat("account-a"));
  await page.waitForFunction(() => window.socket.connected);
  assert.equal(await page.evaluate(() => window.chat.send("本地保留消息")), true);
  await page.waitForFunction(() => window.rows.length === 1);
  await page.reload();
  await page.waitForFunction(() => window.startChat);
  await page.evaluate(() => window.startChat("account-a"));
  await page.waitForFunction(() => window.rows.length === 1);
  await page.evaluate(() => window.socket.disconnect());
  await sender.timeout(2000).emitWithAck("chat", { text: "离线补收消息", requestId: "offline-one" });
  await page.evaluate(() => window.socket.connect());
  await page.waitForFunction(() => window.rows.length === 2);
  await page.evaluate(() => window.socket.emit("chat", { text: "离线补收消息", requestId: "same-id" }));
  await page.waitForFunction(() => window.rows.length === 3);
  await page.evaluate(() => window.socket.emit("chat", { text: "离线补收消息", requestId: "same-id" }));
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.rows.length), 3);
  // Read the actual IndexedDB stores after a full browser page reload.
  await page.reload();
  const stored = await page.evaluate(async () => {
    const { openChatArchive, readArchive } = await import("/src/chatLocal.ts");
    const a = await openChatArchive("account-a"), b = await openChatArchive("account-b");
    const aa = await readArchive(a), bb = await readArchive(b);
    a.close(); b.close();
    return { a: aa.messages.length, b: bb.messages.length };
  });
  assert.deepEqual(stored, { a: 3, b: 0 });
  await page.evaluate(async () => {
    const { openChatArchive, saveArchive } = await import("/src/chatLocal.ts");
    const db = await openChatArchive("account-a");
    await saveArchive(db, [{ id: "1000000000000-old", name: "旧记录",
      text: "一个月前已经收到的消息", time: Date.now() - 30 * 86400000 }]);
    db.close();
  });
  await page.evaluate(() => window.startChat("account-a"));
  await page.waitForFunction(() => window.rows.length === 4);
  assert.equal(await page.evaluate(() => window.rows[0].text), "一个月前已经收到的消息");
  console.log("PASS: real browser IndexedDB persistence, reload, offline catch-up, deduplication, account isolation");
} finally {
  sender.disconnect();
  await browser.close();
  await vite.close();
  await new Promise(r => server.io.close(r));
  rmSync(dir, { recursive: true, force: true });
}
