// Reproduce the real private-call panel (340px wide, max-height 65vh, scrolling)
// with a shared screen, and check that the inline control is fully visible.
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("node:path");
const assert = require("node:assert/strict");

(async () => {
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true,
    args: ["--autoplay-policy=no-user-gesture-required"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/private-call-stage-harness.html`);
    await page.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    const geometry = await page.evaluate(() => {
      const panel = document.querySelector(".session-panel.private-calls");
      const stage = document.querySelector(".screen-stage");
      const bar = document.querySelector(".screen-stage-bar.minimal");
      const buttons = [...bar.querySelectorAll("button")];
      const box = (element) => { const r = element.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
          right: Math.round(r.right), bottom: Math.round(r.bottom) }; };
      const panelBox = box(panel), stageBox = box(stage), buttonBox = box(buttons[0]);
      return {
        panel: panelBox, stage: stageBox, bar: box(bar), button: buttonBox,
        labels: buttons.map((button) => button.textContent.trim()),
        buttonPosition: getComputedStyle(buttons[0]).position,
        barHeight: Math.round(bar.getBoundingClientRect().height),
        insideStage: buttons.every((button) => {
          const b = box(button);
          return b.x >= stageBox.x && b.right <= stageBox.right && b.y >= stageBox.y && b.bottom <= stageBox.bottom;
        }),
        insidePanel: buttons.every((button) => {
          const b = box(button);
          return b.x >= panelBox.x && b.right <= panelBox.right && b.y >= panelBox.y && b.bottom <= panelBox.bottom;
        }),
      };
    });
    console.log(JSON.stringify(geometry, null, 2));
    await page.screenshot({ path: "../Build/panel-inline.png" });

    // The regression: the panel's global button rule tore the controls out of the
    // bar and clipped them below the picture. All of these must hold.
    assert.deepEqual(geometry.labels, ["最大化", "全屏"], "小窗应有最大化与全屏两个按钮");
    assert.equal(geometry.buttonPosition, "static", "面板里的按钮不能再被强制绝对定位");
    assert.ok(geometry.barHeight > 0, "按钮条必须有高度，否则按钮已脱离它");
    assert.ok(geometry.insideStage, `按钮被裁到画面之外: stage=${JSON.stringify(geometry.stage)}`);
    assert.ok(geometry.insidePanel, "按钮必须在面板可见范围内");
    assert.deepEqual(errors, []);

    // Scrolling the panel must not hide them either.
    const scrolled = await page.evaluate(() => {
      const panel = document.querySelector(".session-panel.private-calls");
      panel.scrollTop = panel.scrollHeight;
      const p = panel.getBoundingClientRect();
      return [...document.querySelectorAll(".screen-stage-bar.minimal button")]
        .every((button) => { const b = button.getBoundingClientRect();
          return b.top >= p.top - 1 && b.bottom <= p.bottom + 1; });
    });
    await page.waitForTimeout(300);
    assert.ok(scrolled, "滚动面板后按钮仍应可见");
    await page.screenshot({ path: "../Build/panel-inline-scrolled.png" });

    // 最大化 fills the app window (not the whole screen) and reveals the toolbar.
    await page.locator(".screen-stage-bar.minimal button", { hasText: "最大化" }).click();
    await page.waitForTimeout(900);
    const maximized = await page.evaluate(() => ({
      maximized: document.querySelector(".screen-stage").classList.contains("maximized"),
      stillFullscreen: !!document.fullscreenElement,
    }));
    console.log("maximized:", JSON.stringify(maximized));
    assert.equal(maximized.maximized, true, "最大化要在软件窗口内占满");
    assert.equal(maximized.stillFullscreen, false, "最大化不是全屏");
    const toolbar = await page.evaluate(() => {
      const stage = document.querySelector(".screen-stage");
      const buttons = [...document.querySelectorAll(".screen-stage-bar button")]
        .filter((button) => button.offsetParent !== null);
      const boxes = buttons.map((button) => {
        const r = button.getBoundingClientRect();
        return { label: button.textContent.trim(), x: Math.round(r.x), y: Math.round(r.y),
          right: Math.round(r.right), bottom: Math.round(r.bottom),
          position: getComputedStyle(button).position };
      });
      const view = { w: window.innerWidth, h: window.innerHeight };
      return { maximized: stage.classList.contains("maximized"), boxes, view,
        allStatic: boxes.every((box) => box.position === "static"),
        distinct: new Set(boxes.map((box) => `${box.x},${box.y}`)).size,
        insideViewport: boxes.every((box) => box.x >= 0 && box.right <= view.w && box.y >= 0 && box.bottom <= view.h),
      };
    });
    console.log("toolbar:", JSON.stringify(toolbar, null, 2));
    assert.ok(toolbar.allStatic, "最大化后按钮也必须留在按钮条内");
    assert.equal(toolbar.distinct, toolbar.boxes.length, `按钮不应互相叠在同一位置: ${JSON.stringify(toolbar.boxes)}`);
    assert.ok(toolbar.insideViewport, "按钮必须在可见区域内");

    // Laying them out is not enough: they also have to sit as one centred row at
    // the bottom, not bunched into a corner next to a stranded label.
    const layout = await page.evaluate(() => {
      const bar = document.querySelector(".screen-stage-bar");
      const barBox = bar.getBoundingClientRect();
      const boxes = [...bar.querySelectorAll("button")]
        .map((button) => button.getBoundingClientRect());
      const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
        Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      let overlapping = 0;
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) if (overlap(boxes[i], boxes[j]) > 0) overlapping++;
      const gaps = boxes.slice(1).map((box, index) => Math.round(box.left - boxes[index].right));
      // Buttons have different heights, so compare their centre line, not `top`.
      const centers = boxes.map((box) => box.top + box.height / 2);
      return {
        barCenter: Math.round(barBox.left + barBox.width / 2),
        viewCenter: Math.round(window.innerWidth / 2),
        barWidth: Math.round(barBox.width),
        barHeight: Math.round(barBox.height),
        viewWidth: window.innerWidth,
        barTop: Math.round(barBox.top), barBottom: Math.round(barBox.bottom),
        viewHeight: window.innerHeight,
        overlapping, gaps,
        rowBand: Math.round(Math.max(...centers) - Math.min(...centers)),
      };
    });
    console.log("centering:", JSON.stringify(layout));
    assert.equal(layout.overlapping, 0, "按钮之间不能重叠");
    assert.ok(Math.abs(layout.barCenter - layout.viewCenter) <= 4,
      `按钮条必须水平居中: bar=${layout.barCenter} view=${layout.viewCenter}`);
    assert.ok(layout.rowBand <= 6, `足够宽时按钮应排成一行 (中心线跨度 ${layout.rowBand}px)`);
    assert.ok(layout.barHeight < 64, `按钮条应只有一行高: ${layout.barHeight}px`);
    assert.ok(layout.gaps.every((gap) => gap >= 3 && gap <= 24), `按钮间距应均匀合理: ${layout.gaps}`);
    assert.ok(layout.barBottom <= layout.viewHeight && layout.barTop > layout.viewHeight / 2,
      "按钮条应在屏幕下方");
    assert.ok(layout.barWidth < layout.viewWidth, "按钮条不应再拉满整行");
    await page.screenshot({ path: "../Build/panel-fullscreen.png" });

    // 全屏 is a separate control: whole screen. In a browser that is the DOM API;
    // the desktop app takes the native window path, verified separately.
    await page.locator(".screen-stage-bar button", { hasText: "全屏" }).click();
    await page.waitForTimeout(1200);
    const fullscreen = await page.evaluate(() => ({
      on: document.fullscreenElement === document.querySelector(".screen-stage"),
      label: [...document.querySelectorAll(".screen-stage-bar button")]
        .map((button) => button.textContent.trim()).find((text) => text.includes("全屏")),
    }));
    console.log("fullscreen:", JSON.stringify(fullscreen));
    assert.equal(fullscreen.on, true, "浏览器里全屏应真的进入全屏");
    assert.equal(fullscreen.label, "退出全屏", "全屏后按钮应变成退出全屏");
    await page.screenshot({ path: "../Build/panel-fullscreen-real.png" });
    console.log("PASS 真实私聊面板：小窗两按钮未被切割、最大化占满窗口、全屏占满屏幕、按钮居中一行");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
