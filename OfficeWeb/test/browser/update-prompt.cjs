// 更新提示弹窗：右下角、文案对、有进度条、按钮分别触发下载/安装/稍后
// （用户 2026-09-17：「网页检测到新版本就弹出更新软件的提示，然后就是下载进度条，
// 然后安装器打开覆盖安装」）。
//
//   node test/browser/update-prompt.cjs     (run from OfficeWeb/)
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
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  const open = async (query) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/update-harness.html${query}`);
    await page.waitForFunction(() => window.__updateReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(300);
    return page;
  };
  try {
    // 1. 发现新版本
    const available = await open("");
    const card = await available.evaluate(() => {
      const node = document.querySelector(".update-prompt");
      const box = node.getBoundingClientRect();
      return {
        text: node.textContent.replace(/\s+/g, " ").trim(),
        inBottomRight: box.right <= window.innerWidth + 1 && box.bottom <= window.innerHeight + 1 &&
          box.left > window.innerWidth / 2 && box.top > window.innerHeight / 2,
        buttons: [...node.querySelectorAll("button")].map(b => b.textContent.trim()),
        bars: node.querySelectorAll(".update-bar").length,
      };
    });
    console.log("available:", JSON.stringify(card));
    assert.match(card.text, /发现新版本 0\.1\.14/);
    assert.match(card.text, /当前 0\.1\.13/);
    assert.match(card.text, /96\.5 MB/);
    assert.equal(card.inBottomRight, true, "更新提示要在窗口右下角");
    assert.deepEqual(card.buttons, ["下载更新", "稍后"]);
    assert.equal(card.bars, 0, "还没开始下载就不该有进度条");
    await available.screenshot({ path: resolve("../Build/update-available.png") });
    await available.getByRole("button", { name: "下载更新" }).click();
    await available.getByRole("button", { name: "稍后" }).click();
    assert.deepEqual(await available.evaluate(() => [window.__started, window.__later]), [1, 1]);
    await available.close();

    // 2. 下载中：进度条真的按百分比走
    const downloading = await open("?stage=downloading");
    const bar = await downloading.evaluate(() => {
      const node = document.querySelector(".update-prompt");
      const fill = node.querySelector(".update-bar-fill");
      const progress = node.querySelector(".update-bar");
      return {
        text: node.textContent.replace(/\s+/g, " ").trim(),
        width: fill.style.width,
        percent: progress.getAttribute("aria-valuenow"),
        role: progress.getAttribute("role"),
        disabled: [...node.querySelectorAll("button")].map(b => b.disabled),
      };
    });
    console.log("downloading:", JSON.stringify(bar));
    assert.match(bar.text, /正在下载/);
    assert.match(bar.text, /41 MB \/ 96\.5 MB/, "要显示已下载/总量");
    assert.equal(bar.width, "42.5%", "进度条宽度跟着进度走");
    assert.equal(bar.percent, "42.5");
    assert.equal(bar.role, "progressbar");
    assert.deepEqual(bar.disabled, [true, false], "下载中不允许重复点下载，但仍可稍后");
    await downloading.screenshot({ path: resolve("../Build/update-downloading.png") });
    await downloading.close();

    // 3. 下载完成：按钮变成「立即安装」，点了就走安装
    const ready = await open("?stage=ready");
    const done = await ready.evaluate(() => ({
      text: document.querySelector(".update-prompt").textContent.replace(/\s+/g, " ").trim(),
      buttons: [...document.querySelectorAll(".update-prompt button")].map(b => b.textContent.trim()),
    }));
    console.log("ready:", JSON.stringify(done));
    assert.match(done.text, /下载完成/);
    assert.deepEqual(done.buttons, ["立即安装", "稍后"]);
    await ready.getByRole("button", { name: "立即安装" }).click();
    assert.equal(await ready.evaluate(() => window.__installed), 1, "点了要真的去启动安装器");
    await ready.close();

    // 4. 老客户端（没有版本桥）：提示还在，但说明要手动安装
    const old = await open("?old=1");
    const fallback = await old.evaluate(() => document.querySelector(".update-prompt").textContent.replace(/\s+/g, " ").trim());
    console.log("old client:", JSON.stringify(fallback));
    assert.match(fallback, /有新版本 0\.1\.14/);
    assert.match(fallback, /不支持自动更新/);
    await old.screenshot({ path: resolve("../Build/update-old-client.png") });
    await old.close();

    assert.deepEqual(errors, []);
    console.log("PASS 更新提示：右下角弹出、进度条、立即安装、老客户端手动提示");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
