// 探针：板身、刻印、腿（与眼睛共用材质的那块）是不是都跟着配色变了，眼睛有没有被误改。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

const snapshot = () => {
  const out = {};
  window.__officeDebug.avatar.root.traverse(o => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (o.parent?.isBone) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    // 顶点色第一个顶点的值（腿是这么上色的；材质颜色保持白色不二次变暗）
    const color = o.geometry?.getAttribute?.("color");
    const vertex = color ? [color.getX(0), color.getY(0), color.getZ(0)]
      .map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("") : null;
    out[o.name] = {
      visible: o.visible !== false,
      vertexColor: vertex,
      mats: mats.map(m => ({ name: m?.name, color: m?.color?.getHexString?.(), vertexColors: m?.vertexColors === true })),
    };
  });
  return out;
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/leg-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 780 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "腿色", password: "qa" } });
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
    await page.waitForTimeout(2200);
    const pick = rows => Object.fromEntries(Object.entries(rows)
      .filter(([name]) => ["立方体002", "立方体002_1", "立方体002_2", "立方体002_3"].includes(name))
      .map(([name, row]) => [name, { vc: row.vertexColor, color: row.mats[0]?.color,
        useVC: row.mats[0]?.vertexColors }]));
    console.log("默认（原色 d9a441）:", JSON.stringify(pick(await page.evaluate(snapshot))));
    await page.locator('button[aria-label="设置"]').click();
    await page.locator('.character-setting .color-grid button[aria-label="藏蓝"]').click();
    await page.waitForTimeout(500);
    console.log("换藏蓝（3f5680）:", JSON.stringify(pick(await page.evaluate(snapshot))));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
