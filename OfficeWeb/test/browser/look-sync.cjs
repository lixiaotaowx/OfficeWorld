// 多人同步：甲换配色/戴配件，乙那边画出来的远端角色必须跟着变，而且**不重新下载模型**。
//
// 为什么单独一个文件：`livekit-remote-avatars.mjs` 要一个本地站点（默认 5188），而且那一条验的是
// 走/坐这些位置同步；这里只验换尺子角色之后新加的**外观同步**，所以起一个隔离服务器（临时账号、
// 临时 state，不碰正式名册）就够，也不需要媒体。
//
//   node test/browser/look-sync.cjs          (从 OfficeWeb/ 或仓库根跑都行)
const { chromium } = require("./playwright.cjs");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const assert = require("node:assert/strict");
const { io } = require("socket.io-client");

(async () => {
  const ROOT = path.resolve(__dirname, "..", "..", "..");
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, "OfficeWeb/server.mjs")));
  const build = path.resolve(process.env.CHARACTER_BUILD || path.join(ROOT, "Build/OfficeWeb"));
  const dir = fs.mkdtempSync(path.resolve(ROOT, "Build/look-sync-"));
  const server = createOfficeServer({ statePath: dir + "/state.json",
    accountsPath: dir + "/accounts.json", chatPath: dir + "/chat", secureCookies: false });
  await new Promise(resolve => server.http.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.http.address().port;
  const browser = await chromium.launch({ args: ["--no-proxy-server",
    "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const errors = [];
  try {
    const a = await signIn("同步甲", 0);
    const b = await signIn("同步乙", 1);
    const glbRequests = [];
    b.page.on("request", request => {
      const url = new URL(request.url()).pathname;
      if (url.endsWith(".glb")) glbRequests.push(url);
    });

    // 1. 乙那边必须画出一个**已加载**的远端角色（就是甲）。
    const seen = await waitFor(async () => {
      const list = await remotes(b.page);
      return list && list.length >= 1 && list[0].loaded ? list : null;
    }, 60000);
    assert.ok(seen, "乙没有画出远端角色");
    // 2. 远端的外观指纹 = 对方的配色 + 配件（默认是原色 kraft，**一个配件都不戴**）。
    assert.ok(seen[0].kind.startsWith("kraft|"), "远端默认外观不对：" + seen[0].kind);
    assert.ok(!seen[0].kind.includes("short") && !seen[0].kind.includes("tophat"),
      "默认不该戴任何配件：" + seen[0].kind);

    // 3. 甲换配色 + 戴礼帽。
    await a.page.locator('button[aria-label="设置"]').click();
    await a.page.locator('.character-setting .color-grid button[aria-label="藏蓝"]').click();
    await a.page.locator('.character-setting .look-steps button', { hasText: "2 配件" }).click();
    await a.page.locator('.accessory-tabs button', { hasText: '帽子' }).click();
    await a.page.locator('.character-setting .accessory-row', { hasText: "帽子" })
      .locator("button", { hasText: "礼帽" }).click();
    const mine = await myLook(a.page);
    assert.equal(mine?.color, "navy", "自己那边没换上藏蓝：" + JSON.stringify(mine));
    assert.equal(mine?.accessories?.hat, "tophat", "自己那边没戴上礼帽");
    await a.page.getByRole("button", { name: "关闭设置", exact: true }).click();
    const modelsBefore = glbRequests.length;

    // 4. 乙那边跟着变（多人同步），并且没有重新下载模型。
    const switched = await waitFor(async () => {
      const list = await remotes(b.page);
      return list?.[0]?.kind?.startsWith("navy|") ? list[0] : null;
    }, 30000);
    assert.ok(switched, "乙那边没有跟着换成藏蓝");
    assert.ok(switched.kind.includes("tophat"), "远端外观里没带上礼帽：" + switched.kind);
    assert.equal(glbRequests.length, modelsBefore,
      `换装不该重新下载模型，却多了 ${glbRequests.length - modelsBefore} 次 GLB 请求`);

    // 5. 刷新甲那边，外观仍然在（账号存档 + 本机缓存）。
    await a.page.reload({ waitUntil: "domcontentloaded" });
    await a.page.waitForSelector('button[aria-label="设置"]', { timeout: 60000 });
    await a.page.waitForTimeout(1500);
    const afterReload = await myLook(a.page);
    assert.equal(afterReload?.color, "navy", "刷新后配色丢了：" + JSON.stringify(afterReload));
    assert.equal(afterReload?.accessories?.hat, "tophat", "刷新后配件丢了");

    // 6. 远端的跑步循环：这一位在代码里接上了（`RemoteAvatars` 按 `running` 放 `跑步循环_Run`），
    //    但**在浏览器里驱动不出来**——远端快照始终是 `sitting: true`（服务端对坐着的人不放行运动，
    //    而注入的一帧又会被场景自己每 100ms 的上报覆盖）。所以这里只记录现状，不当断言：
    //    真要验它得让甲真的跑起来（等路径、等广播），那属于位置同步用例，不是这一条。
    await a.page.evaluate(() => window.__officeDebug.avatar.standUp());
    await a.page.waitForTimeout(600);
    await a.page.evaluate(() => {
      const state = window.__officeDebug.avatar.getState();
      window.__officeDebug.__sendMotion({ ...state, moving: true, running: true, sitting: false });
    });
    const remoteRun = await waitFor(async () => {
      const list = await remotes(b.page);
      return list?.[0]?.running === true ? list[0] : null;
    }, 5000, 300);
    console.log("远端跑步位（信息，不作断言）:", remoteRun ? JSON.stringify(remoteRun) : "未收到（见文件内说明）");

    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(ROOT, "Build/look-sync-evidence.json"),
      JSON.stringify({ remoteKind: switched.kind, myLook: mine, glbRequests: glbRequests.length,
        remoteRun: remoteRun?.clip ?? null, errors }, null, 2));
    console.log(`PASS 外观多人同步：远端 ${switched.kind}；换装 0 次模型下载；刷新后保留`);

    async function signIn(name, seat) {
      const context = await browser.newContext({ viewport: { width: 1200, height: 820 },
        permissions: ["microphone"] });
      const page = await context.newPage();
      page.on("pageerror", error => errors.push(error.message));
      const response = await context.request.post(base + "/api/auth/register",
        { headers: { origin: base }, data: { name, password: "qa" } });
      assert.equal(response.status(), 200, `注册失败：${name}`);
      const role = await context.request.post(base + "/api/auth/role",
        { headers: { origin: base }, data: { role: "employee" } });
      assert.equal(role.status(), 200);
      const cookies = await context.cookies(base);
      await new Promise((resolve, reject) => {
        const socket = io(base, { transports: ["websocket"], extraHeaders: { origin: base,
          cookie: cookies.map(c => c.name + "=" + c.value).join("; ") } });
        socket.on("connect", () => socket.emit("join", {}));
        socket.once("seats", () => socket.emit("seat", seat, result => {
          socket.disconnect(); result.ok ? resolve() : reject(Error(result.error));
        }));
      });
      await context.route(base + "/**", async route => {
        const url = new URL(route.request().url());
        if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) return route.continue();
        const file = path.join(build, url.pathname === "/" ? "index.html" : url.pathname);
        if (!fs.existsSync(file)) return route.continue();
        await route.fulfill({ path: file });
      });
      await page.goto(base + "/?debug=1", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Boolean(window.__officeDebug?.__camera?.position), null, { timeout: 60000 });
      return { context, page };
    }
  } finally {
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

/** 远端角色当前的快照（`kind` 是外观指纹）。 */
const remotes = (page) => page.evaluate(() => {
  const debug = window.__officeDebug;
  return debug?.remotes ? debug.remotes.snapshot() : null;
});
/** 自己那套外观（真正加载到模型上的那一份）。 */
const myLook = (page) => page.evaluate(() =>
  window.__officeDebug?.avatar?.character?.appearance ?? null);

async function waitFor(fn, timeoutMs = 30000, interval = 400) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await fn();
    if (last) return last;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return last;
}
