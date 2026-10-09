// 回归测试：整个页面不能自己空转。
//
// 2026-09-20 用户报障「内存和cpu占比巨大 且头像没有出现」：办公室页面陷入了 React 无限
// 重渲染（App 每次渲染都给 `onUnread` 一个新的箭头函数 → ChatInbox 的 effect 依赖它 →
// effect 里又 setState 回 App → 再渲染…），主线程 100% 占着、JS 堆每秒涨几百 KB，于是
// 三维场景和头像条都被饿得画不出来。
//
// 这个用例把三维画面**暂停**，然后量页面主线程真的忙了多少 —— 没有动画、没有渲染，
// 剩下那点心跳根本不该占住 CPU。空转的时候这里会是 5/5 秒，正常应该 < 1 秒。
//
//   node test/browser/no-spin.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

const WATCH_SECONDS = 5;
/** 暂停三维画面之后，主线程忙超过这个秒数就算空转。 */
const BUSY_BUDGET = 1;

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/no-spin-qa-"));
  const server = createOfficeServer({
    statePath: dir + "/state.json", accountsPath: dir + "/accounts.json", secureCookies: false,
  });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  return { server, dir, base: "http://127.0.0.1:" + server.http.address().port };
}

async function account(base, name, seat) {
  const registered = await fetch(base + "/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ name, password: "1" }),
  });
  assert.equal(registered.status, 200, name + " 注册失败");
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  await fetch(base + "/api/auth/role", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ role: "employee" }),
  });
  const socket = connect(base, { transports: ["websocket"], reconnection: false,
    extraHeaders: { Cookie: cookie, Origin: base } });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve); socket.once("connect_error", reject);
  });
  socket.emit("join", { name });
  await new Promise(resolve => socket.once("people", resolve));
  if (seat !== undefined) assert.equal((await socket.emitWithAck("seat", seat)).ok, true);
  return { cookie, socket };
}

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const sockets = [];
  let pulse;
  try {
    // 两个人 + 工位：会话列表、未读上报、成员列表都活着，正是那条回路的温床。
    const other = await account(base, "同事甲", 0); sockets.push(other.socket);
    const me = await account(base, "我自己", 1); sockets.push(me.socket);
    pulse = setInterval(() => other.socket.emit("motion",
      { x: 0.4, z: 0.4, rot: 0, moving: false, sitting: false }), 300);

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const [name, ...rest] = me.cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
    await context.route(base + "/**", async route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.startsWith("/api/") || pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, pathname === "/" ? "index.html" : pathname);
      if (fs.existsSync(file)) return route.fulfill({ path: file });
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/?debug=1");
    await page.locator(".seat-grid .seat").first().waitFor({ timeout: 90000 });
    await page.waitForTimeout(1500);

    // 暂停三维画面：这样量到的 CPU 就只剩页面自己的逻辑，动画/渲染都不算数。
    // **设置面板现在分页**（默认停在「我的角色」），「暂停三维画面」在「画面与操作」那一页——
    // 不先切页就永远等不到那个 checkbox（2026-10-08 修）。
    await page.locator('.rail-icon[title="设置"]').click();
    await page.locator('.settings-nav button', { hasText: "画面与操作" }).click();
    const pause = page.locator('.settings-row input[type="checkbox"]').first();
    await pause.check();
    // 关闭按钮现在是右上角那个 `aria-label="关闭设置"` 的 ×（不再是写着"关闭"的文字按钮）。
    await page.getByRole('button', { name: "关闭设置" }).click();
    await page.waitForTimeout(800);
    assert.equal(await page.evaluate(() => Boolean(document.querySelector(".scene-paused"))), true,
      "三维画面要真的暂停了，否则这个用例量不准");

    const cdp = await context.newCDPSession(page);
    await cdp.send("Performance.enable");
    const read = async () => Object.fromEntries(
      (await cdp.send("Performance.getMetrics")).metrics.map(row => [row.name, row.value]));
    const before = await read();
    await page.waitForTimeout(WATCH_SECONDS * 1000);
    const after = await read();
    const busy = after.TaskDuration - before.TaskDuration;
    const script = after.ScriptDuration - before.ScriptDuration;
    const heap = (after.JSHeapUsedSize - before.JSHeapUsedSize) / 1024 / 1024;
    console.log(`主线程忙 ${busy.toFixed(2)}s / ${WATCH_SECONDS}s（脚本 ${script.toFixed(2)}s）` +
      `  JS 堆 ${(after.JSHeapUsedSize / 1024 / 1024).toFixed(0)}MB (${heap >= 0 ? "+" : ""}${heap.toFixed(1)}MB)`);
    assert.ok(busy < BUSY_BUDGET,
      `页面在空转：暂停三维画面后 ${WATCH_SECONDS} 秒里主线程忙了 ${busy.toFixed(2)}s ` +
      `（脚本 ${script.toFixed(2)}s，堆 ${heap >= 0 ? "+" : ""}${heap.toFixed(1)}MB）`);
    // 堆只看个大概：正常也会涨涨落落（GC 锯齿），**主线程不忙**才是"没有回流"的证据。
    assert.ok(heap < 16, `JS 堆涨得太多（${heap.toFixed(1)}MB/${WATCH_SECONDS}s），怀疑又是回流`);
    assert.deepEqual(errors, []);
    console.log("PASS 页面不空转：暂停三维画面后主线程基本闲着");
  } finally {
    clearInterval(pulse);
    for (const socket of sockets) socket.disconnect();
    await browser.close();
    server.http.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
