// 量"走路有没有悬空 / 坐下对不对"：脚骨与世界地面、模型最低点的关系。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

const measure = () => {
  const debug = window.__officeDebug;
  const avatar = debug.avatar;
  const root = avatar.root;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const V = debug.__camera.position.constructor;
  const at = name => {
    const b = bones[name];
    if (!b) return null;
    const v = new V(); b.getWorldPosition(v);
    return [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
  };
  // 网格最低点（世界）
  let low = Infinity;
  root.traverse(o => {
    if (!o.isMesh && !o.isSkinnedMesh) return;
    if (o.visible === false) return;
    const pos = o.geometry?.attributes?.position;
    if (!pos) return;
    for (let i = 0; i < pos.count; i += 5) {
      const p = new V(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(o.matrixWorld);
      if (p.y < low) low = p.y;
    }
  });
  return {
    state: avatar.getState(),
    feet: { L: at("mixamorigLeftFoot"), R: at("mixamorigRightFoot") },
    hips: at("mixamorigHips"),
    meshLowestY: +low.toFixed(3),
    modelY: +(avatar.character?.model.position.y ?? 0).toFixed(3),
    groundY: +(avatar.character?.groundY ?? 0).toFixed(3),
    sit: avatar.sitDiagnostics ? avatar.sitDiagnostics() : null,
  };
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/float-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 780 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "悬空", password: "qa" } });
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
    // 先关掉首登的捏人面板，免得挡住
    const onboarding = page.locator('.seat-picker-hint[aria-label="设置我的角色"]');
    if (await onboarding.count()) {
      await page.getByRole("button", { name: "就这样，进空间" }).click();
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(2200);
    console.log("站姿:", JSON.stringify(await page.evaluate(measure)));

    // 原地走：按 W 一小会儿，取几帧的最低点
    await page.mouse.click(500, 400);
    await page.keyboard.down("KeyW");
    const walking = [];
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(180);
      walking.push(await page.evaluate(measure));
    }
    await page.keyboard.up("KeyW");
    console.log("走路各帧 meshLowestY:", walking.map(w => w.meshLowestY).join(", "));
    console.log("走路各帧 脚Y:", walking.map(w => `${w.feet.L?.[1]}/${w.feet.R?.[1]}`).join(", "));

    await page.evaluate(() => window.__officeDebug.avatar.sit(0));
    await page.waitForFunction(() => window.__officeDebug.avatar.getState().sitting === true,
      null, { timeout: 40000 }).catch(() => console.log("WARN 没坐下"));
    await page.waitForTimeout(1500);
    const seated = await page.evaluate(measure);
    console.log("坐姿:", JSON.stringify(seated));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
