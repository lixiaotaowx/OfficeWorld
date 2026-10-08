// 验证「从没捏过 → 弹一次 → 确认后不再弹」这条链路（用户 2026-09-28 的要求）。
//
// 做法：注册一个账号、占好座（这样只剩捏人面板这一件事），然后
//   打开 → 应该弹捏人面板 → 选颜色+配件 → 确认 → 面板消失、账号里记下外观 →
//   **刷新**（本机缓存还在，但更关键的是服务端记了「捏过了」）→ 不再弹、且沿用所选外观。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/onboard-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1200, height: 860 },
      permissions: ["microphone"] });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "新人甲", password: "qa" } });
    await context.request.post(base + "/api/auth/role",
      { headers: { origin: base }, data: { role: "employee" } });
    // 先把座位占掉：只剩"捏人面板"这一件事要看
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
    });
    const before = (await (await context.request.get(base + "/api/auth/me",
      { headers: { origin: base } })).json()).user;
    assert.equal(before.lookConfirmed, false, "新账号应该是「没捏过」");

    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(1500);

    const dialog = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
    assert.equal(await dialog.count(), 1, "从没捏过的账号登录后应该弹出捏人面板");
    assert.equal(await dialog.locator(".color-grid button").count(), 10, "配色应该有 10 个");
    await dialog.locator('.color-grid button[aria-label="薄荷"]').click();
    await dialog.locator('.look-steps button', { hasText: "2 配件" }).click();
    await dialog.locator('.accessory-tabs button', { hasText: '帽子' }).click();
    await dialog.locator('.accessory-row', { hasText: "帽子" }).locator("button", { hasText: "草帽" }).click();
    await page.getByRole("button", { name: "就这样，进空间" }).click();
    await page.waitForTimeout(900);
    assert.equal(await dialog.count(), 0, "确认后面板要消失");

    const after = (await (await context.request.get(base + "/api/auth/me",
      { headers: { origin: base } })).json()).user;
    assert.equal(after.lookConfirmed, true, "确认后服务端要记「捏过了」");
    assert.equal(after.appearance?.color, "mint", "服务端要存下选的颜色");
    assert.equal(after.appearance?.accessories?.hat, "straw", "服务端要存下选的配件");

    // 刷新：不该再弹，而且沿用所选外观
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(1500);
    assert.equal(await dialog.count(), 0, "捏过的账号刷新后不该再弹");
    const look = await page.evaluate(() => window.__officeDebug.avatar.character?.appearance ?? null);
    assert.equal(look?.color, "mint", "要沿用账号里存的外观：" + JSON.stringify(look));
    assert.equal(look?.accessories?.hat, "straw", "配件也要沿用");
    assert.deepEqual(errors, []);
    console.log("PASS 从没捏过弹一次（薄荷+草帽）→ 服务端记下 → 刷新不再弹，且沿用所选外观");
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
