// 量"头顶到哪"：每个帽子戴上去以后模型的最高点、以及 Head 骨骼的高度，
// 用来定名字牌要抬多高（名字牌挂在 headY + 偏移上）。
//   node test/browser/hat-top.cjs
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");

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
    const page = await browser.newPage({ viewport: { width: 640, height: 640 } });
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    const rows = await page.evaluate(async () => {
      const THREE = await import("/node_modules/three/build/three.module.js");
      const model = await import("/src/characterModel.ts");
      const look = await import("/src/look.ts");
      const character = await model.loadCharacter(look.DEFAULT_APPEARANCE);
      const top = () => {
        character.model.updateMatrixWorld(true);
        let high = -Infinity;
        const v = new THREE.Vector3();
        character.model.traverse(o => {
          if (!o.isMesh && !o.isSkinnedMesh) return;
          if (o.visible === false) return;
          const pos = o.geometry?.attributes?.position;
          if (!pos) return;
          for (let i = 0; i < pos.count; i += 3) {
            // 蒙皮网格要取"蒙完"的位置，否则量到的不是画面上那个高度。
            if (typeof o.getVertexPosition === "function") {
              o.getVertexPosition(i, v);
              v.applyMatrix4(o.matrixWorld);
            } else {
              v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
              o.localToWorld(v);
            }
            high = Math.max(high, v.y);
          }
        });
        return high;
      };
      const headY = () => {
        const bone = character.bones.get("mixamorigHead");
        return bone ? bone.getWorldPosition(new THREE.Vector3()).y : null;
      };
      const rows = [];
      for (const slot of ["none", ...look.ACCESSORIES.hat.filter(h => h.mesh).map(h => h.id)]) {
        model.setCharacterAppearance(character, look.resolveAppearance({
          color: "kraft",
          accessories: { glasses: "none", hair: "none", beard: "none", hat: slot },
        }));
        rows.push({ hat: slot, headY: +headY().toFixed(3), top: +top().toFixed(3) });
      }
      return rows;
    });
    for (const row of rows) {
      console.log(`帽子 ${row.hat.padEnd(9)} Head骨骼 y=${row.headY}  模型最高点 y=${row.top}`,
        `  最高点 - Head = ${(row.top - row.headY).toFixed(3)}`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
