// 配色保真度检查：逐套配色量板身贴图的平均色，确认"算出来就是那个颜色"。
//   node test/browser/color-fidelity.cjs
//
// 守的是两个真实踩过的坑：
//   1. **重复应用会串色**：`Texture.clone()` 共享同一个 `Source`，`copy.image = canvas`
//      会把原图也换掉；于是第二次开始是拿上一次的结果再乘一次，一次比一次黑
//      （原色正常、雪白渲成深灰）。所以每条都要验"同一套配色应用两次，结果不变"。
//   2. **配色必须真的分开**：十套平均色两两不同，且雪白亮、墨黑暗。
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");
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
    const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
    page.on("pageerror", e => console.log("PAGEERROR", e.message));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    const rows = await page.evaluate(async () => {
      const model = await import("/src/characterModel.ts");
      const look = await import("/src/look.ts");
      const character = await model.loadCharacter(look.DEFAULT_APPEARANCE);
      const apply = color => model.setCharacterAppearance(character, look.resolveAppearance({
        color, accessories: { glasses: "none", hair: "none", beard: "none", hat: "none" },
      }));
      /** 板身材质上那张贴图的平均色。 */
      const mapMean = () => {
        let material = null;
        character.model.traverse(o => { if (o.material?.name === "材质.017") material = o.material; });
        const image = material.map.image;
        const canvas = document.createElement("canvas");
        canvas.width = image.width; canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, image.width, image.height).data;
        let sum = [0, 0, 0], n = 0;
        for (let i = 0; i < data.length; i += 4 * 16) {
          sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; n++;
        }
        return sum.map(v => Math.round(v / n));
      };
      const rows = [];
      for (const colour of look.PALETTE) {
        apply(colour.id);
        const mean = mapMean();
        apply(colour.id);                       // 同一套再来一次：不许变
        rows.push({ id: colour.id, hex: look.colorHex(colour.id), mean,
          again: mapMean(), accessoriesNone: true });
      }
      return rows;
    });

    for (const row of rows) {
      console.log(`${row.id.padEnd(7)} ${row.hex} 贴图平均 = ${JSON.stringify(row.mean)}`,
        `重复应用 = ${JSON.stringify(row.again)}`);
      assert.deepEqual(row.again, row.mean,
        `${row.id}：同一套配色应用两次结果必须一样（串色 = 贴图副本共享了 Source）`);
      // 纸面必须真的被染成那个颜色：各通道的相对关系要跟 hex 一致（亮度可差、色相不能差）。
      const want = [1, 3, 5].map(i => parseInt(row.hex.slice(i, i + 2), 16));
      const order = a => a.map((v, i) => [v, i]).sort((x, y) => y[0] - x[0]).map(p => p[1]).join("");
      assert.equal(order(row.mean), order(want),
        `${row.id}：贴图平均色的通道排序要跟 ${row.hex} 一致，实际 ${JSON.stringify(row.mean)}`);
    }
    const byId = new Map(rows.map(r => [r.id, r.mean]));
    const snow = byId.get("snow"), ink = byId.get("ink");
    assert.ok(Math.max(...snow) > 180, `雪白要亮，实际 ${JSON.stringify(snow)}`);
    assert.ok(Math.max(...ink) < 80, `墨黑要暗，实际 ${JSON.stringify(ink)}`);
    const keys = new Set(rows.map(r => r.mean.join(",")));
    assert.equal(keys.size, rows.length, '十套配色的贴图平均色必须两两不同');
    console.log(`配色保真度检查通过：${rows.length} 套都各算各的、重复应用不变`);
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
