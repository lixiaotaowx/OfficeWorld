// The inline stage must show a single control; the whole toolbar only appears
// after enlarging. Overlapping buttons over a narrow shared-screen panel was the
// reported regression, so both states are asserted and captured.
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");

const SHOT = "../Build";

(async () => {
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true,
    args: ["--autoplay-policy=no-user-gesture-required"] });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 420, height: 700 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/screen-stage-harness.html`);
    await page.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(1200);

    const inline = await page.evaluate(() => {
      const bar = document.querySelector(".screen-stage-bar");
      return {
        labels: [...bar.querySelectorAll("button")].map((button) => button.textContent.trim()),
        height: bar.getBoundingClientRect().height,
        stageWidth: document.querySelector(".screen-stage").getBoundingClientRect().width,
      };
    });
    console.log("inline:", JSON.stringify(inline));
    assert.deepEqual(inline.labels, ["全屏"], "小窗只能有一个全屏按钮");
    assert.ok(inline.height < 48, `小窗控制条不该占据一块区域 (height=${inline.height})`);
    await page.screenshot({ path: `${SHOT}/stage-inline.png` });

    // Enlarging (real fullscreen) must reveal the whole toolbar.
    await page.locator(".screen-stage-expand").click();
    await page.waitForTimeout(1200);
    const full = await page.evaluate(() => {
      const stage = document.querySelector(".screen-stage");
      const bar = document.querySelector(".screen-stage-bar");
      return {
        fullscreenElement: document.fullscreenElement === stage,
        labels: [...bar.querySelectorAll("button")].map((button) => button.textContent.trim()),
        barOpacity: getComputedStyle(bar).opacity,
      };
    });
    console.log("fullscreen:", JSON.stringify(full));
    assert.equal(full.fullscreenElement, true, "全屏按钮要真的进入全屏");
    assert.deepEqual(full.labels, ["标注", "放大", "退出全屏", "静音我", "静音对方", "抢占共享", "挂断", ""],
      "放大后才出现完整按钮条");
    assert.equal(full.barOpacity, "1", "全屏时按钮条必须可见");
    await page.screenshot({ path: `${SHOT}/stage-fullscreen.png` });

    // Drawing mode reveals undo/clear without hiding anything else.
    await page.locator(".screen-stage-bar button", { hasText: "标注" }).click();
    await page.waitForTimeout(300);
    const drawing = await page.evaluate(() => [...document.querySelectorAll(".screen-stage-bar button")]
      .map((button) => button.textContent.trim()));
    console.log("annotating:", JSON.stringify(drawing));
    assert.ok(drawing.includes("撤销") && drawing.includes("清空"), "标注模式要有撤销/清空");
    await page.screenshot({ path: `${SHOT}/stage-annotating.png` });
    assert.deepEqual(errors, []);
    console.log("PASS 小窗单按钮 / 放大后完整按钮条 / 标注模式撤销清空");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
