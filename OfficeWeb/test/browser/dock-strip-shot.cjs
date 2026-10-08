// 给头像条拍一张干净的大图（用 harness 页面，不依赖真实桌面）。
//   node test/browser/dock-strip-shot.cjs
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve, join } = require("node:path");

(async () => {
  const ROOT = resolve(__dirname, "..", "..", "..");
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    // 放大 deviceScaleFactor，小窗本来就小，这样才看得清
    const page = await browser.newPage({ viewport: { width: 420, height: 120 }, deviceScaleFactor: 4 });
    await page.goto(`http://127.0.0.1:${port}/test/dock-harness.html`);
    await page.waitForFunction(() => document.querySelectorAll(".dock-avatar").length === 4, null, { timeout: 30000 });
    await page.waitForTimeout(400);
    // 深色底上截图更接近真实任务栏
    await page.addStyleTag({ content: "body { background: #202225 !important; }" });
    await page.locator(".dock-frame").screenshot({ path: join(ROOT, "Build/dock-strip-head.png") });
    console.log("saved Build/dock-strip-head.png");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
