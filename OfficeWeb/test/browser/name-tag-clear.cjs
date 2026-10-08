// 名字牌不能压帽子（用户 2026-09-28：「名字挡着帽子了 提高一下字」）。
// 戴上最高的那顶（派对帽）量：牌子中点必须在"帽子顶"之上；每种帽子都出一张图。
//   node test/browser/name-tag-clear.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");
const assert = require("node:assert/strict");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/tag-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1100, height: 820 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "帽子", password: "qa" } });
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
    const onboarding = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
    if (await onboarding.count()) {
      await page.getByRole("button", { name: "就这样，进空间" }).click();
      await page.waitForTimeout(400);
    }
    await page.waitForTimeout(4000);

    /** 牌子中点与"头顶最高点"的世界 Y，都在角色根的局部坐标里比。 */
    const measure = () => page.evaluate(() => {
      const debug = window.__officeDebug;
      const root = debug.avatar.root;
      const V = debug.__camera.position.constructor;
      root.updateMatrixWorld(true);
      const sprite = root.children.find(c => c.isSprite)
        ?? (() => { let found = null; root.traverse(o => { if (o.isSprite) found = o; }); return found; })();
      const tag = new V(); sprite.getWorldPosition(tag);
      let crown = -Infinity;
      root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.visible === false || o.isSprite) return;
        const g = o.geometry;
        if (!g) return;
        const pos = g.attributes?.position;
        if (!pos) return;
        // 蒙皮网格要按"蒙完"的位置量，否则量到的不是画面上那个高度。
        for (let i = 0; i < pos.count; i += 3) {
          const p = new V();
          if (typeof o.getVertexPosition === "function") o.getVertexPosition(i, p);
          else p.set(pos.getX(i), pos.getY(i), pos.getZ(i));
          p.applyMatrix4(o.matrixWorld);
          if (p.y > crown) crown = p.y;
        }
      });
      return { tagY: +tag.y.toFixed(3), crownY: +crown.toFixed(3),
        state: debug.avatar.getState(), tags: debug.nameTags };
    });

    const setHat = hat => page.evaluate(h => {
      window.__officeDebug.avatar.applyAppearance({ color: "kraft",
        accessories: { glasses: "none", hair: "none", beard: "none", hat: h } });
    }, hat);

    for (const hat of ["none", "cap", "tophat", "beanie", "straw", "party", "beret"]) {
      await setHat(hat);
      await page.waitForTimeout(700);
      const m = await measure();
      const clear = +(m.tagY - m.crownY).toFixed(3);
      console.log(`帽子 ${hat.padEnd(7)} 牌子中点 y=${m.tagY}  头顶最高点 y=${m.crownY}  净空 ${clear}`);
      assert.ok(clear > 0.05, `帽子 ${hat}：名字牌压到帽子了（净空 ${clear}）`);
      // 把镜头拉到角色正面拍一张，用于目视。
      await page.evaluate(() => {
        const debug = window.__officeDebug;
        const s = debug.avatar.getState();
        const V = debug.__camera.position.constructor;
        const target = new V(s.x, 1.0, s.z);
        const camera = debug.__camera;
        camera.position.set(target.x + Math.sin(s.rot + Math.PI) * 3.2, 1.45,
          target.z + Math.cos(s.rot + Math.PI) * 3.2);
        camera.lookAt(target);
        const controls = debug.controls?.();
        if (controls?.target) { controls.target.set(target.x, target.y, target.z); controls.update?.(); }
      });
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(ROOT, `Build/name-tag-${hat}.png`),
        clip: { x: 240, y: 60, width: 520, height: 520 } });
    }
    console.log("每种帽子的净空都为正 —— 名字牌不会压帽子");

    // 坐着的姿势也要过一遍（坐下来板子/帽子的高度完全不同）。
    await setHat("party");
    await page.evaluate(() => window.__officeDebug.avatar.sit(0));
    await page.waitForFunction(() => window.__officeDebug.avatar.getState().sitting === true,
      null, { timeout: 40000 }).catch(() => console.log("WARN 没坐下"));
    await page.waitForTimeout(1200);
    const seated = await measure();
    console.log(`坐姿 + 派对帽 牌子中点 y=${seated.tagY}  头顶最高点 y=${seated.crownY}`,
      ` 净空 ${(seated.tagY - seated.crownY).toFixed(3)}`);
    assert.ok(seated.tagY - seated.crownY > 0.05,
      `坐姿下名字牌压到帽子了（净空 ${(seated.tagY - seated.crownY).toFixed(3)}）`);
    await page.screenshot({ path: path.join(ROOT, "Build/name-tag-seated.png"),
      clip: { x: 240, y: 60, width: 520, height: 520 } });
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
