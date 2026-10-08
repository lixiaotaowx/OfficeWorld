// 找出场景里"白色的物体"以及它们在屏幕上的位置（不用射线：直接把包围盒中心投影到屏幕）。
//
//   node test/browser/pick-what.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/pick-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 760 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "拾取", password: "qa" } });
    await context.request.post(base + "/api/auth/role", { headers: { origin: base }, data: { role: "employee" } });
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
    await page.evaluate(() => window.__officeDebug.avatar.sit(0));
    await page.waitForFunction(() => window.__officeDebug.avatar.getState().sitting === true,
      null, { timeout: 40000 }).catch(() => console.log("WARN 没进入坐姿"));
    await page.waitForTimeout(1500);

    const report = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const scene = debug.__scene;
      const camera = debug.__camera;
      const canvas = document.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();
      const V = camera.position.constructor;          // THREE.Vector3
      const rows = [];
      scene.updateMatrixWorld(true);
      scene.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;                 // 忽略骨骼自带的辅助
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        const colors = mats.map(m => m?.color?.getHexString?.() ?? null);
        // 亮的/白的才关心
        const bright = colors.some(c => c && /^(f|e|d)/.test(c));
        if (!bright) return;
        const box = new (window.__officeDebug.__scene.constructor.prototype.constructor
          ? Object.getPrototypeOf(scene).constructor : Object)();
        // 用包围球近似：取几何体包围盒的 8 个角在世界里的范围
        const geo = o.geometry;
        if (!geo) return;
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        let miny = Infinity, maxy = -Infinity, cx = 0, cy = 0, cz = 0, n = 0;
        for (const xs of [bb.min.x, bb.max.x]) for (const ys of [bb.min.y, bb.max.y]) for (const zs of [bb.min.z, bb.max.z]) {
          const p = new V(xs, ys, zs).applyMatrix4(o.matrixWorld);
          miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y);
          cx += p.x; cy += p.y; cz += p.z; n++;
        }
        cx /= n; cy /= n; cz /= n;
        const centre = new V(cx, cy, cz).project(camera);
        rows.push({
          name: o.name, colors,
          worldY: [+miny.toFixed(2), +maxy.toFixed(2)],
          screen: [Math.round((centre.x * 0.5 + 0.5) * rect.width), Math.round((-centre.y * 0.5 + 0.5) * rect.height)],
          onScreen: Math.abs(centre.x) < 1 && Math.abs(centre.y) < 1,
          visible: o.visible !== false,
        });
      });
      return { canvas: [Math.round(rect.width), Math.round(rect.height)], rows };
    });
    console.log("画布:", JSON.stringify(report.canvas));
    for (const row of report.rows) {
      console.log(`${row.visible ? "on " : "off"} ${row.name.padEnd(22)} colors=${JSON.stringify(row.colors)} y=${JSON.stringify(row.worldY)} screen=${JSON.stringify(row.screen)} ${row.onScreen ? "" : "(屏幕外)"}`);
    }
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
