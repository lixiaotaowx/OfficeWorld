// 量「坐姿打字_Type」这条已授权动作：髋部在世界里是不是基本不动（能不能直接搬到工位上）。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/type-clip-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 900, height: 700 } });
    await context.request.post(base + "/api/auth/register", { headers: { origin: base },
      data: { name: "打字", password: "qa" } });
    await context.request.post(base + "/api/auth/role", { headers: { origin: base }, data: { role: "employee" } });
    const cookies = await context.cookies(base);
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
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
    await page.waitForTimeout(2000);
    const info = await page.evaluate(async () => {
      const avatar = window.__officeDebug.avatar;
      const character = avatar.character;
      const clip = character.action("坐姿打字_Type");
      const idle = character.idle;
      if (!clip) return { error: "没有 坐姿打字_Type" };
      character.mixer.stopAllAction();
      // 把模型摆到 root 原点，只演这条动作，量髋部与手的世界坐标
      character.model.position.set(0, 0, 0);
      avatar.root.position.set(0, 0, 0);
      clip.reset().play();
      clip.setEffectiveWeight(1);
      character.mixer.update(0);
      const names = ["mixamorigHips", "mixamorigHead", "mixamorigLeftHand", "mixamorigLeftFoot"];
      const bones = {};
      avatar.root.traverse(o => { if (o.isBone) bones[o.name] = o; });
      const at = name => {
        const b = bones[name];
        if (!b) return null;
        const v = new (window.__officeDebug.__camera.position.constructor)();
        b.getWorldPosition(v);
        return [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
      };
      const samples = [];
      for (let i = 0; i < 16; i++) {
        character.mixer.update(0.1);   // 走 1.7 秒，覆盖整条 41 帧（1.7s）
        avatar.root.updateMatrixWorld(true);
        samples.push({ hips: at("mixamorigHips"), hand: at("mixamorigLeftHand"), foot: at("mixamorigLeftFoot") });
      }
      const ys = samples.map(s => s.hips[1]);
      const ysFoot = samples.map(s => s.foot[1]);
      const handZ = samples.map(s => s.hand[2]);
      const handY = samples.map(s => s.hand[1]);
      const rng = a => [Math.min(...a).toFixed(3), Math.max(...a).toFixed(3)];
      return { clips: character.clips, samples: samples.slice(0, 3),
        hipsY: rng(ys), footY: rng(ysFoot), handY: rng(handY), handZ: rng(handZ) };
    });
    console.log(JSON.stringify(info, null, 1));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
