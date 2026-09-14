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
      const button = bar.querySelector("button");
      const box = (element) => { const r = element.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
          right: Math.round(r.right), bottom: Math.round(r.bottom) }; };
      const panelBox = box(panel), stageBox = box(stage), buttonBox = box(button);
      return {
        panel: panelBox, stage: stageBox, bar: box(bar), button: buttonBox,
        buttonPosition: getComputedStyle(button).position,
        barHeight: Math.round(bar.getBoundingClientRect().height),
        insideStage: buttonBox.x >= stageBox.x && buttonBox.right <= stageBox.right &&
          buttonBox.y >= stageBox.y && buttonBox.bottom <= stageBox.bottom,
        insidePanel: buttonBox.x >= panelBox.x && buttonBox.right <= panelBox.right &&
          buttonBox.y >= panelBox.y && buttonBox.bottom <= panelBox.bottom,
      };
    });
    console.log(JSON.stringify(geometry, null, 2));
    await page.screenshot({ path: "../Build/panel-inline.png" });

    // The regression: the panel's global button rule tore the control out of the
    // bar and clipped it below the picture. All three must hold.
    assert.equal(geometry.buttonPosition, "static", "面板里的按钮不能再被强制绝对定位");
    assert.ok(geometry.barHeight > 0, "按钮条必须有高度，否则按钮已脱离它");
    assert.ok(geometry.insideStage, `按钮被裁到画面之外: button=${JSON.stringify(geometry.button)} stage=${JSON.stringify(geometry.stage)}`);
    assert.ok(geometry.insidePanel, "按钮必须在面板可见范围内");
    assert.deepEqual(errors, []);

    // Scrolling the panel must not hide it either.
    const scrolled = await page.evaluate(() => {
      const panel = document.querySelector(".session-panel.private-calls");
      panel.scrollTop = panel.scrollHeight;
      const button = document.querySelector(".screen-stage-bar.minimal button");
      const p = panel.getBoundingClientRect(), b = button.getBoundingClientRect();
      return { visible: b.top >= p.top - 1 && b.bottom <= p.bottom + 1 };
    });
    await page.waitForTimeout(300);
    assert.ok(scrolled.visible, "滚动面板后按钮仍应可见");
    await page.screenshot({ path: "../Build/panel-inline-scrolled.png" });

    // The enlarged toolbar lives in the same panel, so the same global rule used
    // to stack every button on one spot. Each control must have its own place.
    await page.locator(".screen-stage-bar.minimal button").click();
    await page.waitForTimeout(1200);
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
      return { fullscreen: document.fullscreenElement === stage, boxes, view,
        allStatic: boxes.every((box) => box.position === "static"),
        distinct: new Set(boxes.map((box) => `${box.x},${box.y}`)).size,
        insideViewport: boxes.every((box) => box.x >= 0 && box.right <= view.w && box.y >= 0 && box.bottom <= view.h),
      };
    });
    console.log("toolbar:", JSON.stringify(toolbar, null, 2));
    assert.equal(toolbar.fullscreen, true, "点全屏要真的进入全屏");
    assert.ok(toolbar.allStatic, "放大后按钮也必须留在按钮条内");
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
    console.log("PASS 真实私聊面板：单按钮在画面内、未被切割、滚动后仍可见、放大后按钮居中排成一行");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
