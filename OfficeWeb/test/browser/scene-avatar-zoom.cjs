// 目视排查：把角色在场景里的样子放大截出来（3 倍像素密度），看它周围有什么。
//   node test/browser/scene-avatar-zoom.cjs [秒数]
// 出图：Build/avatar-zoom.png（角色附近）、Build/avatar-scene.png（整屏）
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const wait = Number(process.argv[2] || 9);
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
    const context = await browser.newContext({ viewport: { width: 1100, height: 820 },
      deviceScaleFactor: 3 });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "观察", password: "qa" } });
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
    const onboarding = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
    if (await onboarding.count()) {
      await page.getByRole("button", { name: "就这样，进空间" }).click();
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(wait * 1000);
    await page.screenshot({ path: path.join(ROOT, "Build/avatar-scene.png") });
    const box = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const V = debug.__camera.position.constructor;
      const root = debug.avatar.root;
      root.updateMatrixWorld(true);
      const rect = document.querySelector("canvas").getBoundingClientRect();
      const size = { width: document.querySelector("canvas").clientWidth,
        height: document.querySelector("canvas").clientHeight };
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i += 3) {
          const p = new V(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(o.matrixWorld).project(debug.__camera);
          const sx = (p.x * 0.5 + 0.5) * size.width, sy = (-p.y * 0.5 + 0.5) * size.height;
          minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
        }
      });
      const state = debug.avatar.getState?.() ?? null;
      return { x: rect.x + minX, y: rect.y + minY, width: maxX - minX, height: maxY - minY, state };
    });
    console.log("角色状态:", JSON.stringify(box.state));
    const pad = 60;
    const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad),
      width: Math.min(1100 - Math.max(0, box.x - pad), box.width + pad * 2),
      height: Math.min(820 - Math.max(0, box.y - pad), box.height + pad * 2) };
    console.log("裁切:", JSON.stringify(clip));
    await page.screenshot({ path: path.join(ROOT, "Build/avatar-zoom.png"), clip });

    // 绕着角色拍四张（近景），看坐姿/悬空/周围有什么。
    const angles = [["front", 0], ["right", 90], ["back", 180], ["left", 270]];
    for (const [name, deg] of angles) {
      const moved = await page.evaluate(({ deg }) => {
        const debug = window.__officeDebug;
        const state = debug.avatar.getState();
        const THREE = debug.__camera.position.constructor;
        const target = new THREE(state.x, 0.75, state.z);
        const a = (state.rot || 0) + (deg * Math.PI) / 180;
        // 角色朝向由 rot 决定：从"正面"看就是站在它面朝的那一侧。
        const dist = 3.4;
        const camera = debug.__camera;
        camera.position.set(target.x + Math.sin(a) * dist, target.y + 0.25,
          target.z + Math.cos(a) * dist);
        camera.lookAt(target);
        const controls = debug.controls?.();
        if (controls?.target) { controls.target.set(target.x, target.y, target.z); controls.update?.(); }
        return { camera: camera.position.toArray().map(v => +v.toFixed(2)) };
      }, { deg });
      await page.waitForTimeout(350);
      const file = path.join(ROOT, `Build/avatar-${name}.png`);
      await page.screenshot({ path: file, clip: { x: 20, y: 90, width: 690, height: 640 } });
      console.log(`拍了 ${name}`, JSON.stringify(moved));
    }

    // 角色周围 1.8m 内都有什么（找"两个白色的东西""红色的东西"）。
    const near = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const state = debug.avatar.getState();
      const V = debug.__camera.position.constructor;
      const rows = [];
      debug.__scene.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        const p = new V();
        o.getWorldPosition(p);
        const dist = Math.hypot(p.x - state.x, p.z - state.z);
        if (dist > 1.8) return;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        rows.push({ name: o.name, dist: +dist.toFixed(2), y: +p.y.toFixed(2),
          visible: o.visible !== false,
          mats: list.map(m => `${m?.name ?? "?"}:${m?.color?.getHexString?.() ?? "?"}`).join(",") });
      });
      return rows.sort((a, b) => a.dist - b.dist);
    });
    console.log("角色周围 1.8m 内的物体：");
    for (const row of near) console.log("  ", JSON.stringify(row));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
