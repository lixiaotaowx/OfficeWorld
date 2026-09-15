// Does the desk preview really appear, including on the manager's desk and while
// the person holding the desk is the only one online?
//
// Runs the built app against an isolated server with a stubbed desktop bridge, so
// the "screen capture" is a canvas and no real screen or account is touched. The
// manager monitor is inspected through window.__officeDebug (?debug=1).
//
//   node test/browser/desk-preview.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

const BOSS_SEAT = 8;
const ADMIN_PASSWORD = "qa-admin";

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/desk-preview-qa-"));
  const server = createOfficeServer({
    statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json",
    secureCookies: false,
    adminPassword: ADMIN_PASSWORD,
  });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  return { server, dir, base: "http://127.0.0.1:" + server.http.address().port };
}

/** Register an account, choose its identity, and return its session cookie. */
async function join(base, name, role) {
  const registered = await fetch(base + "/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({ name, password: "1" }),
  });
  assert.equal(registered.status, 200, name + " 注册失败");
  const cookie = registered.headers.get("set-cookie").split(";")[0];
  const chosen = await fetch(base + "/api/auth/role", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
    body: JSON.stringify({ role }),
  });
  assert.equal(chosen.status, 200, name + " 身份保存失败");
  return cookie;
}

/** Register an account, take a permanent desk, then leave it behind offline. */
async function claimDeskAndLeave(base, name, seat) {
  const cookie = await join(base, name, "employee");
  const socket = connect(base, { transports: ["websocket"], reconnection: false,
    extraHeaders: { Cookie: cookie, Origin: base } });
  await new Promise((resolve, reject) => {
    socket.once("connect", resolve); socket.once("connect_error", reject);
  });
  socket.emit("join", { name });
  await new Promise(resolve => socket.once("people", resolve));
  const claimed = await socket.emitWithAck("seat", seat);
  assert.equal(claimed.ok, true, name + " 应该能认领工位");
  socket.disconnect();
  return cookie;
}

async function openPage(browser, base, build, cookie) {
  const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
  if (cookie) {
    const [name, ...rest] = cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
  }
  await context.addInitScript(() => {
    window.__qaFrames = 0;
    window.officeDesktop = {
      readLogin: async () => null,
      saveLogin: async () => true,
      clearLogin: async () => true,
      displays: async () => [{ id: "1", name: "屏幕 1", width: 1920, height: 1080, selected: true }],
      selectDisplay: async () => true,
      previewFrame: async () => {
        window.__qaFrames += 1;
        const canvas = document.createElement("canvas");
        canvas.width = 300; canvas.height = 169;
        const paint = canvas.getContext("2d");
        paint.fillStyle = "#2f6f3d"; paint.fillRect(0, 0, 300, 169);
        return canvas.toDataURL("image/jpeg", 0.55);
      },
    };
    navigator.mediaDevices.getDisplayMedia = async () => { throw Error("Unexpected picker"); };
    navigator.mediaDevices.getUserMedia = async () => { throw Error("Unexpected microphone"); };
  });
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
  await page.waitForFunction(() => window.__officeDebug?.monitors?.slots?.size > 0, null, { timeout: 90000 });
  return { context, page, errors };
}

