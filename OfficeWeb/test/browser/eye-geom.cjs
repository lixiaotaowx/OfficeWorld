// 量"眼睛"两个网格的真实几何：世界包围盒 + 逐段高度上的截面宽度，判断它们是眼球还是整条腿。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/geom-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 900, height: 700 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "几何", password: "qa" } });
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
    // 站着量最干净（坐姿会改骨骼）
    await page.waitForTimeout(2500);
    const geo = await page.evaluate(() => {
      const V = window.__officeDebug.__camera.position.constructor;
      const out = [];
      const root = window.__officeDebug.avatar.root;
      root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        if (!mats.some(m => /材质\.00[16]/.test(m?.name ?? ""))) return;
        const pos = o.geometry.attributes.position;
        let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        // 每 0.1m 一段的截面点云，用来看形状
        const slices = {};
        for (let i = 0; i < pos.count; i++) {
          const p = new V(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(o.matrixWorld);
          minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
          minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
          minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
          const key = (Math.round(p.y / 0.1) * 0.1).toFixed(1);
          const s = slices[key] ?? (slices[key] = { n: 0, minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
          s.n++;
          s.minX = Math.min(s.minX, p.x); s.maxX = Math.max(s.maxX, p.x);
          s.minZ = Math.min(s.minZ, p.z); s.maxZ = Math.max(s.maxZ, p.z);
        }
        const summary = Object.entries(slices).sort((a, b) => Number(b[0]) - Number(a[0]))
          .map(([y, s]) => `${y}: dx=${(s.maxX - s.minX).toFixed(2)} dz=${(s.maxZ - s.minZ).toFixed(2)} n=${s.n}`);
        out.push({ name: o.name, mats: mats.map(m => m?.name), color: mats[0]?.color?.getHexString?.(),
          verts: pos.count,
          world: { x: [+minX.toFixed(2), +maxX.toFixed(2)], y: [+minY.toFixed(2), +maxY.toFixed(2)], z: [+minZ.toFixed(2), +maxZ.toFixed(2)] },
          slices: summary });
      });
      return out;
    });
    for (const row of geo) {
      console.log(`\n=== ${row.name}  mats=${JSON.stringify(row.mats)} color=#${row.color} verts=${row.verts}`);
      console.log(`    world x=${JSON.stringify(row.world.x)} y=${JSON.stringify(row.world.y)} z=${JSON.stringify(row.world.z)}`);
      console.log("    " + row.slices.join("\n    "));
    }
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
