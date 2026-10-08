// 探针：从界面点配件，确认模型的显隐真的跟着变；并打印 avatar 的内部状态。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

const snap = () => {
  const avatar = window.__officeDebug?.avatar;
  const root = avatar?.root;
  const out = { accessories: {}, mats: {} };
  root?.traverse(o => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (o.name.startsWith("立方体")) {
      const list = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of list) if (m?.name?.startsWith("材质.")) out.mats[m.name] = m.color.getHexString();
    } else if (o.material?.name?.endsWith("_材质") || o.name === "眼镜") {
      out.accessories[o.name] = { visible: o.visible, color: o.material?.color?.getHexString?.() };
    }
  });
  return out;
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/wear-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "穿戴", password: "qa" } });
    await context.request.post(base + "/api/auth/role", { headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
    // 顺便看看服务端到底广播了什么外观
    const seen = [];
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.on("people", list => { for (const p of list) if (p.name === "穿戴") seen.push(p.appearance); });
      socket.once("seats", () => socket.emit("seat", 2, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
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
    console.log("server-broadcast:", JSON.stringify(seen.at(-1)));
    console.log("initial:", JSON.stringify(await page.evaluate(snap)));
    // 打开设置 → 第 2 步 → 点「长直发」
    await page.locator('button[aria-label="设置"]').click();
    await page.locator('.look-steps button:has-text("2 配件")').click();
    await page.locator('.accessory-row:has-text("头发") button:has-text("长直发")').click();
    await page.waitForTimeout(600);
    const afterHair = await page.evaluate(snap);
    console.log("after-长直发:", JSON.stringify(afterHair.accessories));
    await page.locator('.accessory-row:has-text("帽子") button:has-text("礼帽")').click();
    await page.locator('.accessory-row:has-text("胡子") button:has-text("络腮胡")').click();
    await page.locator('.accessory-row:has-text("眼镜") button:has-text("黑框眼镜")').click();
    await page.waitForTimeout(600);
    const afterAll = await page.evaluate(snap);
    console.log("worn-now:", JSON.stringify(Object.entries(afterAll.accessories).filter(([, v]) => v.visible)));
    // 换配色
    await page.locator('.look-steps button:has-text("1 配色")').click();
    await page.locator('.color-grid button[aria-label="藏蓝"]').click();
    await page.waitForTimeout(600);
    const afterColor = await page.evaluate(snap);
    console.log("mats-after-藏蓝:", JSON.stringify(afterColor.mats));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
