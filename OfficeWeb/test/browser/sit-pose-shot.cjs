// 目视检查坐姿：把 `坐姿打字_Type` 摆到角色上，配上"地面 + 工位座位(0.58m)"的参照物，
// 分别按"现在的偏移"和"板子底面坐在座位上"渲染出来对比。
//   node test/browser/sit-pose-shot.cjs        # 出图 Build/sit-pose-*.png
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const fs = require("node:fs");
const { resolve, join } = require("node:path");

(async () => {
  const ROOT = resolve(__dirname, "..", "..", "..");
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    publicDir: resolve("public"),
    server: { host: "127.0.0.1", port: 0, fs: { allow: [ROOT] } },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 700, height: 700 } });
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    const shots = await page.evaluate(async () => {
      const THREE = await import("/node_modules/three/build/three.module.js");
      const model = await import("/src/characterModel.ts");
      const look = await import("/src/look.ts");
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(520, 620, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(1.5);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xdfe3dc);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa396, 2.2));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(1.6, 3.2, 2.4);
      scene.add(key);
      const floor = new THREE.Mesh(new THREE.BoxGeometry(3, 0.02, 3),
        new THREE.MeshStandardMaterial({ color: 0x9a9a92 }));
      floor.position.y = -0.01;
      scene.add(floor);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x6f8a6a }));
      seat.position.set(0, 0.58, 0);
      scene.add(seat);

      const character = await model.loadCharacter(look.DEFAULT_APPEARANCE);
      scene.add(character.model);
      // 几何参照：板身整体范围、裆部（缺口顶）、腿尖、眼睛（黑色瞳孔那块）的高度。
      character.model.position.y = 0;
      character.model.updateMatrixWorld(true);
      const geo = { bodyMin: Infinity, bodyMax: -Infinity, crutch: Infinity, eyes: [] };
      character.model.traverse(o => {
        if (!o.isMesh) return;
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i);
          if (o.material?.name === "材质.017") {
            geo.bodyMin = Math.min(geo.bodyMin, y); geo.bodyMax = Math.max(geo.bodyMax, y);
            if (Math.abs(x) < 0.03) geo.crutch = Math.min(geo.crutch, y);
          }
          if (o.material?.name === "材质.005") geo.eyes.push(y);
        }
      });
      geo.crutch = Math.round(geo.crutch * 1000) / 1000;
      geo.bodyMin = Math.round(geo.bodyMin * 1000) / 1000;
      geo.bodyMax = Math.round(geo.bodyMax * 1000) / 1000;
      geo.eyeY = geo.eyes.length
        ? Math.round((geo.eyes.reduce((a, b) => a + b, 0) / geo.eyes.length) * 1000) / 1000 : null;
      delete geo.eyes;
      const sit = character.action("坐姿打字_Type");
      const shoot = camera => { renderer.render(scene, camera); return renderer.domElement.toDataURL("image/png"); };
      const camera = new THREE.PerspectiveCamera(28, 520 / 620, 0.1, 20);
      camera.position.set(0, 1.0, 3.6);
      camera.lookAt(0, 0.85, 0);

      const out = {};
      const settle = (label, y) => {
        character.model.position.y = y;
        character.mixer.update(0.4);
        out[label] = shoot(camera);
      };
      // 站姿参照
      character.idle?.reset().setEffectiveWeight(1).play();
      character.mixer.update(0.4);
      character.model.position.y = character.groundY;
      out["stand"] = shoot(camera);
      character.idle?.stop();

      sit.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      sit.setEffectiveWeight(1);
      // 现在的算法：把"动作里的髋高"抬到座位高度
      const clipHip = (() => {
        character.model.position.y = 0;
        character.mixer.update(0);
        character.model.updateMatrixWorld(true);
        return character.bones.get("mixamorigHips")?.getWorldPosition(new THREE.Vector3()).y ?? 0;
      })();
      settle("sit-hip-on-seat", 0.58 - clipHip);
      settle("sit-board-on-seat", 0.58);
      settle("sit-as-authored", 0);
      // 坐下时把眼睛放到"坐着的人眼高"（约 1.15m）
      settle("sit-eyes-1150", 1.15 - geo.eyeY);
      return { out, clipHip: +clipHip.toFixed(3), geo };
    });
    console.log("动作里的髋高 =", shots.clipHip);
    console.log("几何参照 =", JSON.stringify(shots.geo));
    for (const [name, dataUrl] of Object.entries(shots.out)) {
      fs.writeFileSync(join(ROOT, "Build", `sit-pose-${name}.png`),
        Buffer.from(dataUrl.split(",")[1], "base64"));
      console.log("写出", `Build/sit-pose-${name}.png`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
