// 用**应用自己的渲染管线**渲染写实缩略图（配色 / 配件 / 头像）。
//
// 为什么必须这样：板身的颜色是网页里把 GLB 那张**灰度贴图**按配色重算出来的
// （`characterLook.tintTexture`：灰度当遮罩、`hex` 当颜色），GLB 本身没有颜色信息。
// 所以 Blender 渲出来的图跟线上不是一个东西；这里直接 import `/src/characterModel.ts`
// 与 `/src/characterLook.ts`，用同一套材质与同一段重算逻辑出图。
//
//   node test/browser/render-look-thumbs.cjs            # 出到 Build/OfficeWeb/assets/characters/thumbnails
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const fs = require("node:fs");
const { resolve, join } = require("node:path");

(async () => {
  const ROOT = resolve(__dirname, "..", "..", "..");
  const OUT = join(ROOT, "Build", "OfficeWeb", "assets", "characters", "thumbnails");
  const PUBLIC = join(ROOT, "OfficeWeb", "public", "assets", "characters", "thumbnails");
  fs.mkdirSync(OUT, { recursive: true });
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    publicDir: resolve("public"),
    server: { host: "127.0.0.1", port: 0, fs: { allow: [ROOT] } },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    page.on("console", m => { if (m.type() === "error") console.log("CONSOLE", m.text()); });
    // 拿一个真实页面（有 index.html），随后只在页面里 import 需要的模块
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    const setup = await page.evaluate(async () => {
      const THREE = await import("/node_modules/three/build/three.module.js");
      const model = await import("/src/characterModel.ts");
      const look = await import("/src/look.ts");
      const portrait = await import('/src/portraitRenderer.ts');
      const { portraitLighting } = await import('/src/portraitLighting.ts');
      window.__R = { THREE, model, look, portrait, portraitLighting };
      return { palettes: look.PALETTE.map(c => c.id), slots: look.SLOT_ORDER };
    });
    console.log("准备完成:", JSON.stringify(setup));

    const shots = await page.evaluate(async () => {
      const { THREE, model, look, portrait, portraitLighting } = window.__R;
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
      renderer.setSize(400, 500, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(1.25);
      renderer.setClearAlpha(0);
      const scene = new THREE.Scene();
      portraitLighting(renderer, scene);

      const character = await model.loadCharacter(look.DEFAULT_APPEARANCE);
      character.idle.play();
      character.mixer.update(.1);
      scene.add(character.model);

      const shoot = (camera) => {
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL("image/png");
      };
      // 全身：相机高度对准角色中心，视野 1.9m 高 × 1.52m 宽（角色 1.72m 高）
      const full = new THREE.OrthographicCamera(-0.76, 0.76, 0.95, -0.95, 0.1, 20);
      full.position.set(0, 0.86, 3);
      full.lookAt(0, 0.86, 0);
      // 头像（方图）
      const head = portrait.portraitCamera(character);

      const out = {};
      for (const colour of look.PALETTE) {
        model.setCharacterAppearance(character, look.resolveAppearance({
          color: colour.id, accessories: { glasses: "none", hair: "none", beard: "none", hat: "none" },
        }));
        out[`body-${colour.id}`] = shoot(full);
        out[`full-${colour.id}`] = shoot(full);
        renderer.setSize(400, 400, false);
        out[`head-${colour.id}`] = shoot(portrait.portraitCamera(character));
        renderer.setSize(400, 500, false);
      }
      // 配件：原色 + 只戴那一件
      for (const slot of look.SLOT_ORDER) {
        for (const item of look.ACCESSORIES[slot]) {
          if (!item.mesh) continue;
          model.setCharacterAppearance(character, look.resolveAppearance({
            color: "kraft",
            accessories: { glasses: "none", hair: "none", beard: "none", hat: "none", [slot]: item.id },
          }));
          renderer.setSize(400, 400, false);
          out[`wear-${slot}-${item.id}`] = shoot(portrait.accessoryCamera(character));
        }
      }
      return out;
    });

    let written = 0;
    for (const [name, dataUrl] of Object.entries(shots)) {
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(join(OUT, `${name}.png`), buffer);
      written++;
    }
    console.log(`写出版缩略图 ${written} 张`);
    for (const dir of [PUBLIC]) {
      for (const [name, dataUrl] of Object.entries(shots)) {
        fs.writeFileSync(join(dir, `${name}.png`), Buffer.from(dataUrl.split(",")[1], "base64"));
      }
      console.log(`同步到 ${dir}`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });


