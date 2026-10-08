// 把角色身上那块可疑几何（`立方体002_3`，与眼睛共用材质）单独藏起来，前后各截一张对照图。
//   node test/browser/part-toggle.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/toggle-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 780 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "藏块", password: "qa" } });
    await context.request.post(base + "/api/auth/role",
      { headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
    });
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(2500);
    console.log("部件:", JSON.stringify(await page.evaluate(() => window.__officeDebug.__parts())));

    // 把镜头压低一点对着角色，方便看清脚下
    await page.evaluate(() => {
      const debug = window.__officeDebug;
      const controls = debug.controls?.();
      if (controls) {
        controls.target.set(debug.avatar.root.position.x, 0.6, debug.avatar.root.position.z);
        debug.__camera.position.set(debug.avatar.root.position.x + 1.6, 1.5,
          debug.avatar.root.position.z + 2.2);
        debug.__camera.lookAt(controls.target);
      }
    });
    await page.waitForTimeout(900);
    const canvas = await page.locator("canvas").boundingBox();
    const clip = { x: canvas.x, y: canvas.y, width: canvas.width, height: canvas.height };
    await page.screenshot({ path: path.join(ROOT, "Build/part-visible.png"), clip });
    for (const name of ["立方体002_3", "立方体002_2", "立方体002_1"]) {
      const ok = await page.evaluate(n => window.__officeDebug.__setPartVisible(n, false), name);
      console.log(`隐藏 ${name}: ${ok}`);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(ROOT, `Build/part-without-${name}.png`), clip });
      await page.evaluate(n => window.__officeDebug.__setPartVisible(n, true), name);
      await page.waitForTimeout(300);
    }
    console.log("截图: Build/part-visible.png 与 part-without-*.png");
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
