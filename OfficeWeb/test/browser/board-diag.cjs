// 快速诊断：运行时换配色，板身到底有没有变（把识别出来的材质槽都列出来）。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

const dump = () => {
  const rows = [];
  window.__officeDebug.avatar.root.traverse(o => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (o.parent?.isBone) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const vc = o.geometry?.getAttribute?.("color");
    rows.push({
      name: o.name, verts: o.geometry?.attributes?.position?.count ?? 0,
      mats: mats.map(m => ({ n: m?.name, c: m?.color?.getHexString?.(), vc: m?.vertexColors === true })),
      vertexColour: vc ? [vc.getX(0), vc.getY(0), vc.getZ(0)]
        .map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("") : null,
    });
  });
  return rows.filter(r => !r.name.startsWith("头发") && !r.name.startsWith("胡子")
    && !r.name.startsWith("帽子") && r.name !== "眼镜");
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/diag-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 780 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "诊断", password: "qa" } });
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
    await page.waitForTimeout(2000);
    console.log("== 每个材质在这个网格里出现在哪些面（按网格分别统计） ==");
    const detail = await page.evaluate(() => {
      const out = {};
      window.__officeDebug.avatar.root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;
        if (!/^(立方体|RULER)/.test(o.name)) return;
        const geo = o.geometry;
        const groups = (geo.groups || []).map(g => ({ start: g.start, count: g.count, materialIndex: g.materialIndex }));
        const mats = (Array.isArray(o.material) ? o.material : [o.material])
          .map((m, i) => ({ index: i, name: m?.name, color: m?.color?.getHexString?.() }));
        out[o.name] = { verts: geo.attributes.position.count, groups, mats };
      });
      return out;
    });
    console.log(JSON.stringify(detail, null, 1));
    console.log("== 打开时 ==");
    for (const r of await page.evaluate(dump)) console.log(JSON.stringify(r));
    await page.locator('button[aria-label="设置"]').click();
    await page.locator('.character-setting .color-grid button[aria-label="藏蓝"]').click();
    await page.waitForTimeout(600);
    console.log("== 换藏蓝后 ==");
    for (const r of await page.evaluate(dump)) console.log(JSON.stringify(r));
    console.log("appearance =", JSON.stringify(await page.evaluate(() =>
      window.__officeDebug.avatar.character?.appearance)));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
