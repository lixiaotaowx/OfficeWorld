// 任务栏头像条的外观与交互：一排头像、悬停出卡片、三个按钮各自发起对应的邀请、
// 没有预览的人显示"这是规则"的占位文案（用户 2026-09-17 的方案 B）。
//
//   node test/browser/dock.cjs     (run from OfficeWeb/)
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
    const page = await browser.newPage({ viewport: { width: 520, height: 260 } });
    page.on("pageerror", (error) => errors.push(error.message));
    // 深色底 + 透明窗口：截图里能看清"贴在任务栏上"的样子。
    await page.goto(`http://127.0.0.1:${port}/test/dock-harness.html`);
    await page.waitForFunction(() => document.querySelectorAll(".dock-avatar").length === 3, null, { timeout: 30000 });
    await page.waitForTimeout(200);

    const strip = await page.evaluate(() => ({
      avatars: [...document.querySelectorAll(".dock-avatar")].map(node => ({
        label: node.getAttribute("aria-label"),
        title: node.getAttribute("title"),
        here: node.classList.contains("here"),
        sharing: Boolean(node.querySelector(".dock-sharing")),
        unread: node.querySelector(".dock-unread")?.textContent || "",
        dot: node.querySelector(".dock-dot")?.className || "",
      })),
      grip: Boolean(document.querySelector(".dock-grip")),
      empty: document.querySelector(".dock-empty")?.textContent || "",
    }));
    console.log("strip:", JSON.stringify(strip));
    assert.equal(strip.grip, true, "要有一个拖动把手");
    assert.deepEqual(strip.avatars.map(a => a.label), ["同事乙", "客户丙", "小李"], "顺序按规则排（未接来电/未读优先）");
    assert.equal(strip.avatars.find(a => a.label === "同事乙").sharing, true, "正在共享要有标记");
    assert.equal(strip.avatars.find(a => a.label === "客户丙").unread, "3", "未读要有红点数字");
    assert.equal(strip.avatars.find(a => a.label === "小李").unread, "!", "未接来电优先显示 !");
    assert.match(strip.avatars.find(a => a.label === "客户丙").dot, /away/, "离座是红点");
    await page.screenshot({ path: resolve("../Build/dock-strip.png") });

    // 悬停有预览的人：先要一帧，主进程回帧后卡片里出现图片。
    await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
    await page.waitForTimeout(150);
    const want = await page.evaluate(() => window.__want.slice());
    assert.deepEqual(want, ["p1"], "悬停要主动索取这个人的最近一帧");
    assert.match(await page.locator(".dock-shot-empty").textContent(), /正在获取|暂时没有/);
    await page.evaluate(() => window.__pushPreview({ id: "p1", image:
      "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="135"><rect width="240" height="135" fill="#e9e6dd"/><rect x="20" y="20" width="200" height="95" fill="#c9d6c2"/><rect x="40" y="40" width="120" height="10" fill="#3b4a3d"/><rect x="40" y="60" width="160" height="10" fill="#6d7c70"/></svg>') }));
    await page.waitForSelector(".dock-shot img");
    const card = await page.evaluate(() => {
      const node = document.querySelector(".dock-card");
      return { text: node.textContent.replace(/\s+/g, " ").trim(),
        buttons: [...node.querySelectorAll("button")].map(b => b.getAttribute("title")),
        image: node.querySelector("img")?.getAttribute("alt") };
    });
    console.log("card:", JSON.stringify(card));
    assert.equal(card.image, "同事乙 的屏幕小图");
    assert.deepEqual(card.buttons, ["请求观看对方屏幕", "把我的屏幕分享给对方", "邀请语音通话"]);
    await page.screenshot({ path: resolve("../Build/dock-hover-card.png") });

    // 三个按钮：各自发起对应的动作，并且带回这个人的 id。
    for (const [index, kind] of [[0, "watch"], [1, "share"], [2, "call"]]) {
      await page.locator('.dock-avatar[aria-label="同事乙"]').hover();
      await page.waitForSelector(".dock-card");
      await page.locator(".dock-card-actions button").nth(index).click();
      await page.waitForTimeout(80);
      const last = await page.evaluate(() => window.__actions.at(-1));
      assert.deepEqual(last, [kind, "p1"], `第 ${index + 1} 个按钮应该是 ${kind}`);
    }
    assert.deepEqual(await page.evaluate(() => window.__actions),
      [["watch", "p1"], ["share", "p1"], ["call", "p1"]], "三个按钮都点了，各走一次");

    // 访客：没有预览，必须说清是规则如此。
    await page.locator('.dock-avatar[aria-label="客户丙"]').hover();
    await page.waitForTimeout(1100);
    const placeholder = await page.locator(".dock-shot-empty").textContent();
    console.log("visitor placeholder:", placeholder);
    assert.match(placeholder, /不广播屏幕预览/);
    await page.screenshot({ path: resolve("../Build/dock-no-preview.png") });

    // 透明区不抢任务栏的点击：移到头像条上要接管，移开后要还回去。
    await page.mouse.move(30, 230);        // 头像条（贴窗口底部）
    await page.waitForTimeout(80);
    await page.mouse.move(30, 20);         // 透明/卡片之外的区域
    await page.waitForTimeout(80);
    const interactive = await page.evaluate(() => window.__interactive.slice());
    console.log("interactive:", JSON.stringify(interactive));
    assert.ok(interactive.includes(true), "指针在头像条上要接管点击");
    assert.equal(interactive.at(-1), false, "离开后要把点击还给任务栏");

    // 没有人在线：给一句人话，而不是一条空条。
    await page.evaluate(() => window.__pushState({ people: [], sharing: false, missed: 0, hidden: false }));
    await page.waitForTimeout(120);
    assert.match(await page.locator(".dock-empty").textContent(), /没有其他人在线/);

    // 共享屏幕时整条隐藏。
    await page.evaluate(() => window.__pushState({ people: [], sharing: true, missed: 0, hidden: true }));
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => document.querySelectorAll(".dock").length), 0, "隐藏时整条不渲染");

    assert.deepEqual(errors, []);
    console.log("PASS 头像条：一排头像、悬停缩略图、三个按钮、占位文案、空/隐藏状态");
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
