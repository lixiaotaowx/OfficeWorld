// 右键成员列表里的自己 → 打开"切换屏幕"菜单（用户 2026-09-15 要求），
// 并且选择后要真的调用桌面端并广播 office-display-changed（换屏就靠这个事件）。
//
//   node test/browser/screen-menu.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/screen-menu-qa-"));
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
  if (seat !== undefined) {
    assert.equal((await socket.emitWithAck("seat", seat)).ok, true, name + " 应能认领工位");
  }
  return { cookie, socket };
}

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const sockets = [];
  try {
    const me = await account(base, "换屏甲", 0); sockets.push(me.socket);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const [name, ...rest] = me.cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
    // 桌面端桥：这个用例只关心菜单把选择交给谁，所以自己拿到的屏幕是假的。
    await context.addInitScript(() => {
      window.__selected = [];
      window.__displayChanged = 0;
      /** 完整的桌面端桥，缺一项页面启动时就会炸（跟真 EXE 一样的接口）。 */
      window.officeDesktop = {
        focusWindow: async () => true,
        alert: async () => true,
        onAlertOpen: () => () => {},
        displays: async () => [
          { id: "11", name: "显示器 1", width: 1920, height: 1080, selected: window.__selected.at(-1) !== "22" },
          { id: "22", name: "显示器 2", width: 2560, height: 1440, selected: window.__selected.at(-1) === "22" },
        ],
        selectDisplay: async id => { window.__selected.push(id); return true; },
        previewFrame: async () => { throw new Error("harness 不提供采集"); },
        setPreviewActive: async () => true,
        systemIdle: async () => ({ seconds: 0, state: "active" }),
        saveLogin: async () => true,
        readLogin: async () => null,
        clearLogin: async () => true,
        setFullscreen: async () => true,
        onFullscreenChange: () => () => {},
      };
      window.addEventListener("office-display-changed", () => { window.__displayChanged += 1; });
    });
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
    try {
      await page.locator(".seat-grid .seat").first().waitFor({ timeout: 60000 });
    } catch (error) {
      console.error("页面没起来，错误：", JSON.stringify(errors));
      console.error("正文：", (await page.evaluate(() => document.body.innerText)).slice(0, 300));
      throw error;
    }

    // 1) 右键自己的那一行（A-1）打开菜单，别人那一行不开。
    // 自己那一行要等座位数据到齐（mySeat 来自 people/seats 广播），不能只看一眼。
    const mine = page.locator(".seat-grid .seat.mine").first();
    await mine.waitFor({ timeout: 20000 }).catch(async () => {
      const rows = await page.locator(".seat-grid .seat").evaluateAll(nodes => nodes.map(node => ({
        className: node.className, name: node.querySelector("strong")?.textContent })));
      console.error("没有 mine 行，前几行是：" + JSON.stringify(rows.slice(0, 3)));
      assert.fail("找不到标记为自己的那一行");
    });
    await page.locator(".seat-grid .seat").nth(1).click({ button: "right" });
    assert.equal(await page.locator(".monitor-context").count(), 0, "右键别人的工位不该弹出换屏菜单");
    await mine.click({ button: "right" });
    const menu = page.locator(".monitor-context");
    await menu.waitFor({ timeout: 10000 });
    const rows = await menu.locator("button").allInnerTexts();
    assert.equal(rows.length, 2, "两块屏幕都要列出来：" + JSON.stringify(rows));
    assert.match(rows[0], /显示器 1/);
    assert.match(rows[0], /✓/, "当前那块要打勾");
    await page.screenshot({ path: path.resolve("Build/screen-menu.png") });

    // 2) 选另一块：桌面端收到选择，并且广播了换屏事件（会议/通话换屏靠它）。
    await menu.locator("button").nth(1).click();
    await page.waitForFunction(() => window.__selected.length === 1, null, { timeout: 10000 });
    assert.deepEqual(await page.evaluate(() => window.__selected), ["22"]);
    assert.ok(await page.evaluate(() => window.__displayChanged) >= 1, "必须广播 office-display-changed");
    assert.equal(await menu.count(), 0, "选完菜单要关掉");

    assert.deepEqual(errors, []);
    console.log("PASS 右键成员列表里的自己可以换屏，选择会交给桌面端并广播换屏事件");
    await context.close();
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
