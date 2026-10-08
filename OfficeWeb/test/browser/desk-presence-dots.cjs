// 在座绿点 / 离桌红点：右侧成员列表的工位行，以及头顶名字卡片上的点
// （用户 2026-09-15 要求）。真实浏览器 + 真实服务器 + 真实 socket 上报。
//
//   node test/browser/desk-presence-dots.cjs
const { launch } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { io: connect } = require("socket.io-client");

async function startServer() {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const dir = fs.mkdtempSync(path.resolve("Build/desk-presence-qa-"));
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
  if (seat !== undefined) {
    assert.equal((await socket.emitWithAck("seat", seat)).ok, true, name + " 应能认领工位");
  }
  return { cookie, socket };
}

(async () => {
  const { server, dir, base } = await startServer();
  const build = path.resolve(process.env.OFFICE_QA_BUILD || "Build/OfficeWeb");
  const browser = await launch();
  const sockets = [];
  // Declared out here so the finally block can always clear it: an interval left
  // running keeps node alive and the harness never returns.
  let pulse;
  try {
    // 甲坐在 0 号工位（离座/在座都从他身上看），乙开着一个真实页面观察。
    const subject = await account(base, "在座甲", 0); sockets.push(subject.socket);
    const watcher = await account(base, "观察乙", 1); sockets.push(watcher.socket);
    // 报一次位置，场景里才会给甲建一个远程角色和头顶名字卡片。
    subject.socket.emit("motion", { x: 0.4, z: 0.4, rot: 0, moving: false, sitting: false });

    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const [name, ...rest] = watcher.cookie.split("=");
    await context.addCookies([{ name, value: rest.join("="), url: base }]);
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
    // 位置要一直推：服务端对 motion 限流，而且远程角色（连带头顶名字卡片）
    // 只有在页面收到过甲的 motion 之后才会建出来。
    pulse = setInterval(() => subject.socket.emit("motion",
      { x: 0.4, z: 0.4, rot: 0, moving: false, sitting: false }), 300);
    await page.waitForTimeout(1500);

    const readSeat = index => page.locator(".seat-grid .seat").nth(index).evaluate(el => ({
      name: el.querySelector("strong")?.textContent.trim() || null,
      state: el.querySelector(".seat-state")?.className || "",
      away: el.querySelector(".away-label")?.textContent.trim() || null,
    }));
    // 注意：`nameTags` 是 getter（直接给数组），不是函数。
    const tags = () => page.evaluate(() =>
      (window.__officeDebug?.nameTags || []).map(tag => ({ name: tag.name, atDesk: tag.atDesk })));
    const tagOf = async who => (await tags()).find(tag => tag.name === who);

    // 1) 在座：绿点，没有离座文案，名字卡片上的点也是绿的。
    const seated = await readSeat(0);
    assert.equal(seated.name, "在座甲", "0 号工位应该是在座甲");
    assert.match(seated.state, /at-desk/, "在座要显示绿点，实际 class：" + seated.state);
    assert.equal(seated.away, null, "在座时不该出现离座时长");
    const tagAppears = await page.waitForFunction(() =>
      (window.__officeDebug?.nameTags || []).some(tag => tag.name === "在座甲"),
      null, { timeout: 30000 }).then(() => true, () => false);
    if (!tagAppears) {
      const diagnosis = await page.evaluate(() => ({
        probe: !!window.__officeDebug,
        focused: document.hasFocus(),
        rendering: window.__officeDebug?.rendering || null,
        tags: window.__officeDebug?.nameTags || null,
      }));
      console.error("名字卡片没出现，诊断：" + JSON.stringify(diagnosis));
      assert.fail("头顶名字卡片没有出现");
    }
    assert.equal((await tagOf("在座甲")).atDesk, true, "在座时名字卡片上的点应该是绿的");

    // 2) 甲报到"离桌"：成员列表与名字卡片一起变红，并显示离座的分钟数。
    subject.socket.emit("input-state", { atDesk: false });
    await page.waitForFunction(() =>
      document.querySelector(".seat-grid .seat .seat-state.away"), null, { timeout: 15000 });
    const away = await readSeat(0);
    assert.match(away.state, /away/, "离桌要显示红点，实际 class：" + away.state);
    assert.match(away.away || "", /^离座 \d+ (秒|分钟|小时)$/, "离桌要显示离座时长，实际：" + away.away);
    await page.waitForFunction(() =>
      (window.__officeDebug?.nameTags || []).some(tag => tag.name === "在座甲" && tag.atDesk === false),
      null, { timeout: 15000 });
    await page.screenshot({ path: path.resolve("Build/desk-presence.png") });

    // 3) 甲碰了鼠标：两边同时回到绿色，离座文案消失。
    subject.socket.emit("input-state", { atDesk: true });
    await page.waitForFunction(() =>
      document.querySelector(".seat-grid .seat .seat-state.at-desk"), null, { timeout: 15000 });
    const back = await readSeat(0);
    assert.equal(back.away, null, "回到座位后不该还写着离座时长");
    await page.waitForFunction(() =>
      (window.__officeDebug?.nameTags || []).some(tag => tag.name === "在座甲" && tag.atDesk === true),
      null, { timeout: 15000 });

    assert.deepEqual(errors, []);
    console.log("PASS 在座绿点 / 离桌红点：成员列表与名字卡片一致，离座时长按秒/分钟/小时单一单位显示");
    await context.close();
  } finally {
    if (pulse) clearInterval(pulse);
    sockets.forEach(socket => socket.disconnect());
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
