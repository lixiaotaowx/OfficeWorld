// 挑头像的饱和度/亮度：并排渲染几组滤镜，出图人眼定。
//
//   node test/browser/avatar-tone.cjs     (run from OfficeWeb/)
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
    const page = await browser.newPage({ viewport: { width: 900, height: 420 } });
    await page.goto(`http://127.0.0.1:${port}/test/avatar-tone-harness.html`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: resolve("../Build/avatar-tone.png") });
    console.log("ok");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
