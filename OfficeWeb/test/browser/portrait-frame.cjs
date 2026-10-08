// 头像取景检查：脸（五官 + 眼镜/胡子）在画面里占多大，并各出一张 160×160 的图。
//   node test/browser/portrait-frame.cjs
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const fs = require("node:fs");
const { resolve, join } = require("node:path");
const assert = require("node:assert/strict");

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
      const portrait = await import("/src/portraitRenderer.ts");
      const cases = {
        none: { color: "kraft", accessories: { glasses: "none", hair: "none", beard: "none", hat: "none" } },
        glasses: { color: "navy", accessories: { glasses: "black", hair: "none", beard: "none", hat: "none" } },
        beard: { color: "sage", accessories: { glasses: "none", hair: "none", beard: "full", hat: "none" } },
        party: { color: "rose", accessories: { glasses: "none", hair: "none", beard: "none", hat: "party" } },
        longhair: { color: "mint", accessories: { glasses: "none", hair: "long", beard: "none", hat: "none" } },
      };
      const rows = [];
      for (const [name, raw] of Object.entries(cases)) {
        const appearance = look.resolveAppearance(raw);
        const character = await model.loadCharacter(appearance);
        character.model.updateMatrixWorld(true);
        // 眼睛（瞳孔 + 眼白）的蒙皮后包围盒 —— 用它来算"脸占画面多大"。
        const eyes = new THREE.Box3();
        character.model.traverse(o => {
          if (!o.isMesh) return;
          const mat = o.material?.name;
          if (mat !== "材质.005" && mat !== "材质.006") return;
          const pos = o.geometry.attributes.position;
          const v = new THREE.Vector3();
          for (let i = 0; i < pos.count; i++) {
            o.getVertexPosition(i, v);
            v.applyMatrix4(o.matrixWorld);
            eyes.expandByPoint(v);
          }
        });
        const camera = portrait.portraitCamera(character);
        const frame = { width: camera.right - camera.left, height: camera.top - camera.bottom,
          centerY: +camera.position.y.toFixed(3) };
        // 真出一张头像图（跟小窗同一条路：renderPortrait）。
        const url = await portrait.renderPortrait(appearance);
        rows.push({ name, frame,
          eyeBox: [+eyes.min.y.toFixed(3), +eyes.max.y.toFixed(3),
            +eyes.min.x.toFixed(3), +eyes.max.x.toFixed(3)],
          eyeWidthShare: +((eyes.max.x - eyes.min.x) / frame.width).toFixed(2),
          url });
        fsWrite(rows.at(-1).name, url);
      }
      function fsWrite() {}
      return rows;
    });

    const shares = rows.map(row => row.eyeWidthShare);
    for (const row of rows) {
      console.log(`${row.name.padEnd(9)} 取景 ${row.frame.width.toFixed(2)}×${row.frame.height.toFixed(2)}`,
        `中心 y=${row.frame.centerY}  眼睛 x=${JSON.stringify([row.eyeBox[2], row.eyeBox[3]])}`,
        ` 眼宽占画面 ${(row.eyeWidthShare * 100).toFixed(0)}%`);
      assert.ok(row.eyeWidthShare > 0.45, `${row.name}: 脸还是太小（眼宽只占 ${row.eyeWidthShare}）`);
      const base64 = row.url.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(join(ROOT, "Build", `portrait-${row.name}.png`), Buffer.from(base64, "base64"));
    }
    // **一排头像必须一样大**（用户 2026-09-28：「怎么还有大有小」）：
    // 取景只按眼睛算，跟戴了什么无关，所以每一档的占比都必须相同。
    const spread = Math.max(...shares) - Math.min(...shares);
    assert.ok(spread < 0.02, `取景跟着配件变了：各档占比 ${JSON.stringify(shares)}`);
    console.log(`头像取景检查通过：脸占画面 ${(shares[0] * 100).toFixed(0)}% 宽、`
      + `各配件档位完全一致（极差 ${spread.toFixed(3)}），图在 Build/portrait-*.png`);
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
