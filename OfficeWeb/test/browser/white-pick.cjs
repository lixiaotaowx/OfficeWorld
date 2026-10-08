// 用射线拾取回答"角色身边地上那两个白片到底是什么"：
// 在角色脚下的屏幕区域打网格点，把命中的物体名/材质/颜色列出来。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/whitepick-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1100, height: 800 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "拾取白片", password: "qa" } });
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
    // 站着量：坐下会挡住下半身
    await page.waitForTimeout(2200);

    const result = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const canvas = document.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();
      const size = { width: canvas.clientWidth, height: canvas.clientHeight };
      // 先把角色投影到屏幕：取它 root 的世界位置 + 脚高
      const V = debug.__camera.position.constructor;
      const root = debug.avatar.root;
      root.updateMatrixWorld(true);
      const centre = new V();
      root.getWorldPosition(centre);
      const feet = new V(centre.x, 0.05, centre.z);
      const toScreen = p => {
        const q = p.clone().project(debug.__camera);
        return [Math.round((q.x * 0.5 + 0.5) * size.width), Math.round((-q.y * 0.5 + 0.5) * size.height)];
      };
      const [fx, fy] = toScreen(feet);
      const [cx, cy] = toScreen(new V(centre.x, 1.0, centre.z));
      const samples = [];
      for (let dx = -140; dx <= 140; dx += 20) {
        for (let dy = -60; dy <= 120; dy += 20) {
          const x = fx + dx, y = fy + dy;
          if (x < 1 || y < 1 || x > size.width - 1 || y > size.height - 1) continue;
          const pick = debug.__pick(x, y);
          if (pick?.hit) samples.push({ x, y, ...pick });
        }
      }
      const tally = new Map();
      for (const s of samples) {
        const key = `${s.hit}|${(s.material || []).join(",")}|${(s.color || []).join(",")}`;
        const rec = tally.get(key) ?? { hit: s.hit, material: s.material, color: s.color, n: 0, points: [] };
        rec.n++;
        if (rec.points.length < 3) rec.points.push([s.x, s.y]);
        tally.set(key, rec);
      }
      return { canvas: size, feetScreen: [fx, fy], avatarScreen: [cx, cy],
        tally: [...tally.values()].sort((a, b) => b.n - a.n) };
    });
    console.log("画布:", JSON.stringify(result.canvas), " 角色脚下屏幕坐标:", JSON.stringify(result.feetScreen));
    for (const row of result.tally) {
      console.log(`${String(row.n).padStart(3)} 次  ${row.hit}  材质=${JSON.stringify(row.material)} 颜色=${JSON.stringify(row.color)}  采样点=${JSON.stringify(row.points)}`);
    }
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
