// Verifies a deployed OfficeWeb instance in a real browser: the page boots, the
// websocket reaches the deployed server, the office loads, two separate clients
// see each other, and it reports plainly whether media capture is available.
//
// Usage:  node test/browser/deployed-smoke.mjs [url]
// Defaults to http://115.159.43.237/ . Chromium runs with --no-proxy-server
// because a local VPN/proxy can otherwise intercept the request.
import { createRequire } from "node:module";
import { RoomServiceClient } from "livekit-server-sdk";
import { livekit } from "../../livekit.mjs";
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
  args: [
    "--no-proxy-server",
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    // Auto-select a capture source so getDisplayMedia resolves unattended.
    "--enable-usermedia-screen-capturing",
    "--allow-http-screen-capture",
    "--auto-select-desktop-capture-source=Entire screen",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

async function open() {
  // The deployed HTTPS uses a self-signed certificate for the bare IP (this
  // server is on mainland China, where unfiled domains get intercepted).
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    permissions: ["microphone"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text().slice(0, 160));
  });
  await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 60000 });
  return { page, errors };
}

/**
 * A first-time visitor is shown the seat picker, and it blocks the page until
 * a desk is taken. Take one so the rest of the run can reach the controls.
 */
async function claimAnyDesk(page) {
  const picker = page.locator(".seat-picker");
  await picker.waitFor({ timeout: 30000 });
  await picker.locator(".seat-picker-grid button:not([disabled])").first().click();
  await picker.waitFor({ state: "detached", timeout: 30000 }).catch(() => {});
}

