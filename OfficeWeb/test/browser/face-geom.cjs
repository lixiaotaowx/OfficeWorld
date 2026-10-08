// 找"脸"在哪：把角色每个材质网格的（蒙皮后）包围盒打出来，认出眼睛/五官那几块。
//   node test/browser/face-geom.cjs
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
      character.model.updateMatrixWorld(true);
      const rows = [];
      const v = new THREE.Vector3();
      character.model.traverse(o => {
        if (!o.isMesh && !o.isSkinnedMesh) return;
        const pos = o.geometry?.attributes?.position;
        if (!pos) return;
        let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
        for (let i = 0; i < pos.count; i++) {
          if (typeof o.getVertexPosition === "function") o.getVertexPosition(i, v);
          else v.set(pos.getX(i), pos.getY(i), pos.getZ(i));
          v.applyMatrix4(o.matrixWorld);
          minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
          minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
        }
        rows.push({ mesh: o.name, material: o.material?.name ?? "?", verts: pos.count,
          visible: o.visible !== false,
          y: [+minY.toFixed(3), +maxY.toFixed(3)], x: [+minX.toFixed(3), +maxX.toFixed(3)] });
      });
      return rows;
    });
    for (const row of rows) {
      console.log(`${row.mesh.padEnd(18)} ${String(row.material).padEnd(26)} v=${String(row.verts).padStart(5)}`,
        `visible=${row.visible ? "Y" : "n"} y=${JSON.stringify(row.y)} x=${JSON.stringify(row.x)}`);
    }
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