const readSeat = (page, seat) => page.evaluate(index => {
  const slots = window.__officeDebug.monitors.slots;
  return { built: slots.size, hasScreen: !!window.__officeDebug.monitors.meshFor(index),
    shown: slots.get(index)?.shown || null, frames: window.__qaFrames || 0 };
}, seat);

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const report = {};
  try {
    // 1) The manager's desk, held by a member, alone in the office: their own monitor
    //    must show their own screen without waiting for a colleague to log in.
    const bossCookie = await join(base, "李文杰测试", "employee");
    const boss = await openPage(browser, base, build, bossCookie);
    await boss.page.waitForFunction(index => window.__officeDebug.monitors.slots.get(index)?.shown,
      BOSS_SEAT, { timeout: 20000 }).catch(() => {});
    report.boss = await readSeat(boss.page, BOSS_SEAT);
    report.bossErrors = boss.errors;
    const roster = JSON.parse(fs.readFileSync(path.join(dir, "state.json"), "utf8"));
    report.bossRoster = roster.seats[BOSS_SEAT]?.name || null;

    // 2) A plain visiting client holds a sofa, must never capture, yet still sees the
    //    manager's screen. Who is offered a conversation matters here: an account from
    //    long ago must be gone, a desk holder who stepped out must still be listed.
    await join(base, "老同事", "employee");
    await claimDeskAndLeave(base, "离线同事", 2);
    const guestCookie = await join(base, "客户乙", "visitor");
    const guest = await openPage(browser, base, build, guestCookie);
    await guest.page.waitForFunction(index => window.__officeDebug.monitors.slots.get(index)?.shown,
      BOSS_SEAT, { timeout: 20000 }).catch(() => {});
    report.guest = await readSeat(guest.page, BOSS_SEAT);
    report.guestErrors = guest.errors;
    report.bossAfterGuest = await readSeat(boss.page, BOSS_SEAT);

    // A visitor must be callable: focusing the visitor row has to point the detail card
    // (and its voice / screen actions) at them, since they hold no desk (user,
    // 2026-09-15: "无法给访客打电话").
    await boss.page.locator(".visitor-strip .visitor").first().click();
    await boss.page.waitForTimeout(700);
    report.visitorCard = await boss.page.evaluate(() => {
      const detail = document.querySelector(".detail");
      return {
        name: detail.querySelector("h3")?.textContent?.trim() || null,
        eyebrow: detail.querySelector(".eyebrow")?.textContent?.trim() || null,
        actions: [...detail.querySelectorAll(".detail-actions button")]
          .map((button) => ({ label: button.textContent.trim(), disabled: button.disabled })),
      };
    });
    await boss.page.screenshot({ path: path.resolve("Build/visitor-call-card.png") });
    // A visitor is seated on a sofa by the server and must never be asked to click a
    // chair (user, 2026-09-15); the bottom bar should say where they are sitting.
    report.guestPicker = await guest.page.locator(".seat-picker-hint").count();
    report.guestIdentity = await guest.page.locator(".bottom-bar .identity small").textContent();
    // The public channel is not for visitors: the chat list must not offer it.
    await guest.page.getByRole("button", { name: /^聊天/ }).first().click();
    await guest.page.locator(".conversation-list-heading, .conversation-heading").first().waitFor();
    report.guestChatRows = await guest.page.locator(".conversation-row").allTextContents();

    // 3) A member without a desk still gets the picker, so the hint is only gone for
    //    the people it does not apply to.
    const memberCookie = await join(base, "成员丙", "employee");
    const member = await openPage(browser, base, build, memberCookie);
    await member.page.waitForTimeout(1500);
    report.memberPicker = await member.page.locator(".seat-picker-hint").count();
    report.memberErrors = member.errors;

    // 4) Somebody shown out of the space leaves every conversation list, and their own
    //    client returns to the login screen instead of sitting in a dead office.
    const adminCookie = await join(base, "管理员QA", "employee");
    const adminSocket = connect(base, { transports: ["websocket"], reconnection: false,
      extraHeaders: { Cookie: adminCookie, Origin: base } });
    await new Promise((resolve, reject) => {
      adminSocket.once("connect", resolve); adminSocket.once("connect_error", reject);
    });
    adminSocket.emit("join", { name: "管理员QA" });
    await new Promise(resolve => adminSocket.once("people", resolve));
    report.chatBefore = await guest.page.locator(".conversation-row").allTextContents();
    const shownOut = await adminSocket.emitWithAck("admin", { seat: BOSS_SEAT, password: ADMIN_PASSWORD });
    assert.equal(shownOut.ok, true, "管理员应能请出工位上的人");
    await guest.page.waitForTimeout(1200);
    report.chatAfter = await guest.page.locator(".conversation-row").allTextContents();
    report.bossBackAtLogin = await boss.page.getByLabel("姓名", { exact: true }).count();
    adminSocket.disconnect();

    console.log(JSON.stringify(report, null, 2));
    assert.equal(report.boss.hasScreen, true, "老板工位必须有一块可显示的屏幕");
    assert.equal(report.bossRoster, "李文杰测试", "名字含文杰应坐进老板工位");
    assert.match(report.boss.shown || "", /^data:image\/jpeg/,
      "一个人的时候，自己的低清画面也必须出现在自己的屏幕上");
    assert.ok(report.boss.frames >= 1, "客户端必须真的采集了一帧");
    assert.match(report.guest.shown || "", /^data:image\/jpeg/, "访客也要能看到老板工位的画面");
    assert.equal(report.guest.frames, 0, "普通访客不得采集屏幕");
    assert.equal(report.guestPicker, 0, "访客不该再看到“点击场景里你想坐的椅子”");
    assert.match(report.guestIdentity || "", /沙发/, "访客的身份栏应写明坐在公共区沙发");
    assert.equal(report.guestChatRows.some((row) => row.includes("公共聊天")), false,
      "访客的会话列表里不应出现公共聊天");
    assert.equal(report.guestChatRows.some((row) => row.includes("老同事")), false,
      "从没聊过、也不在空间的旧账号不该占一行");
    assert.equal(report.guestChatRows.some((row) => row.includes("离线同事")), true,
      "工位主人即使离线也要留在会话列表里");
    assert.equal(report.guestChatRows.some((row) => row.includes("李文杰测试")), true,
      "在空间里的同事要出现");
    assert.equal(report.chatBefore.some((row) => row.includes("李文杰测试")), true,
      "被请出之前，他的会话应当在列表里");
    assert.equal(report.chatAfter.some((row) => row.includes("李文杰测试")), false,
      "被请出的人必须从聊天会话列表消失");
    assert.equal(report.bossBackAtLogin, 1, "被请出的人要回到登录页，不能留在空间里");
    assert.equal(report.memberPicker, 1, "没有工位的成员仍然要能选座");
    assert.equal(report.visitorCard?.name, "客户乙", "点访客时要选中这位访客");
    assert.match(report.visitorCard?.eyebrow || "", /访客/, "卡片要说明他是访客");
    assert.deepEqual(report.visitorCard?.actions.map((action) => action.disabled), [false, false, false],
      "访客的三个通话按钮都要可用");
    assert.deepEqual(report.visitorCard?.actions.map((action) => action.label),
      ["请求观看对方屏幕", "分享我的屏幕给对方", "邀请语音"]);
    assert.deepEqual(report.bossErrors, []);
    assert.deepEqual(report.guestErrors, []);
    assert.deepEqual(report.memberErrors, []);
    console.log("PASS desk preview on seat " + BOSS_SEAT + " while alone, visitor captures nothing, visitor has no seat picker");
    await boss.context.close(); await guest.context.close(); await member.context.close();
  } finally {
    fs.writeFileSync(path.resolve("Build/desk-preview-browser.json"), JSON.stringify(report, null, 2));
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
