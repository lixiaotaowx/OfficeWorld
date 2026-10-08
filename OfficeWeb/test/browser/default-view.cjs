// The office must open on 开放工位 (the open workstations), not on 空间总览: the
// desks are what a visitor comes for, and the overview stays one click away.
//
// Runs the real built bundle (Build/OfficeWeb) against an isolated server with
// a throwaway account, so it never touches the deployed roster.
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

/** OfficeScene.views — camera position, target, for the two views compared here. */
const DESKS = { at: [8, 12, 15], look: [0.6, 0.5, 1.8] };
const OVERVIEW = { at: [19, 23, 29], look: [0.5, 0, -0.5] };

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.DEFAULT_VIEW_BUILD || "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.resolve("Build/default-view-qa-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
    "--autoplay-policy=no-user-gesture-required"] });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 940 },
      permissions: ["microphone"] });
    const response = await context.request.post(base + "/api/auth/register", {
      headers: { origin: base }, data: { name: "默认视角测试", password: "qa" },
    });
    assert.equal(response.status(), 200);
    // An account must have chosen its identity before the office mounts.
    const role = await context.request.post(base + "/api/auth/role", {
      headers: { origin: base }, data: { role: "employee" },
    });
    assert.equal(role.status(), 200);
    // A registered visitor with no desk is shown the seat picker, which would
    // cover the view tabs; claim desk 0 from the outside first.
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0, result => {
        socket.disconnect(); result.ok ? resolve() : reject(Error(result.error));
      }));
    });
    // Serve the bundle under test; API and websocket stay on the isolated server.
    await context.route(base + "/**", async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
      const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(error.message));
    const camera = () => page.evaluate(() => {
      const c = window.__officeDebug?.__camera?.position;
      return c ? [+c.x.toFixed(3), +c.y.toFixed(3), +c.z.toFixed(3)] : null;
    });
    const arrived = (from, at) => Math.hypot(from[0] - at[0], from[1] - at[1], from[2] - at[2]) < 0.5;
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    // A boolean predicate: the probe itself is not serialisable out of the page.
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 60000 });

    const selected = (await page.locator(".view-tabs button.selected").innerText())
      .replace(/\s+/g, " ").trim();
    assert.match(selected, /开放工位/, `opened on "${selected}" instead of 开放工位`);
    const opened = await camera();
    assert(arrived(opened, DESKS.at), `default camera ${opened} is not the desks position ${DESKS.at}`);

    // 空间总览 is still one click away, and coming back lands on the desks again.
    await page.locator(".view-tabs button", { hasText: "空间总览" }).click();
    await page.waitForFunction(at => {
      const c = window.__officeDebug.__camera.position;
      return Math.hypot(c.x - at[0], c.y - at[1], c.z - at[2]) < 0.5;
    }, OVERVIEW.at, { timeout: 30000 });
    await page.locator(".view-tabs button", { hasText: "开放工位" }).click();
    await page.waitForFunction(at => {
      const c = window.__officeDebug.__camera.position;
      return Math.hypot(c.x - at[0], c.y - at[1], c.z - at[2]) < 0.5;
    }, DESKS.at, { timeout: 30000 });
    const returned = await camera();
    await page.screenshot({ path: "Build/default-view-open-desks.png" });
    assert.deepEqual(errors, []);
    fs.writeFileSync("Build/default-view-evidence.json", JSON.stringify({ selected, opened,
      overview: OVERVIEW.at, returned, evidence: "Build/default-view-open-desks.png",
      errors }, null, 2));
    console.log(`PASS: opens on ${selected} at ${JSON.stringify(opened)}; 空间总览 and back both arrive`);
  } finally {
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
