// 严格测量：**只看角色**的像素，换配色前后比色相。
//   node test/browser/colour-proof.cjs
//
// 为什么这么测（踩过的坑）：
//   1. 只看"角色屏幕包围盒"里最饱和的像素 —— 盒子里混进木桌，最饱和的其实是桌子；
//      而且角色会走动，盒子位置一变，前后根本不可比（实测三套配色给出了**同一个**像素）。
//   2. 所以现在先用 `__isolate()` 把场景里其它东西全藏掉（灯要留着，否则全黑），
//      再把角色**自己的身体材质**（`材质.017`）的采样像素求平均 —— 那就是"场景里到底画成什么色"。
//   3. 同时把材质上那张贴图的平均色也读出来（`material.map.image`）：一个是"贴图对不对"，
//      一个是"画面对不对"，两边都要变色才算真的生效。
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { inflateSync } = require("node:zlib");
const { io } = require("socket.io-client");

function decodePng(png) {
  let off = 8, w = 0, h = 0, colorType = 0;
  const idat = [];
  while (off < png.length) {
    const len = png.readUInt32BE(off);
    const type = png.toString("ascii", off + 4, off + 8);
    const data = png.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    off += 12 + len;
  }
  const ch = { 2: 3, 6: 4 }[colorType];
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(w * h * ch);
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    const line = raw.subarray(pos, pos + stride); pos += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0, b = prev[i], c = i >= ch ? prev[i - ch] : 0;
      let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      cur[i] = v & 0xff;
    }
  }
  return { w, h, ch, data: out };
}

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.join(ROOT, "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.join(ROOT, "Build/proof-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(r => server.http.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
    await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "证明", password: "qa" } });
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
    await page.waitForTimeout(2500);

    // 只留角色（灯留着，否则全黑），并把相机对准它。
    const isolated = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const n = debug.__isolate(true);
      debug.__scene.traverse(o => { if (o.isLight) o.visible = true; });
      return n;
    });
    console.log("已藏起来的场景对象:", isolated);

    /** 角色在屏幕上的框（投影世界包围盒）。 */
    const avatarBox = () => page.evaluate(() => {
      const debug = window.__officeDebug;
      const V = debug.__camera.position.constructor;
      const root = debug.avatar.root;
      root.updateMatrixWorld(true);
      const rect = document.querySelector("canvas").getBoundingClientRect();
      const size = { width: document.querySelector("canvas").clientWidth,
        height: document.querySelector("canvas").clientHeight };
      let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
      root.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        if (o.parent?.isBone) return;
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i += 3) {
          const p = new V(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(o.matrixWorld).project(debug.__camera);
          const sx = (p.x * 0.5 + 0.5) * size.width, sy = (-p.y * 0.5 + 0.5) * size.height;
          minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
          minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
        }
      });
      return { x: Math.max(0, Math.round(rect.x + minX)), y: Math.max(0, Math.round(rect.y + minY)),
        width: Math.round(Math.max(2, maxX - minX)), height: Math.round(Math.max(2, maxY - minY)) };
    });

    /**
     * **背景不算数**：包围盒里除了角色还有房间/天空，直接平均会被背景冲掉。
     * 所以逐点 `__pick` 射线求交（此时场景只剩角色可见），只留下真的打在
     * **板身材质 `材质.017`** 上的那批屏幕点 —— 这批点的像素就是"场景把板身画成了什么色"。
     */
    const bodyPoints = box => page.evaluate(b => {
      const debug = window.__officeDebug;
      const rect = document.querySelector("canvas").getBoundingClientRect();
      const points = [];
      for (let y = b.y; y < b.y + b.height; y += 2) {
        for (let x = b.x; x < b.x + b.width; x += 2) {
          const hit = debug.__pick(x - rect.x, y - rect.y);
          if (!hit?.hit) continue;
          if (!(hit.material || []).includes("材质.017")) continue;
          points.push([x, y]);
        }
      }
      return points;
    }, box);

    /** 身体材质上那张贴图的平均色（"贴图对不对"）。 */
    const textureMean = () => page.evaluate(() => {
      const root = window.__officeDebug.avatar.root;
      let found = null;
      root.traverse(o => {
        if (found) return;
        const m = o.material;
        if (!m?.map?.image) return;
        if (m.name !== "材质.017") return;
        found = { name: m.name, look: m.userData?.look ?? null,
          baseColor: m.color?.getHexString?.() ?? null, size: [m.map.image.width, m.map.image.height] };
        const image = m.map.image;
        const canvas = document.createElement("canvas");
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, image.width, image.height).data;
        let sum = [0, 0, 0], n = 0;
        for (let i = 0; i < data.length; i += 4 * 16) {
          sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; n++;
        }
        found.mapMean = sum.map(v => Math.round(v / n));
      });
      return found;
    });

    const report = async label => {
      const box = await avatarBox();
      const png = await page.screenshot();
      const points = await bodyPoints(box);
      const img = decodePng(png);
      let sum = [0, 0, 0], n = 0, hueX = 0, hueY = 0;
      for (const [x, y] of points) {
        if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
        const i = (y * img.w + x) * img.ch;
        const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
        sum[0] += r; sum[1] += g; sum[2] += b; n++;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        if (d > 10) {
          const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
          const a = (h * 60) * Math.PI / 180;
          hueX += Math.cos(a); hueY += Math.sin(a);
        }
      }
      const pic = n
        ? { mean: sum.map(v => Math.round(v / n)), pixels: n,
            hue: Math.round(((Math.atan2(hueY, hueX) * 180 / Math.PI) + 360) % 360) }
        : { mean: null, pixels: 0, hue: null };
      const tex = await textureMean();
      console.log(`${label}: 板身画面 mean=${JSON.stringify(pic.mean)} hue=${pic.hue} px=${pic.pixels}`,
        `| 贴图 mean=${JSON.stringify(tex?.mapMean)} look=${JSON.stringify(tex?.look)}`);
      fs.writeFileSync(path.join(ROOT, "Build", `color-proof-${label}.png`),
        await page.screenshot({ clip: box }));
      return { pic, tex };
    };

    const results = { 原色: await report("原色") };
    for (const colour of ["藏蓝", "玫粉", "薄荷", "墨黑", "雪白"]) {
      await page.locator('button[aria-label="设置"]').click();
      await page.locator(`.character-setting .color-grid button[aria-label="${colour}"]`).click();
      await page.getByRole("button", { name: "关闭", exact: true }).click();
      await page.waitForTimeout(1200);
      await page.evaluate(() => {
        window.__officeDebug.__isolate(true);
        window.__officeDebug.__scene.traverse(o => { if (o.isLight) o.visible = true; });
      });
      results[colour] = await report(colour);
    }
    fs.writeFileSync(path.join(ROOT, "Build", "color-proof.json"),
      JSON.stringify(results, null, 1));
  } finally {
    await browser.close(); await new Promise(r => server.io.close(r));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
