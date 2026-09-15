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

    // The relayed point must be the fraction of the PICTURE, letterboxing included,
    // at whatever the window size is - the regression was a stroke that drifted with
    // the layout because the pointer was measured against the drawing surface.
    async function dragAtFraction(fx, fy) {
      const spot = await page.evaluate(([x, y]) => {
        const video = document.querySelector(".screen-stage video");
        const rect = video.getBoundingClientRect();
        const width = video.videoWidth || rect.width, height = video.videoHeight || rect.height;
        const scale = Math.min(rect.width / width, rect.height / height);
        const box = { x: rect.left + (rect.width - width * scale) / 2,
          y: rect.top + (rect.height - height * scale) / 2, width: width * scale, height: height * scale };
        return { x: box.x + x * box.width, y: box.y + y * box.height };
      }, [fx, fy]);
      await page.evaluate(() => { window.__drawn.length = 0; });
      await page.mouse.move(spot.x, spot.y);
      await page.mouse.down();
      await page.mouse.move(spot.x + 6, spot.y + 4);
      await page.mouse.up();
      await page.waitForTimeout(150);
      return page.evaluate(() => window.__drawn.flatMap((entry) => entry.points)[0] || null);
    }
    for (const size of [{ width: 420, height: 700 }, { width: 1280, height: 720 }]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(250);
      const mapped = await dragAtFraction(0.25, 0.75);
      console.log(`mapping ${size.width}x${size.height}:`, JSON.stringify(mapped));
      assert.ok(mapped, `窗口 ${size.width}x${size.height} 时标注必须能落点`);
      assert.ok(Math.abs(mapped[0] - 0.25) < 0.02 && Math.abs(mapped[1] - 0.75) < 0.02,
        `窗口 ${size.width}x${size.height} 的映射应命中画面比例 (得到 ${mapped})`);
    }

    // The local echo shows the stroke immediately, before the round trip through the
    // sharer's screen could possibly have come back.
    const echoVisible = await page.evaluate(() =>
      getComputedStyle(document.querySelector(".screen-stage-ink")).display !== "none");
    const videoBox = await page.locator(".screen-stage video").boundingBox();
    await page.mouse.move(videoBox.x + videoBox.width * 0.3, videoBox.y + videoBox.height * 0.4);
    await page.mouse.down();
    await page.mouse.move(videoBox.x + videoBox.width * 0.4, videoBox.y + videoBox.height * 0.5);
    const echoed = await page.evaluate(() => {
      const canvas = document.querySelector(".screen-stage-ink");
      const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = false;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) { painted = true; break; }
      return { painted, drawn: window.__drawn.length };
    });
    await page.mouse.up();
    await page.waitForTimeout(1800);
    const afterHandover = await page.evaluate(() => {
      const canvas = document.querySelector(".screen-stage-ink");
      const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] > 0) return true;
      return false;
    });
    console.log("echo:", JSON.stringify({ echoVisible, echoed, afterHandover }));
    assert.equal(echoVisible, true, "标注时本机回显层要显示");
    assert.equal(echoed.painted, true, "落笔必须立刻在本机看到笔迹，不用等远端回传");
    assert.ok(echoed.drawn >= 1, "本机回显的同时仍要转发给对方的屏幕");
    assert.equal(afterHandover, false, "远端笔迹到达后本机回显要交还，避免双份墨迹");
    assert.deepEqual(errors, []);

    // A browser sharer cannot host the annotation layer on its own screen, so the tools
    // are withheld instead of promising marks that could never appear (user, 2026-09-15).
    const web = await browser.newPage({ viewport: { width: 900, height: 700 } });
    web.on("pageerror", (error) => errors.push(error.message));
    await web.goto(`http://127.0.0.1:${port}/test/screen-stage-harness.html?readonly=1`);
    await web.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await web.locator(".screen-stage-expand", { hasText: "最大化" }).click();
    await web.waitForTimeout(500);
    const webTools = await web.evaluate(() => ({
      labels: [...document.querySelectorAll(".screen-stage-bar button")].map((b) => b.textContent.trim()),
      drawSurface: document.querySelectorAll(".screen-stage-draw").length,
    }));
    console.log("web sharer tools:", JSON.stringify(webTools));
    assert.equal(webTools.labels.includes("标注"), false, "网页登录者分享时不给标注入口");
    assert.equal(webTools.labels.includes("撤销"), false, "也不给撤销");
    assert.equal(webTools.labels.includes("清空"), false, "也不给清空");
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
    // …and the PICTURE must fill the screen. Native full screen is a window mode, so the
    // `:fullscreen` pseudo-class never matches: without a state class only the window
    // grew while the video stayed at its inline `max-height: 62vh` (user, 2026-09-15:
    // "怎么窗口全屏了 但是视频没有").
    const filled = await desktop.evaluate(() => {
      const stage = document.querySelector(".screen-stage");
      const video = stage.querySelector("video");
      const stageBox = stage.getBoundingClientRect();
      return {
        hasClass: stage.classList.contains("fullscreen"),
        viewport: { width: window.innerWidth, height: window.innerHeight },
        stage: { left: stageBox.left, top: stageBox.top, width: stageBox.width, height: stageBox.height },
        videoHeight: video.getBoundingClientRect().height,
      };
    });
    console.log("desktop fills screen:", JSON.stringify(filled));
    assert.equal(filled.hasClass, true, "原生全屏必须给舞台加 fullscreen 类，否则没有 CSS 可依据");
    assert.ok(Math.abs(filled.stage.width - filled.viewport.width) <= 1
      && Math.abs(filled.stage.left) <= 1 && Math.abs(filled.stage.top) <= 1, "全屏时舞台要铺满屏幕");
    assert.ok(filled.videoHeight > filled.viewport.height * 0.9,
      `全屏时视频要占满高度，不能留在内联的 62vh（实测 ${Math.round(filled.videoHeight)} / ${filled.viewport.height}）`);
    // The event flipped the stage into enlarged mode, so leave through its toolbar.
    await desktop.locator(".screen-stage-bar button", { hasText: "退出全屏" }).click();
    await desktop.waitForTimeout(300);
    assert.deepEqual(await desktop.evaluate(() => window.__calls), [true, false], "再点一次应退出全屏");

    // Hanging up destroys the stage. If the window was full screen at that moment it
    // must be handed back to the normal window: otherwise the app stays full screen
    // with its title bar (and maximise button) hidden and no way out.
    await desktop.locator(".screen-stage-bar button", { hasText: "全屏" }).click();
    await desktop.waitForTimeout(300);
    assert.deepEqual(await desktop.evaluate(() => window.__calls), [true, false, true]);
    await desktop.evaluate(() => window.__unmountStage());
    await desktop.waitForTimeout(300);
    const afterUnmount = await desktop.evaluate(() => ({
      calls: window.__calls, stage: document.querySelectorAll(".screen-stage").length,
    }));
    console.log("desktop unmount:", JSON.stringify(afterUnmount));
    assert.deepEqual(afterUnmount.calls, [true, false, true, false],
      "挂断/关闭共享后必须退出全屏，否则窗口卡在全屏且没有最大化按钮");
    assert.equal(afterUnmount.stage, 0);

    // Regression (user, 2026-09-15): "挂断后为啥软件还变小了". Hanging up an ORDINARY
    // call — one that was never put whole-screen — must not ask the window to leave full
    // screen. `setFullScreen(false)` makes Windows restore the window's saved placement,
    // and for a window that never entered full screen that restore SHRINKS it.
    const plain = await browser.newPage({ viewport: { width: 420, height: 700 } });
    plain.on("pageerror", (error) => errors.push(error.message));
    await plain.goto(`http://127.0.0.1:${port}/test/screen-stage-harness.html?desktop=1`);
    await plain.waitForFunction(() => window.__stageReady === true, null, { timeout: 30000 });
    await plain.waitForTimeout(800);
    await plain.evaluate(() => window.__unmountStage());
    await plain.waitForTimeout(300);
    const plainCalls = await plain.evaluate(() => window.__calls);
    console.log("desktop unmount without ever going fullscreen:", JSON.stringify(plainCalls));
    assert.deepEqual(plainCalls, [],
      "没进过全屏的挂断绝不能调 setFullscreen(false)——那会把窗口缩回旧的摆放尺寸");
    await plain.close();

    assert.deepEqual(errors, []);
    console.log("PASS 小窗两个按钮 / 最大化占满窗口 / 全屏占满屏幕 / 客户端走原生全屏 / 标注模式撤销清空 / 各种窗口比例映射正确 / 本机即时回显 / 挂断退出全屏 / 普通挂断不动窗口");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
