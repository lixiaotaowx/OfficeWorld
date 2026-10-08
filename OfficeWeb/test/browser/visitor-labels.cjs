// 访客（客户）在右侧列表里必须单独一行、用另一种颜色，点一下把镜头对到本人；
// 所有角色头顶都要有自己的名字。
//
// Runs the real built bundle (Build/OfficeWeb) against an isolated server with
// throwaway accounts, so it never touches the deployed roster.
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

const EMPLOYEE = "员工甲";
const VISITOR = "客户乙";
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.VISITOR_BUILD || "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.resolve("Build/visitor-labels-qa-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [];
  const post = async (route, body, cookie = "") => {
    const response = await fetch(base + "/api/auth/" + route, { method: "POST",
      headers: { "Content-Type": "application/json", Origin: base, Cookie: cookie },
      body: JSON.stringify(body) });
    return { data: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
  };
  const join = (cookie, name) => new Promise((resolve, reject) => {
    const socket = io(base, { transports: ["websocket"], reconnection: false,
      extraHeaders: { Cookie: cookie, Origin: base } });
    socket.on("connect_error", reject);
    socket.on("connect", () => socket.emit("join", { name }));
    socket.on("people", people => {
      if (people.some(p => p.id === socket.id)) resolve(socket);
    });
  });
  const open = async (label, cookie) => {
    const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
    await context.addCookies([{ name: "office_session", value: cookie.split("=")[1],
      url: base, httpOnly: true, sameSite: "Strict" }]);
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(`${label}: ${error.message}`));
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 60000 });
    return page;
  };
  const camera = page => page.evaluate(() => {
    const c = window.__officeDebug.__camera.position;
    return [+c.x.toFixed(2), +c.y.toFixed(2), +c.z.toFixed(2)];
  });
  const tags = page => page.evaluate(() => window.__officeDebug.nameTags);
  const remotes = page => page.evaluate(() => window.__officeDebug.remotes.snapshot());
  const waitFor = async (fn, timeoutMs = 30000, interval = 400) => {
    const deadline = Date.now() + timeoutMs;
    let last;
    while (Date.now() < deadline) {
      last = await fn();
      if (last) return last;
      await new Promise(r => setTimeout(r, interval));
    }
    return last;
  };

  let employeeSocket;
  try {
    // One employee with a desk, one visiting client who is seated in public.
    // The employee's desk is claimed over a throwaway socket and kept in the
    // roster, so their page is the only session for that account afterwards.
    const employee = await post("register", { name: EMPLOYEE, password: "qa" });
    await post("role", { role: "employee" }, employee.cookie);
    employeeSocket = await join(employee.cookie, EMPLOYEE);
    await new Promise((resolve, reject) => employeeSocket.emit("seat", 0, r => r.ok ? resolve() : reject(Error(r.error))));
    employeeSocket.disconnect();
    employeeSocket = undefined;
    const visitor = await post("register", { name: VISITOR, password: "qa" });
    await post("role", { role: "visitor" }, visitor.cookie);

    // The visitor joins from the page itself: the office seats them on a sofa.
    const employeePage = await open("employee", employee.cookie);
    const visitorPage = await open("visitor", visitor.cookie);
    // Only one window is in the foreground, and a background window throttles its
    // timers, so let the visitor walk to the sofa while they are the active one.
    await visitorPage.bringToFront();
    const seated = await waitFor(async () => (await visitorPage.evaluate(() =>
      Boolean(window.__officeDebug?.local?.()?.sitting))) ? true : null, 60000);
    assert(seated, "访客没有走到公共区沙发坐下");
    await employeePage.bringToFront();

    // The visitor is drawn for the employee, and the employee's own name tag
    // sits above their head from the first frame.
    const visitorAvatar = await waitFor(async () => {
      const list = await remotes(employeePage);
      return list.length === 1 && list[0].loaded && list[0].sitting ? list[0] : null;
    });
    assert(visitorAvatar, `员工端没有看到坐在公共区的访客：remotes=${JSON.stringify(await remotes(employeePage))} 列表=${await employeePage.locator(".visitor-strip").innerText().catch(() => "无")}`);
    const employeeTags = await tags(employeePage);
    assert.equal(employeeTags.length, 2, `头顶名字数量不对：${JSON.stringify(employeeTags)}`);
    const label = (list, who) => list.find(tag => tag.name === who);
    assert.equal(label(employeeTags, EMPLOYEE).kind, "me", "自己的名字没有用自己那套样式");
    assert.equal(label(employeeTags, VISITOR).kind, "visitor", "访客的名字没有用访客样式");
    for (const tag of employeeTags) assert(tag.y >= 1.4, `${tag.name} 的名字贴在地上了：y=${tag.y}`);
    // 名字大小固定针对显示器：与距离无关，始终约 24 CSS 像素高。
    for (const tag of employeeTags) {
      assert.equal(tag.screenSpace, true, `${tag.name} 的名字还是随距离缩放`);
      assert(Math.abs(tag.pixels - 24) < 1.5, `${tag.name} 的名字在屏幕上 ${tag.pixels}px，不是固定的 24px`);
    }
    await employeePage.screenshot({ path: "Build/name-tags-desks.png" });

    // The sidebar lists the visitor in its own coloured row.
    await employeePage.locator(".visitor-strip .visitor").waitFor({ timeout: 15000 });
    assert.equal(await employeePage.locator(".visitor-strip .visitor").count(), 1);
    assert.match(await employeePage.locator(".visitor-strip .visitor").innerText(), new RegExp(VISITOR));
    const styles = await employeePage.evaluate(() => {
      const visitor = document.querySelector(".visitor-strip .visitor");
      const seat = document.querySelector(".seat.is-online");
      const name = el => el && getComputedStyle(el.querySelector("strong")).color;
      return { visitorBg: getComputedStyle(visitor).backgroundColor,
        seatBg: getComputedStyle(seat).backgroundColor,
        visitorName: name(visitor), seatName: name(seat) };
    });
    assert.notEqual(styles.visitorBg, styles.seatBg, "访客行和工位行背景色相同");
    assert.notEqual(styles.visitorName, styles.seatName, "访客行和工位行文字色相同");
    await employeePage.locator(".sidebar").screenshot({ path: "Build/visitor-sidebar.png" });

    // Clicking the visitor points the camera at the person, not at a desk.
    const person = await employeePage.evaluate(id => window.__officeDebug.personPosition(id),
      visitorAvatar.id);
    const start = await camera(employeePage);
    assert(distance(start, person) > 6, `初始镜头本来就贴着访客（${distance(start, person).toFixed(1)}m）`);
    await employeePage.locator(".visitor-strip .visitor").click();
    const arrived = await waitFor(async () => {
      const now = await camera(employeePage);
      const gap = distance(now, person);
      return gap < 4.2 && gap > 1.5 ? now : null;
    }, 20000);
    assert(arrived, `点击访客后镜头没有对到本人：${JSON.stringify(await camera(employeePage))} 人=${person}`);
    await employeePage.screenshot({ path: "Build/visitor-focus.png" });
    // Same size up close as across the office: the tag is sized for the display,
    // so the camera distance must not change either the scale or the pixels.
    const nearTags = await tags(employeePage);
    const near = label(nearTags, VISITOR);
    const far = label(employeeTags, VISITOR);
    assert(Math.abs(near.pixels - 24) < 1.5, `近景名字 ${near.pixels}px，不是固定的 24px`);
    assert.equal(near.scaleY, far.scaleY, "换距离后名字的缩放变了（说明还是按世界尺寸）");

    // On the visitor's own screen the row is marked as themselves.
    const mine = visitorPage.locator(".visitor-strip .visitor");
    await mine.waitFor({ timeout: 15000 });
    assert.match(await mine.getAttribute("class"), /mine/, "访客自己没有标记出来");
    assert.match(await mine.innerText(), /我 ·/);
    const visitorTags = await tags(visitorPage);
    assert.equal(label(visitorTags, VISITOR).kind, "me", "访客自己头顶的名字样式不对");
    assert.equal(label(visitorTags, EMPLOYEE).kind, "employee", "成员的名字样式不对");
    assert.deepEqual(errors, []);

    fs.writeFileSync("Build/visitor-labels-evidence.json", JSON.stringify({
      employeeTags, visitorTags, nearTags, visitorRow: styles, cameraStart: start,
      cameraOnVisitor: arrived, person,
      screenshots: ["Build/name-tags-desks.png", "Build/visitor-sidebar.png", "Build/visitor-focus.png"],
      errors,
    }, null, 2));
    console.log(`PASS: 访客单独一行且配色不同（${styles.visitorBg} vs ${styles.seatBg}）、点击对焦到本人（${distance(arrived, person).toFixed(1)}m）、两个角色头顶都有名字`);
  } finally {
    employeeSocket?.disconnect();
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
