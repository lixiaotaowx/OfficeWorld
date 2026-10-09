// 被顶下线之后，任务栏头像条必须跟着清空并藏起来。
//
// 用户报障（2026-10）：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」。
// 机制：App 其实卸载了（AccountGate 回到登录页），但 `useDockBridge` 的收尾只
// `clearInterval`，没把条子交还回去，所以小窗一直停在"上一次那一份"——所有人（包括
// 已经掉线的我自己）的头像还挂在任务栏上。
//
//   node test/browser/dock-session-end.mjs            (run from OfficeWeb/，本地起真服务器 + vite)
//   BOX_LIVE=1 node test/browser/dock-session-end.mjs  (直接打正式站 https://115.159.43.237)
//
// 用真服务器 + 真页面跑：A 注册并进办公室（浏览器里装一个假桌面桥，只录
// `dockState` 推送），B 用同一个账号登录把 A 顶下线，然后断言 A 回来登录页之后
// 推给小窗的最后一份状态是 `{ people: [], hidden: true }`。
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as createVite } from "vite";
import react from "@vitejs/plugin-react";
import { createOfficeServer } from "../../server.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("./playwright.cjs");

/** 正式站用的是这套账号（注册一次之后一直复用）。 */
const LIVE = process.env.BOX_LIVE === "1";
const SITE = "https://115.159.43.237";
const NAME = LIVE ? "头像条离线验收" : "头像条验证";
const PASSWORD = LIVE ? "docksession" : "dock-test";
let cleanup = async () => {};
let origin = SITE;
if (!LIVE) {
  const dir = mkdtempSync(join(tmpdir(), "dock-session-end-"));
  const options = { statePath: join(dir, "state.json"), accountsPath: join(dir, "accounts.json"), secureCookies: false };
  const server = createOfficeServer(options);
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const target = `http://127.0.0.1:${server.http.address().port}`;
  const vite = await createVite({ configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0, proxy: { "/socket.io": { target, ws: true }, "/api": { target } } } });
  await vite.listen();
  origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  cleanup = async () => { await vite.close(); await new Promise(r => server.io.close(r)); rmSync(dir, { recursive: true, force: true }); };
}
const browser = await chromium.launch({ channel: "msedge", headless: true });
const errors = [];
try {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  // 假桌面桥：这个用例只关心主窗口往小窗推了什么，不碰真的 Electron。
  await context.addInitScript(() => {
    window.__dockPublishes = [];
    window.officeDesktop = {
      dockState: async payload => { window.__dockPublishes.push(payload); return true; },
      readLogin: async () => null, saveLogin: async () => true, clearLogin: async () => true,
    };
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  const login = (route, page0 = page) => page0.evaluate(async ({ route, name, password }) => {
    const r = await fetch("/api/auth/" + route, { method: "POST",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password }) });
    return r.status;
  }, { route, name: NAME, password: PASSWORD });

  await page.goto(origin);
  // 正式站上这个验收账号早就注册过了：注册回非 200 就直接登录（和 build-parts-live 一个做法）。
  if (await login("register") !== 200) assert.equal(await login("login"), 200, "验收账号要能登录");
  // 新账号要先选身份才进办公室（协议取值仍是 employee/visitor）。
  await page.evaluate(async () => (await fetch("/api/auth/role", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "employee" }) })).status);
  await page.reload();
  // 进办公室之后，条子先拿到一份"有人"的状态（后面要看它有没有被清掉）。
  await page.waitForFunction(() => (window.__dockPublishes || [])
    .some(row => row?.people?.length > 0 && row.hidden !== true), null, { timeout: 30000 });
  const before = await page.evaluate(() => window.__dockPublishes.at(-1));
  console.log("in office:", JSON.stringify({ people: before.people.map(p => p.name), hidden: before.hidden }));
  assert.ok(before.people.length > 0, "在办公室时条子上有头像");

  // 同一个账号在别处登录 → A 被顶下线，回登录页。
  const other = await browser.newContext({ ignoreHTTPSErrors: true });
  const otherPage = await other.newPage();
  await otherPage.goto(origin);
  assert.equal(await login("login", otherPage), 200, "第二个窗口登录成功");
  await page.getByRole("heading", { name: "欢迎回来" }).waitFor({ timeout: 20000 });

  // 关键断言：条子必须被清空并藏起来——不能把上一次那一排人留在任务栏上。
  const cleared = await page.waitForFunction(() => {
    const last = (window.__dockPublishes || []).at(-1);
    return Boolean(last) && last.hidden === true && Array.isArray(last.people) && last.people.length === 0;
  }, null, { timeout: 5000 }).then(() => true).catch(() => false);
  const after = await page.evaluate(() => window.__dockPublishes.at(-1));
  console.log("displaced:", JSON.stringify({ people: after?.people?.length, hidden: after?.hidden }));
  assert.ok(cleared, "被顶下线后必须告诉小窗：清空名单并藏起来，实际最后一份是 " + JSON.stringify(after));

  // 再登回来：清空不能是单向门，条子要能重新亮起来。
  // （只看**这次登录之后**新推的那几份：`slice(-8)` 会把顶下线之前的老状态也算进来。）
  const from = await page.evaluate(() => window.__dockPublishes.length);
  await page.getByLabel("姓名", { exact: true }).fill(NAME);
  await page.getByLabel("密码", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "进入办公室 →", exact: true }).click();
  await page.waitForFunction(start => (window.__dockPublishes || []).slice(start)
    .some(row => row?.people?.length > 0 && row.hidden !== true), from, { timeout: 30000 });
  const back = await page.evaluate(() => window.__dockPublishes.at(-1));
  console.log("signed back in:", JSON.stringify({ people: back.people.map(p => p.name), hidden: back.hidden }));
  assert.equal(back.hidden, false, "重新进来头像条要再亮起来");
  assert.deepEqual(errors, []);
  console.log(`PASS 被顶下线后头像条清空并藏起来（${LIVE ? "正式站" : "本地"}：登录页出来了，条子上不许还挂着一排人；再登回来又亮起来）`);
} finally {
  await browser.close();
  await cleanup();
}
