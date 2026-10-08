// 量角色身上每块网格的世界包围盒：看"腿"到底在哪、离身体多远。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/legpos-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 780 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "腿位", password: "qa" } });
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
    const rows = await page.evaluate(() => {
      const V = window.__officeDebug.__camera.position.constructor;
      const out = [];
      window.__officeDebug.avatar.root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
        for (let i = 0; i < pos.count; i += 7) {
          const p = new V(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(o.matrixWorld);
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
        }
        const bones = o.isSkinnedMesh ? Array.from({ length: 4 }, (_, i) => i) : [];
        out.push({
          name: o.name,
          mats: (Array.isArray(o.material) ? o.material : [o.material]).map(m => m?.name),
          world: {
            x: [+minX.toFixed(2), +maxX.toFixed(2)],
            y: [+minY.toFixed(2), +maxY.toFixed(2)],
            z: [+minZ.toFixed(2), +maxZ.toFixed(2)],
          },
          skinned: Boolean(o.isSkinnedMesh),
        });
      });
      const root = window.__officeDebug.avatar.root.position;
      return { root: [+root.x.toFixed(2), +root.y.toFixed(2), +root.z.toFixed(2)], out };
    });
    console.log("角色 root:", JSON.stringify(rows.root));
    for (const r of rows.out) {
      console.log(`${r.name.padEnd(14)} mats=${JSON.stringify(r.mats)} skinned=${r.skinned} world x=${JSON.stringify(r.world.x)} y=${JSON.stringify(r.world.y)} z=${JSON.stringify(r.world.z)}`);
    }
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
