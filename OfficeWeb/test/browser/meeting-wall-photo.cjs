// The meeting room's wall display must carry the office photo instead of the flat
// dark panel the model ships with, and it must read at the right size in the room.
//
//   node test/browser/meeting-wall-photo.cjs
const path = require("node:path");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { launch } = require("./playwright.cjs");
const { io: connect } = require("socket.io-client");

/** Take a desk so the first-visit seat hint does not cover the wall we photograph. */
async function takeDesk(base, cookie, name, seat) {
  const socket = connect(base, { transports: ["websocket"], reconnection: false,
    extraHeaders: { Cookie: cookie, Origin: base } });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve); socket.once("connect_error", reject);
  });
  socket.emit("join", { name });
  await new Promise((resolve) => socket.once("people", resolve));
  assert.equal((await socket.emitWithAck("seat", seat)).ok, true, "认领工位失败");
  socket.disconnect();
}

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/meeting-photo-qa-"));
  const server = createOfficeServer({
    statePath: dir + "/state.json", accountsPath: dir + "/accounts.json", secureCookies: false,
  });
  await new Promise((resolve) => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  try {
    const registered = await fetch(base + "/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify({ name: "wall-photo", password: "1" }),
    });
    const cookie = registered.headers.get("set-cookie").split(";")[0];
    await fetch(base + "/api/auth/role", { method: "POST",
      headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
      body: JSON.stringify({ role: "employee" }) });
    await takeDesk(base, cookie, "wall-photo", 0);
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const [name, ...rest] = cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
    await context.route(base + "/**", async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname.startsWith("/api/") || pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, pathname === "/" ? "index.html" : pathname);
      if (fs.existsSync(file)) return route.fulfill({ path: file });
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/?debug=1");
    await page.waitForFunction(() => window.__officeDebug?.monitors?.slots?.size > 0, null, { timeout: 120000 });
    await page.waitForTimeout(2500);

    const panel = await page.evaluate(() => {
      const scene = window.__officeDebug.__scene;
      let surface = null, bezel = null;
      scene.traverse((object) => {
        if (!object.isMesh) return;
        const name = String(object.name || "").toLowerCase();
        if (name.includes("meeting") && name.includes("display") && name.includes("surface")) surface = object;
        if (name.includes("meeting") && name.includes("presentation") && name.includes("display")) bezel = object;
      });
      const material = surface && surface.material;
      const geometry = surface && surface.geometry;
      let uvRange = null, localBox = null;
      if (geometry) {
        geometry.computeBoundingBox();
        const box = geometry.boundingBox;
        localBox = { min: box.min.toArray().map((v) => +v.toFixed(3)), max: box.max.toArray().map((v) => +v.toFixed(3)) };
        const uv = geometry.attributes.uv;
        if (uv) {
          let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
          for (let index = 0; index < uv.count; index += 1) {
            minU = Math.min(minU, uv.getX(index)); maxU = Math.max(maxU, uv.getX(index));
            minV = Math.min(minV, uv.getY(index)); maxV = Math.max(maxV, uv.getY(index));
          }
          uvRange = { minU: +minU.toFixed(3), maxU: +maxU.toFixed(3), minV: +minV.toFixed(3), maxV: +maxV.toFixed(3) };
        }
      }
      return {
        surfaceName: surface?.name || null,
        vertices: geometry?.attributes?.position?.count || 0,
        uvRange,
        localBox,
        hasMap: !!material?.map,
        mapSrc: material?.map?.image?.src || null,
        mapWidth: material?.map?.image?.width || 0,
        mapHeight: material?.map?.image?.height || 0,
        materialName: material?.name || null,
        bezelMaterial: bezel?.material?.name || null,
        size: surface ? [surface.geometry.parameters?.width, surface.geometry.parameters?.height] : null,
      };
    });
    console.log("panel:", JSON.stringify(panel));
    assert.ok(panel.surfaceName, "会议室的墙面显示器必须存在");
    assert.equal(panel.hasMap, true, "墙面显示器必须贴上照片");
    assert.match(panel.mapSrc || "", /meeting-wall-photo\.jpg/, "贴的必须是那张团队照片");
    assert.equal(panel.materialName, "Meeting wall photo");
    assert.notEqual(panel.bezelMaterial, "Meeting wall photo", "外框不能一起被换掉");
    // The JPEG must have decoded, or the panel would simply be blank.
    assert.ok(panel.mapWidth > 800 && panel.mapHeight > 400,
      `照片要真的解码出来 (${panel.mapWidth}x${panel.mapHeight})`);

    // Photograph the wall itself: the picture must be visible, upright and complete.
    const confirm = page.getByRole("button", { name: "确认", exact: true });
    if (await confirm.count()) { await confirm.first().click(); await page.waitForTimeout(400); }
    await page.evaluate(() => {
      // Aim at the meeting room's back wall. Both the camera and the orbit target have
      // to move: the controls re-derive the look direction from that target.
      const debug = window.__officeDebug;
      const controls = debug.controls?.();
      if (controls) controls.target.set(3.8, 1.95, -8.0);
      debug.__camera.position.set(3.8, 1.95, 0.4);
      debug.__camera.lookAt(3.8, 1.95, -8.0);
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve("Build/meeting-wall-photo.png") });
    // Where the panel is on screen, so the crop is exactly the picture and we can see
    // orientation and framing rather than guessing from the whole window.
    const clip = await page.evaluate(() => {
      const debug = window.__officeDebug;
      const canvas = document.querySelector("canvas");
      const rect = canvas.getBoundingClientRect();
      let mesh = null;
      debug.__scene.traverse((object) => {
        if (!mesh && object.isMesh && object.material?.name === "Meeting wall photo") mesh = object;
      });
      if (!mesh) return null;
      mesh.geometry.computeBoundingBox();
      const bounds = mesh.geometry.boundingBox;
      const scratch = debug.__camera.position.clone();
      const points = [];
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z]) {
            const world = mesh.localToWorld(scratch.clone().set(x, y, z));
            const projected = world.project(debug.__camera);
            points.push([rect.left + (projected.x + 1) / 2 * rect.width,
              rect.top + (1 - projected.y) / 2 * rect.height]);
          }
      const xs = points.map(([x]) => x), ys = points.map(([, y]) => y);
      const left = Math.max(0, Math.min(...xs) - 8), top = Math.max(0, Math.min(...ys) - 8);
      return { x: left, y: top,
        width: Math.min(1280, Math.max(...xs) + 8) - left,
        height: Math.min(800, Math.max(...ys) + 8) - top };
    });
    console.log("panel clip:", JSON.stringify(clip));
    if (clip && clip.width > 20 && clip.height > 20)
      await page.screenshot({ path: path.resolve("Build/meeting-wall-panel.png"), clip });
    // Raw view: show the texture untouched by lighting/tone mapping, to check the
    // mapping itself (orientation, which part of the photo lands on the panel).
    await page.evaluate(() => {
      const scene = window.__officeDebug.__scene;
      scene.traverse((object) => {
        if (object.isMesh && object.material?.name === "Meeting wall photo") {
          object.material.color.setHex(0x000000);
          object.material.emissive.setHex(0xffffff);
          object.material.emissiveIntensity = 1;
          object.material.toneMapped = false;
        }
      });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.resolve("Build/meeting-wall-photo-raw.png") });
    assert.deepEqual(errors, []);
    console.log("PASS 会议室墙面显示器已换成团队照片，资源可访问，外框未受影响");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
