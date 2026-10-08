// Workstation verification: a player claims a desk, shares their screen, and
// another player sees that thumbnail land on the claimed desk's 3D monitor.
// Requires a site to drive (OFFICE_APP_URL, default 127.0.0.1:5188) and global Playwright.
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
// The monitor probe lives behind the diagnostic flag on a built bundle.
const DEBUG_APP = `${APP}${APP.includes("?") ? "&" : "?"}debug=1`;
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
  // Deliberately no ignoreHTTPSErrors: the deployed certificate is a real
  // Let's Encrypt one, and bypassing it would hide a regression.
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("  pageerror:", e.message));
  await page.goto(DEBUG_APP, { waitUntil: "domcontentloaded" });
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

  // Nobody holds a desk until they pick one, and the picker is shown to a
  // first-time visitor automatically.
  const seatsOf = (page) => page.locator(".identity small").innerText();
  const picker = (page) => page.locator(".seat-picker");
  /** Pick the first desk still on offer, so somebody else being in the office
   *  (which is normal) cannot fail the run. Returns the label it took. */
  const pickFreeDesk = async (page, avoid = "") => {
    await picker(page).waitFor({ timeout: 20000 });
    const options = picker(page).locator(
      ".seat-picker-grid button:not([disabled])",
    );
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      const text = (await option.innerText()).replace(/\s+/g, " ").trim();
      if (avoid && text.includes(avoid)) continue;
      await option.click();
      return text.split(" ")[0];
    }
    return "";
  };
  check(
    "首次进入自动弹出选座窗口",
    (await picker(sharer).count()) > 0,
    "弹出" + (await picker(sharer).count()),
  );
  check("初始未占工位", /没选工位/.test(await seatsOf(sharer)), await seatsOf(sharer));

  // Sharer claims a desk from the picker; it closes on success.
  const sharerLabel = await pickFreeDesk(sharer);
  const claimed = await waitFor(async () =>
    sharerLabel && new RegExp(sharerLabel).test(await seatsOf(sharer))
      ? true
      : null,
  );
  check(
    `在弹窗里点选即占用工位 ${sharerLabel}`,
    Boolean(claimed),
    await seatsOf(sharer),
  );
  const closed = await waitFor(async () =>
    (await picker(sharer).count()) === 0 ? true : null,
  );
  check("选定后弹窗自动关闭", Boolean(closed));

  // A desk someone else holds is offered as disabled in the picker, and the
  // server refuses it independently (covered by test/seats.test.mjs).
  await picker(viewer).waitFor({ timeout: 20000 });
  const takenEntry = picker(viewer).locator(".seat-picker-grid button", {
    hasText: sharerLabel,
  });
  // The other client's seat is relayed asynchronously, so wait for it to land.
  const blocked = await waitFor(async () =>
    (await takenEntry.isDisabled()) ? true : null,
  );
  check("别人已占的工位在弹窗里不可选", Boolean(blocked));

  // The viewer takes any other desk.
  const viewerLabel = await pickFreeDesk(viewer, sharerLabel);
  const viewerSeat = await waitFor(async () =>
    viewerLabel && new RegExp(viewerLabel).test(await seatsOf(viewer))
      ? true
      : null,
  );
  check(
    `第二个玩家占用到 ${viewerLabel}`,
    Boolean(viewerSeat),
    await seatsOf(viewer),
  );

  // Before sharing, every monitor is idle. The monitors only exist once the
  // office model has finished loading, so wait for them.
  const idle = await waitFor(async () => {
    const info = await monitorOf(viewer, 0);
    return info && info.hasPreview === false ? info : null;
  });
  check("未共享时显示器是空闲状态", Boolean(idle), JSON.stringify(idle));

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

  // The desk is the player's; the only way to change it is deliberately, from
  // the settings panel, and backing out of that keeps the original desk.
  await sharer.locator('button[title="使用说明"]').click();
  const settingsSeat = await sharer.locator(".settings-row strong").innerText();
  check("设置里显示当前工位", /A-1/.test(settingsSeat), settingsSeat);

  await sharer.getByRole("button", { name: "重新选座" }).click();
  await sharer.locator(".seat-picker").waitFor({ timeout: 15000 });
  check("设置可以重新打开选座弹窗", true);

  const canBack = await sharer.getByRole("button", { name: "先不选" }).count();
  check("重新选座时可以取消（首次进入则不能）", canBack > 0);
  await sharer.getByRole("button", { name: "先不选" }).click();
  const kept = await waitFor(async () =>
    /A-1/.test(await seatsOf(sharer)) ? true : null,
  );
  check("取消重新选座后工位没有被放弃", Boolean(kept), await seatsOf(sharer));

  // The seat is occupied until the end: the other client still cannot take it.
  const stillTaken = await waitFor(async () => {
    await viewer.locator('button[title="使用说明"]').click();
    await viewer.getByRole("button", { name: "重新选座" }).click();
    await viewer.locator(".seat-picker").waitFor({ timeout: 15000 });
    const entry = viewer.locator(".seat-picker-grid button", { hasText: "A-1" });
    return (await entry.isDisabled()) ? true : null;
  });
  check("工位一直属于原主人，别人始终选不了", Boolean(stillTaken));
  await viewer.getByRole("button", { name: "先不选" }).click();

  // Seat actions moved out of the sidebar: they belong with the avatar, and the
  // old 坐到 N 号工位 button contradicted desk ownership by claiming any desk.
  const claimButtons = await sharer
    .getByRole("button", { name: /坐到 \d+ 号工位/ })
    .count();
  check("不再有与归属规则冲突的「坐到 N 号工位」按钮", claimButtons === 0);

  const back = await waitFor(async () =>
    (await sharer.getByRole("button", { name: "回到我的座位" }).count()) > 0
      ? true
      : null,
  );
  check("角色控制区提供「回到我的座位」", Boolean(back));

  // Standing up must not give the desk away.
  await sharer.getByRole("button", { name: "起身" }).click();
  await new Promise((r) => setTimeout(r, 1200));
  const stillMine = await seatsOf(sharer);
  check("起身之后工位仍然是自己的", /A-1/.test(stillMine), stillMine);

  const viewerStillBlocked = await waitFor(async () => {
    await viewer.locator('button[title="使用说明"]').click();
    await viewer.getByRole("button", { name: "重新选座" }).click();
    await viewer.locator(".seat-picker").waitFor({ timeout: 15000 });
    const entry = viewer.locator(".seat-picker-grid button", { hasText: "A-1" });
    return (await entry.isDisabled()) ? true : null;
  });
  check("起身后别人依然选不到这个工位", Boolean(viewerStillBlocked));
  await viewer.getByRole("button", { name: "先不选" }).click();

  // The first-visit dialog also does the 捏人: 1 配色 then 2 配件.
  const pickerAgain = viewer.locator(".seat-picker");
  await viewer.locator('button[title="使用说明"]').click();
  await viewer.getByRole("button", { name: "重新选座" }).click();
  await pickerAgain.waitFor({ timeout: 15000 });
  check(
    "选座弹窗里先选配色、再选配件",
    (await pickerAgain.locator(".color-grid button").count()) >= 8 &&
      (await pickerAgain.locator(".accessory-list").count()) === 0,
  );
  await pickerAgain.locator('.look-steps button', { hasText: "2 配件" }).click();
  check("第 2 步有四个配件分组",
    (await pickerAgain.locator(".accessory-row").count()) === 4);
  await pickerAgain.locator(".accessory-row", { hasText: "帽子" })
    .locator("button", { hasText: "礼帽" }).click();
  // The settings dialog shows the same panel, so the stored choice is readable
  // there as the selected thumbnail.
  await viewer.locator('button[aria-label="设置"]').click();
  const avatarSwitched = await waitFor(async () => {
    await viewer.locator('.character-setting .look-steps button', { hasText: "2 配件" }).click();
    const hat = await viewer
      .locator('.character-setting .accessory-row', { hasText: "帽子" })
      .locator('button[aria-selected="true"]').getAttribute("title");
    return hat === "礼帽" ? true : null;
  });
  check("在弹窗里选配件会真的戴上", Boolean(avatarSwitched));
  await viewer.getByRole("button", { name: "关闭", exact: true }).click();
  await viewer.getByRole("button", { name: "先不选" }).click();
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
