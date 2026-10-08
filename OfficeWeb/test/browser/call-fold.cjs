// 通话窗口折叠：收起后只剩三个按钮（麦克风/共享/挂断），而且面板要缩得够小、
// 视频不再显示；再展开能恢复（用户 2026-09-15：「折叠后只剩三个按钮」「收起的够小」）。
//
//   node test/browser/call-fold.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/call-fold-qa-"));
  const server = createOfficeServer({
    statePath: dir + "/state.json", accountsPath: dir + "/accounts.json", secureCookies: false,
  });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  return { server, dir, base: "http://127.0.0.1:" + server.http.address().port };
}

async function account(base, name, seat) {
  const registered = await fetch(base + "/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ name, password: "1" }),
  });
  assert.equal(registered.status, 200, name + " 注册失败");
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  await fetch(base + "/api/auth/role", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ role: "employee" }),
  });
  const socket = connect(base, { transports: ["websocket"], reconnection: false,
    extraHeaders: { Cookie: cookie, Origin: base } });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve); socket.once("connect_error", reject);
  });
  socket.emit("join", { name });
  await new Promise(resolve => socket.once("people", resolve));
  assert.equal((await socket.emitWithAck("seat", seat)).ok, true, name + " 应能认领工位");
  return { cookie, socket };
}

