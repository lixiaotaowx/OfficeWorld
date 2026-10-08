// 两个真实浏览器：甲（藏蓝 + 礼帽）与乙（默认，不戴任何配件），互相看对方画成什么样。
//   node test/browser/two-avatars.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

/** 页面上每个人（自己 + 远端）的头像外观读数。 */
const readAvatars = () => {
  const out = { mine: null, remotes: [] };
  const collect = (root, tag) => {
    const worn = [];
    let body = null;
    root.traverse(o => {
      if (!o.isMesh && !o.isSkinnedMesh) return;
      if (o.parent?.isBone) return;
      if (o.visible && o.material?.name?.endsWith("_材质")) worn.push(o.name);
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) if (m?.name === "材质.017") body = m.color.getHexString();
    });
    return { tag, body, worn };
  };
  const debug = window.__officeDebug;
  out.mine = collect(debug.avatar.root, "me");
  for (const entry of debug.remotes.snapshot()) {
    out.remotes.push({ id: entry.id, kind: entry.kind, sitting: entry.sitting });
  }
  // 远端根节点：逐个找
  const scene = debug.__scene;
  scene.children.forEach(child => {
    if (typeof child.name === "string" && child.name.startsWith("remote:")) {
      out.remotes.push(collect(child, child.name));
    }
  });
  return out;
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/two-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    async function user(name, seat) {
      const context = await browser.newContext({ viewport: { width: 1000, height: 780 },
        permissions: ["microphone"] });
      await context.request.post(base + "/api/auth/register",
        { headers: { origin: base }, data: { name, password: "qa" } });
      await context.request.post(base + "/api/auth/role",
        { headers: { origin: base }, data: { role: "employee" } });
      const cookies = await context.cookies(base);
      await new Promise((resolve, reject) => {
        const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
          cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
        socket.on("connect", () => socket.emit("join", {}));
        socket.once("seats", () => socket.emit("seat", seat, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
      });
      await context.route(base + "/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
        const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
        if (!fs.existsSync(file)) return route.continue();
        await route.fulfill({ path: file });
      });
      const page = await context.newPage();
      page.on("pageerror", e => console.log("PAGEERROR", name, e.message));
      await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
      const onboarding = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
      if (await onboarding.count()) {
        await page.getByRole("button", { name: "就这样，进空间" }).click();
        await page.waitForTimeout(400);
      }
      return page;
    }

    const a = await user("甲", 0);
    const b = await user("乙", 1);
    await a.waitForTimeout(2500);

    // 甲：藏蓝 + 礼帽
    await a.locator('button[aria-label="设置"]').click();
    await a.locator('.character-setting .color-grid button[aria-label="藏蓝"]').click();
    await a.locator('.character-setting .look-steps button', { hasText: "2 配件" }).click();
    await a.locator('.character-setting .accessory-row', { hasText: "帽子" })
      .locator("button", { hasText: "礼帽" }).click();
    await a.getByRole("button", { name: "关闭", exact: true }).click();
    await a.waitForTimeout(2500);

    console.log("=== 甲（藏蓝+礼帽）自己看到的 ===");
    console.log(JSON.stringify(await a.evaluate(readAvatars), null, 1));
    console.log("=== 乙（默认无配件）看到的 ===");
    console.log(JSON.stringify(await b.evaluate(readAvatars), null, 1));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
