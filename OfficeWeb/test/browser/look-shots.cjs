// 捏人 + 角色的真实浏览器目视检查：截图给我自己看（不是 aria 断言）。
//
// 跑法（从 OfficeWeb/）：node test/browser/look-shots.cjs
// 需要先 npm run build（用 Build/OfficeWeb 的真实产物）。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

const POSES = [
  ["step1", null],
  ["step2", ".look-steps button:nth-child(2)"],
];

(async () => {
  // 路径都按文件位置算，从仓库根还是 OfficeWeb/ 跑都一样。
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.CHARACTER_BUILD || path.join(ROOT, "Build/OfficeWeb"));
  const dir = fs.mkdtempSync(path.resolve(ROOT, "Build/look-shots-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 },
      permissions: ["microphone"] });
    await context.request.post(base + "/api/auth/register", {
      headers: { origin: base }, data: { name: "截图", password: "qa" } });
    await context.request.post(base + "/api/auth/role", {
      headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, r => {
        socket.disconnect(); r.ok ? resolve() : reject(Error(r.error));
      }));
    });
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(2500);
    // 我们自己的角色必须真的画出来（不是只有标签）。
    const probe = await page.evaluate(() => {
      const debug = window.__officeDebug || {};
      const keys = Object.keys(debug);
      return { keys, hasAvatar: keys.some(k => /avatar/i.test(k)) };
    });
    console.log("debug keys:", JSON.stringify(probe.keys));
    await page.screenshot({ path: path.join(ROOT, "Build/look-scene.png") });

    await page.locator('button[aria-label="设置"]').click();
    await page.waitForTimeout(300);
    for (const [name, next] of POSES) {
      if (next) { await page.locator(next).click(); await page.waitForTimeout(300); }
      await page.screenshot({ path: path.join(ROOT, `Build/look-${name}.png`) });
      console.log("shot", name);
    }
    // 换成雪白 + 全配件，看模型本体是不是真的跟着变。
    await page.locator('.look-steps button:has-text("1 配色")').click();
    await page.locator('.color-grid button[aria-label="雪白"]').click();
    await page.locator('.look-steps button:has-text("2 配件")').click();
    await page.locator('.accessory-row:has-text("头发") button:has-text("长直发")').click();
    await page.locator('.accessory-row:has-text("胡子") button:has-text("络腮胡")').click();
    await page.locator('.accessory-row:has-text("帽子") button:has-text("礼帽")').click();
    await page.locator('.accessory-row:has-text("眼镜") button:has-text("黑框眼镜")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, "Build/look-step2-equipped.png") });
    await page.getByRole("button", { name: "关闭", exact: true }).click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(ROOT, "Build/look-scene-dressed.png") });
    console.log("page errors:", JSON.stringify(errors));
  } finally {
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