/** 合成麦克风与屏幕：这里只关心 UI，不碰真实设备。 */
const MEDIA_STUB = () => {
  navigator.mediaDevices.getUserMedia = async () => {
    const ctx = new AudioContext(); await ctx.resume();
    const oscillator = ctx.createOscillator(), gain = ctx.createGain(), dest = ctx.createMediaStreamDestination();
    gain.gain.value = 0.05; oscillator.connect(gain).connect(dest); oscillator.start();
    return dest.stream;
  };
  navigator.mediaDevices.getDisplayMedia = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800; canvas.height = 600;
    const ctx = canvas.getContext("2d");
    setInterval(() => { ctx.fillStyle = "#2f5a44"; ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = "#fff"; ctx.font = "28px sans-serif"; ctx.fillText(String(Date.now()), 20, 80); }, 100);
    return canvas.captureStream(12);
  };
};

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const sockets = [];
  try {
    const alpha = await account(base, "折叠甲", 0); sockets.push(alpha.socket);
    const beta = await account(base, "折叠乙", 1); sockets.push(beta.socket);
    const pages = [];
    for (const user of [alpha, beta]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
      const [name, ...rest] = user.cookie.split("=");
      await context.addCookies([{ name, value: rest.join("="), url: base }]);
      await context.addInitScript(MEDIA_STUB);
      await context.route(base + "/**", async route => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname.startsWith("/api/") || pathname.startsWith("/socket.io/")) return route.continue();
        const file = path.join(build, pathname === "/" ? "index.html" : pathname);
        if (fs.existsSync(file)) return route.fulfill({ path: file });
        return route.continue();
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(base + "/?debug=1");
      await page.locator(".seat-grid .seat").first().waitFor({ timeout: 90000 });
      pages.push({ page, errors, context });
    }
    const a = pages[0].page, b = pages[1].page;
    // 两边都要真的进到空间里（人数到 2）再发邀请，否则请求会被服务器丢掉。
    for (const page of [a, b]) {
      await page.waitForFunction(() =>
        /2\s*人在线/.test(document.querySelector("header .connection")?.textContent || ""),
        null, { timeout: 60000 });
    }

    const diagnose = async message => {
      const dump = async page => ({
        errors: [], text: (await page.locator("body").textContent()).replace(/\s+/g, " ").slice(0, 400),
        invites: await page.locator(".incoming-call").count(),
        panel: await page.locator(".private-calls").count(),
      });
      console.error(message + " " + JSON.stringify({ a: await dump(a), b: await dump(b) },
        null, 1));
    };

    // 甲请乙共享屏幕，乙同意——真的走一次 LiveKit（本地 .env 指向正式 SFU）。
    await a.locator(".seat-grid .seat").nth(1).click();
    await a.getByRole("button", { name: "请求观看对方屏幕", exact: true }).click();
    await b.getByRole("button", { name: "同意并接通", exact: true }).click({ timeout: 30000 })
      .catch(async error => { await diagnose("乙没收到邀请："); throw error; });
    await a.locator(".private-calls video").first().waitFor({ state: "visible", timeout: 60000 });
    await a.waitForFunction(() => [...document.querySelectorAll(".private-calls video")]
      .some(video => video.videoWidth > 0), null, { timeout: 60000 });

    const panel = a.locator(".private-calls");
    const video = a.locator(".private-calls video").first();
    const before = await panel.boundingBox();
    assert.ok(await video.isVisible(), "展开时应该看得到对方的画面");
    assert.equal((await a.locator(".call-fold").textContent()).trim(), "收起",
      "收起按钮要有字，不要只是个小箭头");

    // 收起：只剩三个按钮，视频不显示，面板要明显变小。
    await a.locator(".call-fold").click();
    await a.locator(".private-calls.folded").waitFor({ timeout: 10000 });
    assert.equal((await a.locator(".call-fold").textContent()).trim(), "展开",
      "收起之后这个按钮要变成「展开」");
    const labels = await a.locator(".private-call-actions.folded button")
      .evaluateAll(nodes => nodes.map(node => node.getAttribute("aria-label")));
    assert.equal(labels.length, 3, "收起后只能有三个按钮，实际：" + JSON.stringify(labels));
    assert.match(labels[0], /^(静音|开启或重试麦克风|切到此通话并开麦)$/, labels[0]);
    assert.match(labels[1], /^(分享屏幕|停止共享)$/, labels[1]);
    assert.equal(labels[2], "挂断通话");
    assert.equal(await video.isVisible(), false, "收起后不该还显示视频");
    assert.equal(await a.locator(".call-folded > span").first().isVisible(), false, "收起后状态文字也不显示");
    const after = await panel.boundingBox();
    if (after.height > 110 || after.width > 200) {
      const parts = await a.locator(".private-calls > *").evaluateAll(nodes => nodes.map(node => {
        const box = node.getBoundingClientRect();
        const inner = [...node.children].map(child => {
          const innerBox = child.getBoundingClientRect();
          return { tag: child.tagName, cls: child.className || null,
            h: Math.round(innerBox.height), w: Math.round(innerBox.width),
            display: getComputedStyle(child).display };
        });
        return { tag: node.tagName, cls: node.className || null,
          h: Math.round(box.height), w: Math.round(box.width), inner,
          html: node.outerHTML.slice(0, 400) };
      }));
      const header = await a.locator(".call-folded .call-heading").evaluate(node => ({
        h: Math.round(node.getBoundingClientRect().height),
        wrap: getComputedStyle(node).flexWrap,
        kids: [...node.children].map(child => ({
          tag: child.tagName, cls: child.className || null,
          h: Math.round(child.getBoundingClientRect().height),
          w: Math.round(child.getBoundingClientRect().width),
          display: getComputedStyle(child).display,
          whiteSpace: getComputedStyle(child).whiteSpace,
        })),
      }));
      const sheets = await a.evaluate(() => [...document.styleSheets].map(sheet => sheet.href));
      console.error("收起后还是很大：" + JSON.stringify({ panel: after, parts, header, sheets }));
    }
    assert.ok(after.width <= 200, "收起后宽度要够小，实际 " + Math.round(after.width));
    assert.ok(after.height <= 110, "收起后高度要够小，实际 " + Math.round(after.height));
    assert.ok(after.width < before.width / 2, "收起后至少要比展开时窄一半");
    await a.screenshot({ path: path.resolve("Build/call-folded.png") });
    // 共享方那边的"屏幕小窗口"：标题不该撑成一长条。
    await b.screenshot({ path: path.resolve("Build/sharing-preview-compact.png") });

    assert.equal(await a.locator(".private-call-actions.folded button").first().isEnabled(), true,
      "收起后麦克风按钮要可用");

    // 收起状态下按钮仍然是真的在干活：先展开验证画面回来，再收起用挂断收尾。
    await a.locator(".call-fold").click();
    await a.locator(".private-calls.folded").waitFor({ state: "detached", timeout: 10000 });
    assert.equal(await video.isVisible(), true, "展开后画面要回来（视频没有卸载）");

    await a.locator(".call-fold").click();
    await a.locator(".private-calls.folded").waitFor({ timeout: 10000 });
    await a.locator(".private-call-actions.folded button").last().click();
    await a.locator(".private-calls").waitFor({ state: "hidden", timeout: 15000 });
    await b.locator(".private-calls").waitFor({ state: "hidden", timeout: 15000 });
    assert.deepEqual(pages[0].errors, []);
    assert.deepEqual(pages[1].errors, []);
    console.log("PASS 通话窗口收起后只剩三个按钮、面板缩到最小、视频隐藏；展开可恢复，收起时挂断也管用");
    for (const entry of pages) await entry.context.close();
  } finally {
    sockets.forEach(socket => socket.disconnect());
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
