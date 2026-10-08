// 「切换屏幕」菜单开着的时候，页面重渲染**不许**再重读一次显示器列表。
//
// 一个真实报障（用户，2026-09-2X）：「右键出来以后，就整个变卡了。鼠标拖动都变慢了」。
// 原因是 `MonitorContextMenu` 的 effect 依赖里放了 `close`，而它是 App 每次渲染新建的
// 箭头函数 —— 页面每重渲染一次（服务端 people/seats 广播、任何一点交互）effect 就重跑，
// 每次都调 `window.officeDesktop.displays()`。真实客户端里那一次就是
// `desktopCapturer.getSources`：把每一块屏（用户是三块）各抓一遍 480×480 缩略图，
// 主进程被灌满 → 整机鼠标都发飘，而不只是页面卡。
//
// 所以这里用一个自己数调用次数的假桌面桥：打开菜单后人为制造多次服务端广播（= 多次
// 重渲染），再数 `displays()` 有没有跟着涨。
//
//   node test/browser/screen-menu-render.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

const BROADCASTS = 12;

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/screen-menu-render-qa-"));
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
    const me = await account(base, "重渲染甲", 0); sockets.push(me.socket);
    // 另一台机器（同一个人也算别人）：它的状态翻转会让服务端 `publish()`，
    // 于是测试页收到 people 广播 → App 重渲染。这正是真实的那个触发源。
    const other = await account(base, "重渲染乙", 1); sockets.push(other.socket);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const [name, ...rest] = me.cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
    await context.addInitScript(() => {
      window.__displayReads = 0;
      /** 完整的桌面端桥，缺一项页面启动时就会炸（跟真 EXE 一样的接口）。 */
      window.officeDesktop = {
        focusWindow: async () => true,
        alert: async () => true,
        onAlertOpen: () => () => {},
        displays: async () => {
          window.__displayReads += 1;
          return [
            { id: "11", name: "显示器 1", width: 1920, height: 1080, selected: true },
            { id: "22", name: "显示器 2", width: 2560, height: 1440, selected: false },
            { id: "33", name: "显示器 3", width: 1920, height: 1080, selected: false },
          ];
        },
        selectDisplay: async () => true,
        previewFrame: async () => { throw new Error("harness 不提供采集"); },
        setPreviewActive: async () => true,
        systemIdle: async () => ({ seconds: 0, state: "active" }),
        saveLogin: async () => true,
        readLogin: async () => null,
        clearLogin: async () => true,
        setFullscreen: async () => true,
        onFullscreenChange: () => () => {},
      };
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
    await page.locator(".seat-grid .seat").first().waitFor({ timeout: 60000 });

    // 用"看得到的广播"计数，才能确认制造的重渲染真的发生了，而不是干等。
    let broadcasts = 0;
    other.socket.on("people", () => { broadcasts += 1; });
    const mine = page.locator(".seat-grid .seat.mine").first();
    await mine.waitFor({ timeout: 20000 });
    // 服务端只在状态**翻转**时广播，所以来回切换才是"一次翻转换一次广播"。
    // 一个人只翻转 7 次就只能拿到 7 次广播，所以循环里两种状态交替着来。
    const oneBroadcast = async atDesk => {
      const target = broadcasts + 1;
      other.socket.emit("input-state", { atDesk });
      const until = Date.now() + 15000;
      while (broadcasts < target && Date.now() < until) {
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      assert.ok(broadcasts >= target, `第 ${target} 次 people 广播没到，用例本身没跑起来`);
      // 广播真的被这个页面用上了：乙的离座标签跟着出现/消失（= App 重渲染过）。
      await page.waitForFunction(away => document.querySelectorAll(".away-label").length === (away ? 1 : 0),
        !atDesk, { timeout: 15000 }).catch(() => {
          assert.fail(`页面没有因为这次广播重渲染（离座标签没变）`);
        });
    };

    await mine.click({ button: "right" });
    const menu = page.locator(".monitor-context");
    await menu.waitFor({ timeout: 10000 });
    assert.equal(await menu.locator("button").count(), 3, "三块屏幕都要列出来");
    await page.waitForFunction(() => window.__displayReads >= 1, null, { timeout: 5000 });
    const before = { reads: await page.evaluate(() => window.__displayReads), broadcasts };

    // 开着菜单，一次一次地制造服务端广播（每次 = 一次 App 重渲染）。
    // **不能连着 emit 一串** —— 那 12 条几乎同时到达，React 会把它们合成一次渲染，
    // 有 bug 的版本也只重读一两次，用例就白写了（实测踩过）。
    for (let i = 0; i < BROADCASTS; i++) {
      await oneBroadcast(i % 2 === 1);
      await page.waitForTimeout(60);
    }
    // 广播都到齐后再给一点时间，让重渲染引起的 effect 有机会跑完（有 bug 时正是这里爆炸）。
    await page.waitForTimeout(600);

    const after = { reads: await page.evaluate(() => window.__displayReads), broadcasts };
    const renders = after.broadcasts - before.broadcasts;
    const reads = after.reads - before.reads;
    assert.ok(reads <= 2,
      `菜单开着期间显示器列表被重读了 ${reads} 次（对应约 ${renders} 次重渲染）：` +
      "`displays()` 在真机上等于 desktopCapturer.getSources（每块屏抓一遍缩略图），" +
      "会让整个客户端变卡 —— 桌面端回调必须放 ref，不要进 effect 依赖");
    assert.equal(await menu.count(), 1, "重渲染期间菜单要一直在，不能自己关掉");
    assert.deepEqual(errors, []);
    console.log(`PASS 菜单开着时 ${renders} 次重渲染只重读了 ${reads} 次显示器列表（三块屏）`);
    await context.close();
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
