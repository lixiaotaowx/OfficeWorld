// Actual colour/hat pixels, settings categories, and responsive bounds.
// LIVE_SETTINGS=1 fetches deployed static assets with isolated test accounts.
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
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/panel-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    let failedModelRequests = 0;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "面板", password: "qa" } });
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
      if (process.env.FAIL_FIRST_MODEL === '1' && url.pathname.endsWith('/ruler.glb') && failedModelRequests === 0) {
        failedModelRequests++;
        return route.abort('failed');
      }
      if (process.env.LIVE_SETTINGS === '1') {
        const response = await fetch('https://115.159.43.237' + url.pathname + url.search);
        return route.fulfill({ status: response.status,
          contentType: response.headers.get('content-type') || 'application/octet-stream',
          body: Buffer.from(await response.arrayBuffer()) });
      }
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    const errors = [];
    const imageRequests = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (r.url().includes("/thumbnails/")) imageRequests.push(new URL(r.url()).pathname); });
    await page.goto(base + '/?debug=1', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.live-look')?.dataset.look);
    if (process.env.FAIL_FIRST_MODEL === '1') {
      assert.equal(failedModelRequests, 1);
      assert.equal(await page.locator('.live-look .look-loading').count(), 0);
      console.log('PASS first model request failed; preview recovered automatically');
    }
    const later = page.locator('.update-prompt').getByRole('button', { name: '稍后', exact: true });
    if (await later.isVisible()) await later.click();
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-onboarding.png') });
    await page.getByRole('button', { name: '就这样，进空间' }).click();
    await page.locator('button[aria-label="设置"]').click();
    await page.waitForFunction(() => document.querySelector('.settings-modal .live-look')?.dataset.look);
    const settings = page.locator('.settings-modal');
    const canvas = settings.locator('.live-look canvas');
    const before = await canvas.screenshot();
    await settings.getByRole('option', { name: '藏蓝', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.settings-modal .live-look')?.dataset.look.startsWith('navy|'));
    const navy = await canvas.screenshot();
    assert.ok(!before.equals(navy), 'colour changes actual rendered pixels');
    assert.equal(await settings.locator('.color-grid img').count(), 10);
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-colors.png') });
    await settings.getByRole('tab', { name: '2 配件' }).click();
    await settings.locator('.accessory-tabs').getByRole('button', { name: '帽子' }).click();
    await settings.getByRole('option', { name: '礼帽', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.settings-modal .live-look')?.dataset.look.includes('tophat'));
    assert.ok(!(await canvas.screenshot()).equals(navy), 'hat changes actual geometry');
    assert.ok((await settings.locator('.live-look').getAttribute('data-look')).startsWith('navy|'));
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-hat.png') });
    assert.equal(await settings.locator('.expression-picker').count(), 0);
    const preview = settings.locator('.dock-look-preview');
    await page.waitForFunction(() => [...document.querySelectorAll('.dock-look-preview img')]
      .length === 3 && [...document.querySelectorAll('.dock-look-preview img')]
      .every(img => img.complete && img.src.startsWith('data:image')));
    assert.equal(await preview.locator('button').count(), 0);
    await preview.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-dock-look.png') });
    for (const title of ['通知提醒', '文件接收', '画面与操作', '身份与工位']) {
      await settings.locator('.settings-nav').getByRole('button', { name: new RegExp(title) }).click();
      assert.equal(await settings.locator('.character-setting').count(), 0);
      assert.ok(await settings.getByRole('heading', { name: title, exact: true }).isVisible());
    }
    await settings.locator('.settings-nav').getByRole('button', { name: /画面与操作/ }).click();
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-display.png') });
    await settings.getByRole('checkbox').check();
    await settings.getByRole('checkbox').uncheck();
    await settings.locator('.settings-nav').getByRole('button', { name: /我的角色/ }).click();
    for (const width of [390, 720, 1280]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      const overflow = await settings.evaluate(el => [...el.querySelectorAll('.settings-content, .look-options')]
        .some(node => node.scrollWidth > node.clientWidth + 1));
      assert.equal(overflow, false, `no horizontal overflow at ${width}`);
      await page.screenshot({ path: path.join(ROOT, `Build/settings-${width}.png`) });
    }
    await page.keyboard.press('Escape');
    assert.equal(await settings.count(), 0);
    await page.screenshot({ path: path.join(ROOT, 'Build/settings-name-tags.png') });
    assert.deepEqual(errors, []);
    console.log('PASS real colour/hat pixels, five settings categories, pause toggle, responsive bounds, Escape');
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
