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

const BOSS_SEAT = 8;

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/desk-preview-qa-"));
  const server = createOfficeServer({
    statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json",
    secureCookies: false,
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
    //    manager's screen.
    const guestCookie = await join(base, "客户乙", "visitor");
    const guest = await openPage(browser, base, build, guestCookie);
    await guest.page.waitForFunction(index => window.__officeDebug.monitors.slots.get(index)?.shown,
      BOSS_SEAT, { timeout: 20000 }).catch(() => {});
    report.guest = await readSeat(guest.page, BOSS_SEAT);
    report.guestErrors = guest.errors;
    report.bossAfterGuest = await readSeat(boss.page, BOSS_SEAT);

    console.log(JSON.stringify(report, null, 2));
    assert.equal(report.boss.hasScreen, true, "老板工位必须有一块可显示的屏幕");
    assert.equal(report.bossRoster, "李文杰测试", "名字含文杰应坐进老板工位");
    assert.match(report.boss.shown || "", /^data:image\/jpeg/,
      "一个人的时候，自己的低清画面也必须出现在自己的屏幕上");
    assert.ok(report.boss.frames >= 1, "客户端必须真的采集了一帧");
    assert.match(report.guest.shown || "", /^data:image\/jpeg/, "访客也要能看到老板工位的画面");
    assert.equal(report.guest.frames, 0, "普通访客不得采集屏幕");
    assert.deepEqual(report.bossErrors, []);
    assert.deepEqual(report.guestErrors, []);
    console.log("PASS desk preview on seat " + BOSS_SEAT + " while alone, visitor captures nothing");
    await boss.context.close(); await guest.context.close();
  } finally {
    fs.writeFileSync(path.resolve("Build/desk-preview-browser.json"), JSON.stringify(report, null, 2));
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
