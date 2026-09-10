// Workstation verification: a player claims a desk, shares their screen, and
// another player sees that thumbnail land on the claimed desk's 3D monitor.
// Requires the signaling server (3108), Vite (5188) and global Playwright.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
let chromium;
try {
  chromium = require(process.env.APPDATA + "/npm/node_modules/playwright").chromium;
} catch {
  console.error("找不到全局 playwright：npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}

const APP = process.env.OFFICE_APP_URL || "http://127.0.0.1:5188/";
// Centre colour of the idle placeholder painted by MonitorScreens.paintIdle.
const IDLE = [15, 26, 22];
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -- " + detail : ""}`);
};
const waitFor = async (fn, timeoutMs = 30000, interval = 500) => {
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
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--enable-usermedia-screen-capturing",
    "--allow-http-screen-capture",
    "--auto-select-desktop-capture-source=Entire screen",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

async function open() {
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("  pageerror:", e.message));
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=本地协作已连接", { timeout: 30000 });
  return page;
}

// Read the thumbnail state of one seat's monitor from inside the page.
const monitorOf = (page, seat) =>
  page.evaluate((s) => {
    const debug = window.__officeDebug;
    return debug ? debug.monitors.previewInfo(s) : null;
  }, seat);

try {
  const sharer = await open();
  const viewer = await open();

  // Nobody holds a desk until they pick one.
  const seatsOf = (page) =>
    page.locator(".identity small").innerText();
  check("初始未占工位", /没选工位/.test(await seatsOf(sharer)), await seatsOf(sharer));

  // Sharer claims desk 0 (A-1).
  await sharer.locator(".seat").first().click();
  await sharer.getByRole("button", { name: "占用这个工位" }).click();
  const claimed = await waitFor(async () =>
    /A-1/.test(await seatsOf(sharer)) ? true : null,
  );
  check("玩家成功自选并占用工位 A-1", Boolean(claimed), await seatsOf(sharer));

  // A desk someone else holds cannot be claimed: the UI disables it, and the
  // server refuses it independently (covered by test/seats.test.mjs).
  await viewer.locator(".seat").first().click();
  const takeButton = viewer.getByRole("button", { name: "占用这个工位" });
  const blocked = await waitFor(async () =>
    (await takeButton.isDisabled()) ? true : null,
  );
  check("已被占用的工位不能再占有", Boolean(blocked));

  // The viewer takes a different desk.
  await viewer.locator(".seat").nth(5).click();
  await viewer.getByRole("button", { name: "占用这个工位" }).click();
  const viewerSeat = await waitFor(async () =>
    /B-2/.test(await seatsOf(viewer)) ? true : null,
  );
  check("第二个玩家占用到 B-2", Boolean(viewerSeat), await seatsOf(viewer));

  // Before sharing, every monitor is idle.
  const idle = await monitorOf(viewer, 0);
  check(
    "未共享时显示器是空闲状态",
    idle && idle.hasPreview === false,
    JSON.stringify(idle),
  );

  // Sharer starts sharing; the ambient thumbnail should reach the other client.
  await sharer.getByRole("button", { name: /共享屏幕/ }).click();
  const painted = await waitFor(async () => {
    const info = await monitorOf(viewer, 0);
    if (!info?.hasPreview) return null;
    const [r, g, b] = info.pixel;
    const isIdle =
      Math.abs(r - IDLE[0]) < 6 &&
      Math.abs(g - IDLE[1]) < 6 &&
      Math.abs(b - IDLE[2]) < 6;
    return isIdle ? null : info;
  }, 40000);
  check(
    "共享后缩略图出现在该工位的显示器上",
    Boolean(painted),
    painted ? `像素=${painted.pixel}` : "仍是空闲画面",
  );

  // A desk nobody occupies must stay idle.
  const other = await monitorOf(viewer, 3);
  check(
    "无人占用的工位显示器保持空闲",
    other && other.hasPreview === false,
    JSON.stringify(other),
  );

  // Opting out removes the thumbnail everywhere.
  await sharer.getByRole("button", { name: /工位预览：开/ }).click();
  const cleared = await waitFor(async () => {
    const info = await monitorOf(viewer, 0);
    return info && info.hasPreview === false ? true : null;
  }, 20000);
  check("关闭工位预览后显示器回到空闲", Boolean(cleared));
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
