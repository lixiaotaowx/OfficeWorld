// Diagnostic: where does the office load time actually go?
//
// Runs the built bundle against an isolated server, so the network part is ~0
// and what remains is parse + Draco + KTX2 transcode + attach + first frame.
// Measured with it: raising the decoder worker limit took a complete office from
// 3317ms to ~2100ms on this machine (see Design/Deployment.md, 2026-09-15 11:38).
//
// Run from the repository root:  node OfficeWeb/test/browser/load-phases.cjs
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { io } = require("socket.io-client");

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve("OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.LOAD_PHASES_BUILD || "Build/OfficeWeb");
  const dir = fs.mkdtempSync(path.resolve("Build/load-phases-qa-"));
  const server = createOfficeServer({ statePath: dir + "/state.json", accountsPath: dir + "/accounts.json",
    chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server"] });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
    const register = await context.request.post(base + "/api/auth/register",
      { headers: { origin: base }, data: { name: "载入阶段", password: "qa" } });
    if (register.status() !== 200) throw Error(`register failed: ${register.status()} ${await register.text()}`);
    const cookie = register.headers()["set-cookie"].split(";")[0];
    await context.request.post(base + "/api/auth/role",
      { headers: { origin: base, cookie }, data: { role: "employee" } });
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base, cookie } });
      socket.on("connect", () => socket.emit("join", {}));
      socket.once("seats", () => socket.emit("seat", 0,
        r => { socket.disconnect(); r.ok ? resolve() : reject(Error(r.error)); }));
    });
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
    const started = Date.now();
    await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position),
      null, { timeout: 180000 });
    const sceneAt = Date.now() - started;
    await page.waitForFunction(() => Boolean(window.__officeDebug?.monitors?.meshFor?.(0)),
      null, { timeout: 180000 });
    const officeAt = Date.now() - started;
    const resources = await page.evaluate(() => performance.getEntriesByType("resource")
      .filter(e => /glb|wasm|\.js$|\.css$/.test(e.name))
      .map(e => ({ name: e.name.replace(location.origin, ""), start: Math.round(e.startTime),
        end: Math.round(e.responseEnd), transfer: e.transferSize })));
    console.log(`scene mounted after ${sceneAt}ms; office complete after ${officeAt}ms`);
    console.log(JSON.stringify(resources, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
