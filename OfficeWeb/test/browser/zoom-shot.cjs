// 只把场景中间那块放大截出来（看角色到底什么样）。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/zoom-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "放大", password: "qa" } });
    await context.request.post(base + "/api/auth/role", { headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 5, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
    });
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(3000);
    // 把当前角色报告出来 + 看看材质颜色到底是多少
    const info = await page.evaluate(() => {
      const debug = window.__officeDebug || {};
      const avatar = debug.avatar;
      const root = avatar?.root;
      const meshes = [];
      const seenMaterials = new Map();
      root?.traverse(obj => {
        if (!obj.isMesh && !obj.isSkinnedMesh) return;
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        meshes.push({ name: obj.name, visible: obj.visible,
          colors: list.map(m => (m?.color ? m.color.getHexString() : '?')),
          mats: list.map(m => m?.name || '?') });
        for (const m of list) {
          if (!m) continue;
          seenMaterials.set(m.name, {
            color: m.color ? m.color.getHexString() : null,
            hasMap: Boolean(m.map),
          });
        }
      });
      return { meshes, materials: [...seenMaterials.entries()],
        local: typeof avatar?.getState === 'function' ? avatar.getState() : null };
    });
    console.log("body:", JSON.stringify(info.meshes.filter(m => m.mats.some(x => /材质\.0/.test(x)))));
    console.log("worn:", JSON.stringify(info.meshes.filter(m => m.visible && !m.mats.some(x => /材质\.0/.test(x)))
      .map(m => [m.name, m.colors])));
    // 客户端自己以为穿的是什么 + 服务端广播的是什么
    const looks = await page.evaluate(() => ({
      avatar: window.__officeDebug?.avatar?.character?.appearance ?? null,
      server: (window.__layouts ?? []).at(-1)?.people?.[0]?.appearance ?? null,
      people: (window.__layouts ?? []).length,
    }));
    console.log("looks", JSON.stringify(looks));
    // 场景加载后（可能的）第二次赋值再读一次
    const later = await page.evaluate(() => window.__officeDebug?.avatar?.character?.appearance ?? null);
    console.log("later", JSON.stringify(later));
    console.log("errors", JSON.stringify(errors));
    await page.screenshot({ path: path.join(ROOT, "Build/zoom-full.png") });
    const box = await page.evaluate(() => {
      const c = document.querySelector("canvas");
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    });
    console.log("canvas", JSON.stringify(box));
    await page.screenshot({ path: path.join(ROOT, "Build/zoom-scene.png"),
      clip: { x: box.x + box.width * 0.2, y: box.y + box.height * 0.35,
        width: box.width * 0.6, height: box.height * 0.6 } });
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
