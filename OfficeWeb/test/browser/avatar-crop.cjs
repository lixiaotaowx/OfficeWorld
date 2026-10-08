// 挑"只要头"的裁切参数：把几种 background-size/position 并排渲染出来看一眼。
//
//   node test/browser/avatar-crop.cjs     (run from OfficeWeb/)
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const { resolve } = require("node:path");

(async () => {
  const vite = await createServer({ configFile: false, root: resolve("."),
    server: { host: "127.0.0.1", port: 0 } });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 520, height: 340 } });
    await page.goto(`http://127.0.0.1:${port}/test/avatar-crop-harness.html`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: resolve("../Build/avatar-crop.png") });
    const rows = await page.evaluate(() => [...document.querySelectorAll(".row")].map(row =>
      row.querySelector(".label").textContent));
    console.log(JSON.stringify({ rows }));
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
