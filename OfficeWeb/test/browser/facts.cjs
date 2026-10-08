// 事实采集：线上站点里，第一次进空间会看到什么、点开设置看到什么。
// 走隔离服务器 + 真实构建产物，避免污染正式名册。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/facts-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    // A. 全新账号：进空间会弹什么？
    const fresh = await browser.newContext({ viewport: { width: 1280, height: 860 },
      permissions: ["microphone"] });
    await fresh.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "全新甲", password: "qa" } });
    await fresh.request.post(base + "/api/auth/role",
      { headers: { origin: base }, data: { role: "employee" } });
    await fresh.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const p1 = await fresh.newPage();
    p1.on("pageerror", e => console.log("PAGEERROR(fresh)", e.message));
    await p1.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await p1.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await p1.waitForTimeout(2500);
    const freshUi = await p1.evaluate(() => ({
      seatPicker: Boolean(document.querySelector(".seat-picker-hint")),
      pickerText: document.querySelector(".seat-picker-hint")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) ?? null,
      colorGrid: document.querySelectorAll(".color-grid button").length,
      accessoryList: Boolean(document.querySelector(".accessory-list")),
      look: window.__officeDebug.avatar.character?.appearance ?? null,
    }));
    console.log("全新账号进空间:", JSON.stringify(freshUi));
    await p1.screenshot({ path: path.join(ROOT, "Build/facts-fresh.png") });

    // B. 已有账号 + 已占座：重新登录（新浏览器上下文 = 没有 localStorage）会弹什么？
    const cookies = await fresh.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
    });
    const again = await browser.newContext({ viewport: { width: 1280, height: 860 },
      permissions: ["microphone"] });
    const login = await again.request.post(base + "/api/auth/login",
      { headers: { origin: base }, data: { name: "全新甲", password: "qa" } });
    assert.equal(login.status(), 200, "登录失败");
    const me = await again.request.get(base + "/api/auth/me", { headers: { origin: base } });
    console.log("账号里的外观:", JSON.stringify((await me.json())?.appearance ?? null));
    await again.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const p2 = await again.newPage();
    p2.on("pageerror", e => console.log("PAGEERROR(relogin)", e.message));
    await p2.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await p2.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await p2.waitForTimeout(2500);
    const reloginUi = await p2.evaluate(() => ({
      seatPicker: Boolean(document.querySelector(".seat-picker-hint")),
      pickerText: document.querySelector(".seat-picker-hint")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) ?? null,
      look: window.__officeDebug.avatar.character?.appearance ?? null,
      bodyHex: (() => {
        let hex = null;
        window.__officeDebug.avatar.root.traverse(o => {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) if (m?.name === "材质.017") hex = m.color.getHexString();
        });
        return hex;
      })(),
      visibleAccessories: (() => {
        const worn = [];
        window.__officeDebug.avatar.root.traverse(o => {
          if (o.visible && o.material?.name?.endsWith("_材质")) worn.push(o.name);
        });
        return worn;
      })(),
    }));
    console.log("重新登录（无本机缓存）:", JSON.stringify(reloginUi));
    await p2.screenshot({ path: path.join(ROOT, "Build/facts-relogin.png") });
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