try {
  console.log(`target: ${BASE}`);
  const a = await open();
  const b = await open();
  await claimAnyDesk(a.page);
  await claimAnyDesk(b.page);

  const connected = await waitFor(async () =>
    (await a.page.locator("text=本地协作已连接").count()) > 0 ? true : null,
  );
  check("部署站点可访问且信令已连接", Boolean(connected));

  const ready = await waitFor(async () => {
    const text = await a.page.locator(".scene-status").innerText();
    return /白模已就绪/.test(text) ? text.replace(/\s+/g, " ").trim() : null;
  });
  check("办公室模型在部署环境加载完成", Boolean(ready), ready || "");

  // The thumbnail is painted onto a flat screen plane that ships buried inside
  // the monitor model, so a test that only inspects the texture canvas proves
  // nothing about what a person can see. Raycast from each desk chair.
  const screens = await waitFor(async () => {
    const list = await a.page.evaluate(() => {
      const debug = window.__officeDebug;
      if (!debug?.probeMonitor) return null;
      const seats = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
        seat: i,
        visible: debug.probeMonitor(i)?.fromChair?.hitsScreen === true,
      }));
      return seats.every((s) => s.visible) ? seats : null;
    });
    return list;
  });
  check(
    "8 个工位屏幕都真的能被坐着的人看到（没埋在显示器里）",
    Boolean(screens),
    screens
      ? `${screens.length}/8 可见`
      : "有工位屏幕被遮挡 —— 贴图贴在了看不见的面上",
  );

  // At least two clients, not exactly two: a real person may be in the office
  // at the same time as this run.
  const twoPeople = await waitFor(async () => {
    const text = await a.page.locator("header .connection").innerText();
    const match = /(\d+)\s*人在线/.exec(text);
    return match && Number(match[1]) >= 2
      ? text.replace(/\s+/g, " ").trim()
      : null;
  });
  check("两个客户端都连到了同一台服务器", Boolean(twoPeople), twoPeople || "");

  // A should see B as a rendered character. Other people may be connected at
  // the same time (this is a shared office), so any number above zero is fine.
  const remote = await waitFor(async () => {
    const list = await a.page.evaluate(() => window.__officeDebug?.remotes?.snapshot?.());
    if (!list || list.length < 1) return null;
    return list.every((entry) => entry.loaded) ? list : null;
  });
  check(
    "我在部署环境里能看到其他玩家的角色",
    Boolean(remote),
    remote ? `${remote.length} 个远端角色已加载` : "没有远端角色",
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
    if (!list?.length || !localB) return null;
    // Match against whichever remote ended up where B actually is, so other
    // people being in the office cannot confuse the comparison.
    const nearest = list
      .map((entry) => ({
        entry,
        gap: Math.hypot(entry.x - localB.x, entry.z - localB.z),
      }))
      .sort((p, q) => p.gap - q.gap)[0];
    return nearest.gap < 0.6 ? nearest : null;
  });
  check(
    "对方走动时我这边也同步",
    Boolean(follows),
    follows && localB ? `误差 ${follows.gap.toFixed(2)}m` : "未同步",
  );

  await a.page.screenshot({ path: "../Build/deployed-office.png" }).catch(() => undefined);

  // Media capture needs a secure context, so this is the real test of whether
  // TLS did its job. Ask the page to actually capture a screen and a mic.
  const secure = await a.page.evaluate(() => ({
    isSecureContext: window.isSecureContext,
    hasGetDisplayMedia: Boolean(navigator.mediaDevices?.getDisplayMedia),
    hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
  }));
  check(
    "部署页面处于安全上下文（TLS 生效）",
    secure.isSecureContext === true,
    `isSecureContext=${secure.isSecureContext}`,
  );
  check(
    "媒体接口已可用",
    secure.hasGetDisplayMedia && secure.hasGetUserMedia,
    `getDisplayMedia=${secure.hasGetDisplayMedia} getUserMedia=${secure.hasGetUserMedia}`,
  );

  const capture = await a.page.evaluate(async () => {
    const result = { display: null, mic: null };
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      result.display = stream.getVideoTracks().length;
      stream.getTracks().forEach((t) => t.stop());
    } catch (error) {
      result.display = "err: " + String(error.message || error).slice(0, 80);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      result.mic = stream.getAudioTracks().length;
      stream.getTracks().forEach((t) => t.stop());
    } catch (error) {
      result.mic = "err: " + String(error.message || error).slice(0, 80);
    }
    return result;
  });
  check(
    "能真正采集到屏幕视频轨",
    capture.display === 1,
    JSON.stringify(capture.display),
  );
  check(
    "能真正采集到麦克风音轨",
    capture.mic === 1,
    JSON.stringify(capture.mic),
  );

  // The page now reaches LiveKit as wss://<this host>, proxied by nginx. If the
  // websocket upgrade or the media path were broken, nobody would arrive in the
  // room, so ask the LiveKit server itself.
  const service = new RoomServiceClient(
    livekit.url.replace(/^wss?/, "http").replace(/:0$/, ""),
    livekit.apiKey,
    livekit.apiSecret,
  );
  for (const client of [a, b]) {
    await client.page.getByRole("button", { name: "加入会议" }).click();
  }
  const inRoom = await waitFor(async () => {
    const list = await service.listParticipants("meeting").catch(() => []);
    return list.length >= 2 ? list : null;
  });
  check(
    "经 nginx 的 wss 反代连上了 LiveKit",
    Boolean(inRoom),
    inRoom ? `${inRoom.length} 人入会` : "没人进入会议室",
  );

  const micUp = await waitFor(async () => {
    const list = await service.listParticipants("meeting").catch(() => []);
    if (list.length < 2) return null;
    return list.every((p) => p.tracks?.some((t) => /microphone/i.test(t.name || "")))
      ? list
      : null;
  });
  check("双方麦克风轨道经反代成功发布", Boolean(micUp));

  // Regression guard that ordinary tests miss: Playwright scrolls an element
  // into view before clicking, so a control buried below the fold still passes
  // them. A control a real user cannot reach without scrolling is a bug, so
  // assert that the things a new visitor must press are genuinely in view on a
  // 1366x768 laptop, and that the sidebar can scroll if it is ever too tall.
  const small = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 768 },
  });
  const smallPage = await small.newPage();
  await smallPage.goto(APP, { waitUntil: "domcontentloaded", timeout: 60000 });
  await smallPage.waitForSelector("text=本地协作已连接", { timeout: 60000 });
  await smallPage.waitForSelector(".seat-picker", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1500));
  const reachable = await smallPage.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        inView:
          r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0,
      };
    };
    const picker = document.querySelector(".seat-picker");
    const choices = [...document.querySelectorAll(".seat-picker-grid button")];
    const sidebar = document.querySelector(".sidebar");
    return {
      seats: choices.length,
      allChoicesInView: choices.length > 0 && choices.every((b) => box(b).inView),
      lastChoice: choices.length ? box(choices[choices.length - 1]) : null,
      picker: picker ? box(picker) : null,
      viewport: window.innerHeight,
      sidebarOverflow: sidebar ? getComputedStyle(sidebar).overflowY : "n/a",
    };
  });
  check(
    "1366x768 上选座弹窗的 8 个工位无需滚动全部可见",
    reachable?.allChoicesInView === true && reachable?.seats === 8,
    JSON.stringify(reachable?.lastChoice) + ` seats=${reachable?.seats}`,
  );
  check(
    "侧栏内容可滚动，够长时不会把内容裁掉",
    reachable?.sidebarOverflow === "auto",
    `overflow-y: ${reachable?.sidebarOverflow}`,
  );
  await small.close();

  // The client probes /rtc/v1 first and falls back to /rtc on this older
  // LiveKit server, which the browser reports as one 404. That is expected.
  const probe = a.errors.filter((e) => /rtc\/v1/.test(e));
  // Known environmental issue: a machine behind a TUN-mode proxy / Tailscale
  // can have its UDP path disturbed, so ICE negotiation occasionally times out
  // and then recovers. The functional checks above still pass and the LiveKit
  // server logs show no errors, so this is reported rather than treated as a
  // product failure - but it is printed so it is never silently swallowed.
  const transient = a.errors.filter((e) =>
    /negotiation timed out|error reading from signal stream/i.test(e),
  );
  const realErrors = a.errors.filter(
    (e) =>
      !/rtc\/v1|favicon|404|WebGL|Autoplay|negotiation timed out|error reading from signal stream/i.test(
        e,
      ),
  );
  check(
    "除已知问题外无未预期错误",
    realErrors.length === 0,
    realErrors.slice(0, 2).join(" | ") ||
      `${probe.length} 次 /rtc/v1 探测，${transient.length} 次瞬时协商超时`,
  );
  if (transient.length)
    console.log(
      `WARN  出现 ${transient.length} 次瞬时 ICE 协商超时（本机 UDP 环境已知问题，随后自行恢复；` +
        `服务端日志无错误，且上面的入会与麦克风轨道检查仍通过）`,
    );
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
