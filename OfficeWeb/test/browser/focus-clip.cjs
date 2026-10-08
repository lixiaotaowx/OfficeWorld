// 近距离裁切不能跟着视距无限变大。
//
// 用户报障（2026-09-15）："有些时候视野会被突然裁掉一大半，刷新一下就好了"。
// 复现：先点工位（镜头对到工位，会启用"前景裁切"），再滚轮缩小 —— 旧公式
// `near = depth - 1.25` 会随距离一起长大，实测距离 12m 时 near = 10.7m，于是
// 相机前 10.7m 内的整个办公室都被裁掉。刷新后 near 回到 0.1 才恢复正常。
//
// 本用例锁住它：缩小后 near 必须仍有界，切回总览必须回到 0.1。
//
// Run from the repository root:  node OfficeWeb/test/browser/focus-clip.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

/** The near plane while a workstation is focused; it may never exceed this. */
const NEAR_LIMIT = 1.3;

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.FOCUS_CLIP_BUILD || "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.resolve("Build/focus-clip-qa-"));
  const server = createOfficeServer({ statePath: dir + "/state.json", accountsPath: dir + "/accounts.json",
    chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
    const register = await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "裁切回归", password: "qa" } });
    assert.equal(register.status(), 200);
    const cookie = register.headers()["set-cookie"].split(";")[0];
    await context.request.post(base + "/api/auth/role",
      { headers: { origin: base, cookie }, data: { role: "employee" } });
    // Hold desk 0 so the directory has an occupied seat to click.
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base, cookie } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0,
        result => { socket.disconnect(); result.ok ? resolve() : reject(Error(result.error)); }));
    });
    await context.addCookies([{ name: "office_session", value: cookie.split("=")[1],
      url: base, httpOnly: true, sameSite: "Strict" }]);
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 60000 });
    const state = () => page.evaluate(() => {
      const debug = window.__officeDebug, camera = debug.__camera;
      const target = debug.controls?.()?.target;
      return { near: +camera.near.toFixed(3),
        distance: target ? +camera.position.distanceTo(target).toFixed(2) : null };
    });

    const start = await state();
    assert(Math.abs(start.near - 0.1) < 0.001, `初始 near 应为 0.1，实际 ${start.near}`);

    // Point the camera at the desk (the same call the directory click makes).
    await page.locator(".seat.is-online").first().click();
    await page.waitForFunction(() => {
      const debug = window.__officeDebug, camera = debug.__camera;
      const target = debug.controls?.()?.target;
      return target && camera.position.distanceTo(target) < 4;
    }, null, { timeout: 20000 });
    const focused = await state();
    assert(focused.near > 0.5, `对焦工位时应启用前景裁切，实际 near=${focused.near}`);

    // Zoom out: the clip must stay bounded instead of eating the whole office.
    // The further out the camera goes, the worse the old rule was.
    const box = await page.locator(".stage").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 9; i++) { await page.mouse.wheel(0, 800); await page.waitForTimeout(300); }
    await page.waitForTimeout(900);
    const zoomed = await state();
    assert(zoomed.distance > 18, `缩小没有生效（距离只有 ${zoomed.distance}m）`);
    assert(zoomed.near <= NEAR_LIMIT,
      `缩小后 near=${zoomed.near}（距离 ${zoomed.distance}m）：前景裁切跟着视距放大了，会把办公室裁掉`);
    // How much of the foreground the old, unbounded rule would have cut away
    // here: sample points along the line from the camera to the focused desk
    // (excluding the 1.25m the rule is meant to preserve) and count how many sit
    // behind the near plane. View-space forward depth = -(view z).
    const cut = await page.evaluate(() => {
      const debug = window.__officeDebug, camera = debug.__camera;
      const m = camera.matrixWorldInverse.elements;
      const depth = (p) => -(m[2] * p.x + m[6] * p.y + m[10] * p.z + m[14]);
      const target = debug.controls?.()?.target;
      if (!target) return null;
      const line = target.clone().sub(camera.position);
      const length = line.length();
      const keep = Math.max(0, length - 1.25) / length;
      const viewDepth = length;
      const oldNear = Math.max(0.1, viewDepth - 1.25);
      const samples = 20;
      const points = [];
      for (let i = 1; i <= samples; i++) {
        points.push(camera.position.clone().addScaledVector(line, keep * (i / (samples + 1))));
      }
      return { samples, oldNear: +oldNear.toFixed(2), near: +camera.near.toFixed(2),
        cutByOldRule: points.filter(p => depth(p) < oldNear).length,
        cutByCurrentRule: points.filter(p => depth(p) < camera.near).length };
    });
    await page.screenshot({ path: "Build/focus-clip-zoomed-out.png" });

    // Switching views returns the camera to the plain 0.1 near plane.
    await page.locator(".view-tabs button", { hasText: "空间总览" }).click();
    await page.waitForFunction(() => Math.abs(window.__officeDebug.__camera.near - 0.1) < 0.001,
      null, { timeout: 20000 });
    const overview = await state();
    assert.deepEqual(errors, []);
    fs.writeFileSync("Build/focus-clip-evidence.json", JSON.stringify({ start, focused, zoomed, cut,
      overview, nearLimit: NEAR_LIMIT, screenshot: "Build/focus-clip-zoomed-out.png", errors }, null, 2));
    console.log(`PASS: 对焦工位 near=${focused.near}；缩小到 ${zoomed.distance}m 后 near=${zoomed.near}（上限 ${NEAR_LIMIT}）；`
      + `旧规则在该视角会把相机到工位之间 ${cut.cutByOldRule}/${cut.samples} 段前景裁掉，现在 ${cut.cutByCurrentRule}/${cut.samples}；切回总览 near=${overview.near}`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
