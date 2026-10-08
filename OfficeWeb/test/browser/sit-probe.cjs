// 探针：坐下之后，手脚到底动没动（换 Mixamo 骨架后最大的风险点）。
//
// 判据：坐姿会把大腿/小腿/上臂/前臂按姿势表转过去，还按"键盘位置"给手做 IK。
// 所以量**手腕相对髋部的位置**与**膝盖相对髋部的位置**——站着的时候手在身体两侧、
// 膝在髋正下方；坐下来手要伸到前方键盘上、膝要折到前面去。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

/** GLTFLoader 把 `mixamorig:Hips` 存成 `mixamorigHips`（冒号去掉）。 */
const measure = () => {
  const avatar = window.__officeDebug?.avatar;
  const root = avatar?.root;
  if (!root) return null;
  const bones = {};
  root.traverse(o => { if (o.isBone) bones[o.name] = o; });
  const at = (name) => {
    const bone = bones[name];
    if (!bone) return null;
    const v = new (window.__officeDebug.__camera.position.constructor)();
    bone.getWorldPosition(v);
    return [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
  };
  const state = typeof avatar.getState === "function" ? avatar.getState() : {};
  return {
    state,
    hips: at("mixamorigHips"), head: at("mixamorigHead"),
    wristL: at("mixamorigLeftHand"), wristR: at("mixamorigRightHand"),
    kneeL: at("mixamorigLeftLeg"), kneeR: at("mixamorigRightLeg"),
    footL: at("mixamorigLeftFoot"), footR: at("mixamorigRightFoot"),
  };
};

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/sit-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "坐姿", password: "qa" } });
    await context.request.post(base + "/api/auth/role", { headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
    // 先不占座：进页面后由页面自己走"点椅子入座"的路径
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => { socket.disconnect(); resolve(); });
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
    const standing = await page.evaluate(measure);
    console.log("STANDING", JSON.stringify({ state: standing.state, hips: standing.hips,
      wristL: standing.wristL, kneeL: standing.kneeL, head: standing.head }));
    // 直接让服务端把我们放到 0 号工位：走 /api 之外的 socket 已经在页面里，这里用页面自己的动作。
    // 最省事的是点场景里的椅子——但要命中射线，所以改用"重新选座 + 点椅子"太脆；
    // 这里直接调页面的 debug 动作：avatar.sit(0)。
    const sat = await page.evaluate(async () => {
      const avatar = window.__officeDebug.avatar;
      await avatar.sit(0);
      return true;
    });
    console.log("sit() called:", sat);
    // 走过去要几秒，等它真的坐下（sitting === true）再量。
    await page.waitForFunction(() => window.__officeDebug.avatar.getState().sitting === true,
      null, { timeout: 30000 }).catch(() => console.log("WARN 没有进入 sitting 状态"));
    await page.waitForTimeout(1500);
    const seated = await page.evaluate(measure);

    const dist = (a, b) => a && b ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : null;
    console.log("STANDING", JSON.stringify({ state: standing.state, hips: standing.hips,
      wristL: standing.wristL, wristY: standing.wristL?.[1], kneeL: standing.kneeL }));
    console.log("SEATED  ", JSON.stringify({ state: seated.state, hips: seated.hips,
      wristL: seated.wristL, wristR: seated.wristR, kneeL: seated.kneeL, footL: seated.footL }));
    console.log("手腕-髋 距离:", dist(seated.wristL, seated.hips), "（站姿", dist(standing.wristL, standing.hips), "）");
    console.log("膝-髋 距离:", dist(seated.kneeL, seated.hips), "（站姿", dist(standing.kneeL, standing.hips), "）");
    console.log("手腕高度:", seated.wristL?.[1], "（站姿", standing.wristL?.[1], "）");
    console.log("sitDiagnostics:", JSON.stringify(
      await page.evaluate(() => window.__officeDebug.avatar.sitDiagnostics())));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
