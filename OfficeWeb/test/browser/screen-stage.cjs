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
    assert.deepEqual(inline.labels, ["最大化", "全屏"], "小窗只能有最大化与全屏两个按钮");
    assert.ok(inline.height < 48, `小窗控制条不该占据一块区域 (height=${inline.height})`);
    await page.screenshot({ path: `${SHOT}/stage-inline.png` });

    // 最大化 = fill the app window; the whole toolbar appears with it.
    await page.locator(".screen-stage-expand", { hasText: "最大化" }).click();
    await page.waitForTimeout(600);
    const maximized = await page.evaluate(() => ({
      maximized: document.querySelector(".screen-stage").classList.contains("maximized"),
      labels: [...document.querySelectorAll(".screen-stage-bar button")].map((button) => button.textContent.trim()),
    }));
    console.log("maximized:", JSON.stringify(maximized));
    assert.equal(maximized.maximized, true, "最大化必须在软件窗口内占满");
    assert.deepEqual(maximized.labels, ["标注", "还原窗口", "全屏", "静音我", "静音对方", "抢占共享", "挂断", ""],
      "最大化后才出现完整按钮条");
    await page.screenshot({ path: `${SHOT}/stage-maximized.png` });

    // 全屏 = cover the whole screen (DOM full screen in a browser).
    await page.locator(".screen-stage-bar button", { hasText: "全屏" }).click();
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
    assert.equal(full.barOpacity, "1", "全屏时按钮条必须可见");
    await page.screenshot({ path: `${SHOT}/stage-fullscreen.png` });
    await page.keyboard.press("Escape");

    // Drawing mode reveals undo/clear without hiding anything else.
    await page.locator(".screen-stage-bar button", { hasText: "标注" }).click();
    await page.waitForTimeout(300);
    const drawing = await page.evaluate(() => [...document.querySelectorAll(".screen-stage-bar button")]
      .map((button) => button.textContent.trim()));
    console.log("annotating:", JSON.stringify(drawing));
    assert.ok(drawing.includes("撤销") && drawing.includes("清空"), "标注模式要有撤销/清空");
    await page.screenshot({ path: `${SHOT}/stage-annotating.png` });
    assert.deepEqual(errors, []);

    // Desktop path: there the DOM API is a no-op, so 全屏 must call the native
    // window bridge and follow the event it sends back.
    const desktop = await browser.newPage({ viewport: { width: 420, height: 700 } });
    desktop.on("pageerror", (error) => errors.push(error.message));
    await desktop.goto(`http://127.0.0.1:${port}/test/screen-stage-harness.html?desktop=1`);
    await desktop.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await desktop.waitForTimeout(800);
    await desktop.locator(".screen-stage-expand", { hasText: "全屏" }).click();
    await desktop.waitForTimeout(300);
    const desktopOn = await desktop.evaluate(() => ({
      calls: window.__calls,
      label: [...document.querySelectorAll(".screen-stage-bar.minimal button")]
        .map((button) => button.textContent.trim()),
      wentFullscreen: document.fullscreenElement !== null,
    }));
    console.log("desktop fullscreen:", JSON.stringify(desktopOn));
    assert.deepEqual(desktopOn.calls, [true], "客户端必须调用原生全屏，而不是 DOM 全屏");
    assert.equal(desktopOn.wentFullscreen, false, "桌面路径不应依赖 DOM 全屏");
    // The event flipped the stage into enlarged mode, so leave through its toolbar.
    await desktop.locator(".screen-stage-bar button", { hasText: "退出全屏" }).click();
    await desktop.waitForTimeout(300);
    assert.deepEqual(await desktop.evaluate(() => window.__calls), [true, false], "再点一次应退出全屏");
    assert.deepEqual(errors, []);
    console.log("PASS 小窗两个按钮 / 最大化占满窗口 / 全屏占满屏幕 / 客户端走原生全屏 / 标注模式撤销清空");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
