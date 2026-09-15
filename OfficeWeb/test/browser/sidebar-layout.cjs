// The right-hand directory must fit a laptop screen: the desk detail and the footer
// have to be visible without scrolling the panel (user, 2026-09-15: "收紧一下右侧
// 不然看不见下面 还得要滚轮"), and the seat row no longer carries a "DESK A-1" label.
//
//   node test/browser/sidebar-layout.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/sidebar-qa-"));
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
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  await fetch(base + "/api/auth/role", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ role: "employee" }),
  });
  if (seat === undefined) return { cookie, socket: undefined };
  const socket = connect(base, { transports: ["websocket"], reconnection: false,
    extraHeaders: { Cookie: cookie, Origin: base } });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve); socket.once("connect_error", reject);
  });
  socket.emit("join", { name });
  await new Promise(resolve => socket.once("people", resolve));
  assert.equal((await socket.emitWithAck("seat", seat)).ok, true, name + " 应能认领工位");
  return { cookie, socket };
}

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const sockets = [];
  try {
    // Somebody at a desk, somebody offline holding one, and a visitor in the lounge.
    const me = await account(base, "布局甲", 0); sockets.push(me.socket);
    const away = await account(base, "布局乙", 4); away.socket.disconnect();
    const guest = await account(base, "布局丙");
    await fetch(base + "/api/auth/role", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: guest.cookie },
      body: JSON.stringify({ role: "visitor" }),
    });

    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
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
    await page.waitForTimeout(500);

    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector(".sidebar");
      const detail = document.querySelector(".detail");
      const foot = document.querySelector(".side-foot");
      const box = sidebar.getBoundingClientRect();
      return {
        scrollOverflow: sidebar.scrollHeight - sidebar.clientHeight,
        detailBottom: Math.round(detail.getBoundingClientRect().bottom - box.top),
        footBottom: Math.round(foot.getBoundingClientRect().bottom - box.top),
        panelHeight: Math.round(box.height),
        rows: document.querySelectorAll(".seat-grid .seat").length,
        deskLabel: document.querySelector(".detail .eyebrow")?.textContent.trim() || null,
        gridScrolls: document.querySelector(".seat-grid").scrollHeight >
          document.querySelector(".seat-grid").clientHeight,
      };
    });
    await page.screenshot({ path: path.resolve("Build/sidebar-1366x768.png") });
    console.log(JSON.stringify(layout, null, 2));

    assert.equal(layout.rows, 9, "九个工位都要在列表里");
    assert.equal(layout.deskLabel, null, "工位详情里不应再出现「DESK A-1」字样");
    assert.ok(layout.scrollOverflow <= 2, `整块面板不该需要滚动 (溢出 ${layout.scrollOverflow}px)`);
    assert.ok(layout.detailBottom <= layout.panelHeight, "工位详情必须完整可见");
    assert.ok(layout.footBottom <= layout.panelHeight + 1, "底部状态条必须可见");
    assert.deepEqual(errors, []);
    console.log("PASS 右侧面板在 1366×768 内不滚动，工位详情与底部都可见，DESK 字样已去掉");
    await context.close();
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
