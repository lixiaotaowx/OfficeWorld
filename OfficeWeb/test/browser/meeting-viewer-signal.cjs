// 「看队友全屏」那块画面：一进来就是全屏，"返回头像条"右边要有信号条。
//
// 用户 2026-10-15：「需要新加一个信号条，在观看队友全屏的时候，在视频播放的"返回头像条"
// 按钮的右侧。另外把最大化去掉，现在只用全屏就可以了」。
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
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/meeting-viewer-harness.html`);
    await page.waitForFunction(() => window.__viewerReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(900);

    const geometry = await page.evaluate(() => {
      const bar = document.querySelector(".screen-stage-bar");
      const buttons = [...bar.querySelectorAll("button")];
      const back = buttons.find(button => button.textContent.trim() === "返回头像条");
      const panel = bar.querySelector(".signal-bars-panel");
      const head = panel?.querySelector(".signal-head");
      const box = element => element ? element.getBoundingClientRect() : null;
      return {
        labels: buttons.map(button => button.textContent.trim()),
        stageClass: document.querySelector(".screen-stage").className,
        stageCoversScreen: (() => {
          const stage = document.querySelector(".screen-stage").getBoundingClientRect();
          return stage.top <= 1 && stage.left <= 1 &&
            stage.width >= window.innerWidth - 2 && stage.height >= window.innerHeight - 2;
        })(),
        hasPanel: Boolean(panel),
        signalText: panel ? panel.textContent.trim() : "",
        litBars: panel ? panel.querySelectorAll(".signal-bars i.on").length : 0,
        level: panel?.querySelector(".signal-bars")?.getAttribute("data-level"),
        back: box(back), panel: box(panel), head: box(head),
        barBackground: panel ? getComputedStyle(panel).backgroundColor : "",
      };
    });
    console.log("viewer:", JSON.stringify(geometry));
    // ① 一进来就铺满整个屏幕（生产环境走原生整屏，见下一条断言）。"最大化"那一档已删。
    assert.ok(geometry.stageClass.includes("fullscreen"), "stage 要有 fullscreen 类");
    assert.equal(geometry.stageCoversScreen, true, "看队友必须一进来就铺满屏幕");
    assert.ok(!geometry.stageClass.includes("maximized"), "不该再出现 maximized 类");
    assert.equal(geometry.labels.includes("最大化"), false, "最大化按钮已删");
    assert.equal(geometry.labels.includes("还原窗口"), false, "「还原窗口」也一起删掉");
    assert.equal(geometry.labels.includes("退出全屏"), true, "全屏按钮还在（退出全屏）");
    // 桌面客户端里 `initialFullscreen` 走的是**原生整屏**（DOM Fullscreen API 在无边框透明
    // 窗口里是空操作），浏览器里会被"没有用户手势"拒掉 —— 两种都核一遍，别只看类。
    // ② 信号条在「返回头像条」**右侧**
    assert.equal(geometry.hasPanel, true, "要有信号条");
    assert.ok(geometry.head, "信号条要有可测量的内容");
    assert.ok(geometry.panel.left >= geometry.back.right - 1,
      `信号条必须在「返回头像条」右边 (back.right=${geometry.back.right}, panel.left=${geometry.panel.left})`);
    // 同一行：垂直中心基本对齐
    const backMid = geometry.back.top + geometry.back.height / 2;
    const panelMid = geometry.panel.top + geometry.panel.height / 2;
    assert.ok(Math.abs(backMid - panelMid) < 6,
      `信号条要和按钮同一行 (差 ${Math.round(Math.abs(backMid - panelMid))}px)`);
    // ③ 内容真的画出来了：三格 + 一句延迟/码率 + 档位属性
    assert.equal(geometry.level, "good", "档位要透出来给样式用");
    assert.ok(geometry.litBars >= 1, `信号格要亮起来 (亮了 ${geometry.litBars} 格)`);
    assert.match(geometry.signalText, /信号良好/, "要有那句中文结论");
    assert.match(geometry.signalText, /延迟 42ms/, "要有延迟/码率摘要");
    // ④ 在深色控制条里不能是一块浅底白牌子（`meetings.css` 那套是浅底卡片）
    assert.equal(geometry.barBackground, "rgba(0, 0, 0, 0)",
      `信号条在这里要透明底，实测 ${geometry.barBackground}`);
    await page.screenshot({ path: `${SHOT}/viewer-signal-bars.png` });

    // ⑤ 「返回头像条」照旧能关掉
    await page.getByRole("button", { name: "返回头像条" }).click();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => window.__closed), 1, "点「返回头像条」要关掉");
    assert.deepEqual(errors, []);
    console.log("PASS 全屏打开 / 信号条在返回按钮右侧同一行 / 三格与摘要都画出来 / 深色底适配 / 返回能关");
  } finally {
    await browser.close();
    await vite.close();
  }
})();
