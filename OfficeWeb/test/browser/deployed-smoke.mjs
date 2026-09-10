// Verifies a deployed OfficeWeb instance in a real browser: the page boots, the
// websocket reaches the deployed server, the office loads, two separate clients
// see each other, and it reports plainly whether media capture is available.
//
// Usage:  node test/browser/deployed-smoke.mjs [url]
// Defaults to http://115.159.43.237/ . Chromium runs with --no-proxy-server
// because a local VPN/proxy can otherwise intercept the request.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try {
  chromium = require(process.env.APPDATA + "/npm/node_modules/playwright").chromium;
} catch {
  console.error("找不到全局 playwright：npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}

const BASE = (process.argv[2] || process.env.OFFICE_APP_URL || "http://115.159.43.237/").replace(/\/?$/, "/");
const APP = `${BASE}?debug=1`;
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -- " + detail : ""}`);
};
const waitFor = async (fn, timeoutMs = 45000, interval = 500) => {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    last = await fn();
    if (last) return last;
    await new Promise((r) => setTimeout(r, interval));
  }
  return last;
};

const browser = await chromium.launch({
  args: ["--no-proxy-server", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});

async function open() {
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 160));
  });
  await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 60000 });
  return { page, errors };
}

try {
  console.log(`target: ${BASE}`);
  const a = await open();
  const b = await open();

  const connected = await waitFor(async () =>
    (await a.page.locator("text=本地协作已连接").count()) > 0 ? true : null,
  );
  check("部署站点可访问且信令已连接", Boolean(connected));

  const ready = await waitFor(async () => {
    const text = await a.page.locator(".scene-status").innerText();
    return /白模已就绪/.test(text) ? text.replace(/\s+/g, " ").trim() : null;
  });
  check("办公室模型在部署环境加载完成", Boolean(ready), ready || "");

  const twoPeople = await waitFor(async () => {
    const text = await a.page.locator("header .connection").innerText();
    return /2 人在线/.test(text) ? text.replace(/\s+/g, " ").trim() : null;
  });
  check("两个客户端都连到了同一台服务器", Boolean(twoPeople), twoPeople || "");

  // A should see B as a rendered character.
  const remote = await waitFor(async () => {
    const list = await a.page.evaluate(() => window.__officeDebug?.remotes?.snapshot?.());
    return list && list.length === 1 && list[0].loaded ? list : null;
  });
  check(
    "我在部署环境里能看到另一个玩家的角色",
    Boolean(remote),
    remote ? JSON.stringify(remote) : "没有远端角色",
  );

  // Walk B and confirm A's copy follows.
  await b.page.evaluate(() => {
    const active = document.activeElement;
    if (active && active.blur) active.blur();
  });
  await b.page.keyboard.down("a");
  await new Promise((r) => setTimeout(r, 2000));
  await b.page.keyboard.up("a");
  const localB = await b.page.evaluate(() => window.__officeDebug?.local?.());
  const follows = await waitFor(async () => {
    const list = await a.page.evaluate(() => window.__officeDebug?.remotes?.snapshot?.());
    const now = list?.[0];
    if (!now || !localB) return null;
    return Math.hypot(now.x - localB.x, now.z - localB.z) < 0.6 ? now : null;
  });
  check(
    "对方走动时我这边也同步",
    Boolean(follows),
    follows && localB ? `误差 ${Math.hypot(follows.x - localB.x, follows.z - localB.z).toFixed(2)}m` : "未同步",
  );

  await a.page.screenshot({ path: "../Build/deployed-office.png" }).catch(() => undefined);

  // Media capture needs a secure context; report the truth rather than assume.
  const secure = await a.page.evaluate(() => ({
    isSecureContext: window.isSecureContext,
    hasMediaDevices: Boolean(navigator.mediaDevices?.getDisplayMedia),
  }));
  const mediaUsable = secure.isSecureContext && secure.hasMediaDevices;
  console.log(
    `\n媒体捕获：isSecureContext=${secure.isSecureContext} getDisplayMedia=${secure.hasMediaDevices}` +
      (mediaUsable ? "  -> 可用" : "  -> 不可用（明文 HTTP 不是安全上下文，需要 TLS）"),
  );

  const realErrors = a.errors.filter((e) => !/favicon|404|WebGL/i.test(e));
  check("页面无未预期错误", realErrors.length === 0, realErrors.slice(0, 2).join(" | "));
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
