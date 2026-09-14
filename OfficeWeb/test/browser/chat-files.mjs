import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as createVite } from "vite";
import react from "@vitejs/plugin-react";
import { createOfficeServer } from "../../server.mjs";
import { RETENTION } from "../../chat-store.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("./playwright.cjs");
const dir = mkdtempSync(join(tmpdir(), "chat-file-browser-"));
const options = { statePath: join(dir, "state.json"), accountsPath: join(dir, "accounts.json"), secureCookies: false };
let server = createOfficeServer(options);
await new Promise(r => server.http.listen(0, "127.0.0.1", r));
const port = server.http.address().port;
const target = `http://127.0.0.1:${port}`;
const vite = await createVite({ configFile: false, root: resolve("."), plugins: [react()],
  server: { host: "127.0.0.1", port: 0, proxy: { "/socket.io": { target, ws: true }, "/api": { target } } } });
await vite.listen();
const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
const url = origin + "/test/chat-files-harness.html";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
async function client(name) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url);
  const account = await page.evaluate(async name => {
    const response = await fetch("/api/auth/register", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password: "test" }) });
    if (!response.ok) throw Error(await response.text());
    return (await response.json()).user.id;
  }, name);
  await page.evaluate(id => window.startChat(id), account);
  await page.waitForFunction(() => window.socket.connected);
  await page.waitForTimeout(200);
  return { context, page, account };
}
try {
  const a = await client("附件甲"), b = await client("附件乙");
  const migration = await a.page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      const request = indexedDB.open("office-chat-legacy-test", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("messages", { keyPath: "id" }).put({
          id: "1000-old", time: 1000, name: "旧记录", text: "旧文字保持完整" });
        request.result.createObjectStore("meta").put("1000-old", "cursor");
      };
      request.onsuccess = () => { request.result.close(); resolve(); };
      request.onerror = () => reject(request.error);
    });
    const { openChatArchive, readArchive } = await import("/src/chatLocal.ts");
    const db = await openChatArchive("legacy-test");
    const saved = await readArchive(db);
    const result = { text: saved.messages[0].text, cursor: saved.cursor,
      version: db.version, files: db.objectStoreNames.contains("files") };
    db.close(); return result;
  });
  assert.deepEqual(migration, { text: "旧文字保持完整", cursor: "1000-old", version: 2, files: true });
  await a.page.locator('input[type="file"]').setInputFiles({ name: "中文资料.txt", mimeType: "text/plain",
    buffer: Buffer.alloc(2 * 1024 * 1024, 65) });
  await a.page.getByRole("button", { name: "发送文件", exact: true }).click();
  await b.page.waitForFunction(() => window.rows.length === 1);
  await b.page.getByText("已保存到本机", { exact: false }).waitFor();
  const attachment = await b.page.evaluate(() => window.rows[0].attachment);
  assert.equal((await fetch(origin + "/api/chat/files/" + attachment.id)).status, 401);
  const downloaded = await b.page.evaluate(async () => {
    const blob = await window.chat.loadFile(window.rows[0].attachment);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { size: blob.size, intact: bytes.every(byte => byte === 65) };
  });
  assert.deepEqual(downloaded, { size: 2 * 1024 * 1024, intact: true });
  const downloadEvent = b.page.waitForEvent("download");
  await b.page.getByRole("link", { name: "下载文件" }).click();
  assert.equal((await downloadEvent).suggestedFilename(), "中文资料.txt");
  await b.page.evaluate(() => window.socket.disconnect());
  const png = Buffer.from(await a.page.evaluate(() => {
    const canvas = document.createElement("canvas"); canvas.width = 200; canvas.height = 100;
    const ctx = canvas.getContext("2d"); ctx.fillStyle = "#849570"; ctx.fillRect(0, 0, 200, 100);
    ctx.fillStyle = "#fff"; ctx.font = "20px sans-serif"; ctx.fillText("图片传输测试", 30, 60);
    return canvas.toDataURL("image/png").split(",")[1];
  }), "base64");
  await a.page.locator('input[type="file"]').setInputFiles({ name: "图片.png", mimeType: "image/png", buffer: png });
  await a.page.getByRole("button", { name: "发送文件", exact: true }).click();
  await a.page.waitForFunction(() => window.rows.length === 2);
  await b.page.evaluate(() => window.socket.connect());
  await b.page.waitForFunction(() => window.rows.length === 2);
  await b.page.waitForFunction(() => document.querySelector(".chat-image img")?.naturalWidth === 200);
  await b.page.locator(".chat-image").click();
  assert.equal(await b.page.locator("dialog").evaluate(node => node.open), true);
  await b.page.getByRole("button", { name: "关闭图片" }).click();
  await b.page.screenshot({ path: "../Build/chat-files-mobile.png", fullPage: true });
  const ui = await b.context.newPage();
  await ui.goto(origin);
  await ui.getByRole("button", { name: "确认", exact: true }).click();
  await ui.getByRole("button", { name: "空间聊天", exact: true }).click();
  await ui.getByRole("link", { name: "下载文件" }).first().waitFor();
  await ui.screenshot({ path: "../Build/chat-files-app-mobile.png", fullPage: true });
  assert.ok(await ui.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ui.setViewportSize({ width: 1440, height: 900 });
  await ui.screenshot({ path: "../Build/chat-files-app-desktop.png", fullPage: true });
  await ui.close();
  await a.context.close();
  await b.page.evaluate(() => window.socket.disconnect());
  await new Promise(r => server.io.close(r));
  for (const file of readdirSync(join(dir, "chat-data")).filter(file => file.endsWith(".json"))) {
    const path = join(dir, "chat-data", file);
    const row = JSON.parse(readFileSync(path, "utf8"));
    row.time = Date.now() - RETENTION - 1000;
    writeFileSync(path, JSON.stringify(row));
  }
  server = createOfficeServer(options);
  await new Promise(r => server.http.listen(port, "127.0.0.1", r));
  assert.equal(readdirSync(join(dir, "chat-data", "files")).length, 0);
  await b.page.reload();
  await b.page.evaluate(id => window.startChat(id), b.account);
  await b.page.waitForFunction(() => window.rows.length === 2);
  await b.page.waitForFunction(() => document.querySelector(".chat-image img")?.naturalWidth === 200);
  assert.equal(await b.page.evaluate(async () => (await window.chat.loadFile(window.rows[0].attachment)).size), 2097152);
  const c = await client("附件丙");
  assert.equal(await c.page.evaluate(() => window.rows.length), 0, "新设备无过期服务器副本");
  assert.deepEqual(errors, []);
  console.log("PASS: 双账号2MB文件/中文下载/图片预览/离线补收/本地跨刷新/服务器7天清理/账号隔离/匿名拒绝，零页面错误");
} finally {
  await browser.close(); await vite.close();
  await new Promise(r => server.io.close(r));
  rmSync(dir, { recursive: true, force: true });
}
