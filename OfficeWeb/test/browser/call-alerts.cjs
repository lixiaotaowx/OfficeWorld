// A missed call has to be impossible to miss: the popup lives in the bottom-right corner,
// says 未接通，稍后重试 for the caller and 未接来电 for the callee, and can dial again
// (user, 2026-09-15).
//
//   node test/browser/call-alerts.cjs     (run from OfficeWeb/)
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
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${port}/test/call-alert-harness.html`);
    await page.waitForFunction(() => window.__alertsReady === true, null, { timeout: 30000 });
    await page.waitForTimeout(400);

    const layout = await page.evaluate(() => {
      const stack = document.querySelector(".call-alerts");
      const cards = [...document.querySelectorAll(".call-alert")];
      const box = stack.getBoundingClientRect();
      const first = cards[0].getBoundingClientRect();
      return {
        texts: cards.map((card) => card.textContent.replace(/\s+/g, " ").trim()),
        inBottomRight: box.right <= window.innerWidth + 1 && box.bottom <= window.innerHeight + 1 &&
          box.left > window.innerWidth / 2 && box.top > window.innerHeight / 2,
        firstTop: Math.round(first.top), viewport: window.innerHeight,
        buttons: [...cards[0].querySelectorAll("button")].map((button) => button.textContent.trim()),
        icons: document.querySelectorAll(".call-alert-icon svg").length,
      };
    });
    console.log("alerts:", JSON.stringify(layout));
    assert.equal(layout.texts.length, 2, "两条提示都要在");
    assert.match(layout.texts[0], /未接通，稍后重试/, "呼叫方看到未接通");
    assert.match(layout.texts[0], /同事乙/);
    assert.match(layout.texts[1], /未接来电/, "被叫方看到未接来电");
    assert.match(layout.texts[1], /客户丙/);
    assert.equal(layout.inBottomRight, true, "弹窗必须在窗口右下角");
    assert.equal(layout.icons, 2, "每条提示都要有图标");
    assert.deepEqual(layout.buttons, ["再拨一次", "知道了"]);
    await page.screenshot({ path: resolve("../Build/call-alerts.png") });

    // They stay: a missed call is read after coming back to the machine, so nothing may
    // fade on its own (user, 2026-09-15: "未接来电是否一直显示 只可以手动关闭").
    await page.waitForTimeout(13000);
    const still = await page.evaluate(() =>
      [...document.querySelectorAll(".call-alert")].map((card) => card.textContent.replace(/\s+/g, " ").trim()));
    console.log("after 13s:", JSON.stringify(still));
    assert.equal(still.length, 2, "13 秒后两张未接来电提示仍在（不能自动消失）");

    // 再拨一次 redials that person, 知道了 dismisses just that card.
    await page.locator(".call-alert").first().getByRole("button", { name: "再拨一次" }).click();
    await page.locator(".call-alert").nth(1).getByRole("button", { name: "知道了" }).click();
    const actions = await page.evaluate(() => ({ retried: window.__retried, dismissed: window.__dismissed }));
    console.log("actions:", JSON.stringify(actions));
    assert.deepEqual(actions.retried, ["peer-1"], "再拨一次要回拨同一个人");
    assert.deepEqual(actions.dismissed, ["a2"], "知道了只关掉那一条");
    assert.deepEqual(errors, []);
    console.log("PASS 未接电话弹窗在右下角、文案正确、可回拨、可关闭");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
