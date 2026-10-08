// Screen-share verification: one client shares, another is approved and then
// receives the real LiveKit video track. Requires the same setup as
// livekit-browser.mjs (a site via OFFICE_APP_URL, Playwright).
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
if (!livekit.ready) {
  console.error("未配置 LiveKit：请先创建 OfficeWeb/.env");
  process.exit(2);
}

const APP = process.env.OFFICE_APP_URL || "http://127.0.0.1:5188/";
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

const service = new RoomServiceClient(
  livekit.url.replace(/^ws/, "http"),
  livekit.apiKey,
  livekit.apiSecret,
);
const screenRooms = async () => {
  try {
    return (await service.listRooms()).filter((r) => r.name.startsWith("screen-"));
  } catch {
    return [];
  }
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
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=本地协作已连接", { timeout: 30000 });
  return page;
}

try {
  const sharer = await open();
  const viewer = await open();

  const sharerName = (await sharer.locator(".identity strong").innerText()).trim();
  check("分享方已进入空间", Boolean(sharerName), sharerName);

  // Sharing is workstation-centric: the sharer occupies a desk first, which is
  // also how the viewer finds them in the seat grid. A first-time visitor gets
  // the picker automatically, and picking a desk there claims it.
  const picker = sharer.locator(".seat-picker");
  await picker.waitFor({ timeout: 20000 });
  await picker.locator(".seat-picker-grid button").first().click();
  const seated = await waitFor(async () =>
    /工位/.test(await sharer.locator(".identity small").innerText()) ? true : null,
  );
  check("分享方先占用了一个工位", Boolean(seated));

  // The viewer also gets the first-visit picker, and it blocks the page, so
  // answer it before trying to reach the sidebar.
  const viewerPicker = viewer.locator(".seat-picker");
  await viewerPicker.waitFor({ timeout: 20000 });
  await viewerPicker.locator(".seat-picker-grid button").nth(4).click();
  const viewerSeated = await waitFor(async () =>
    /工位/.test(await viewer.locator(".identity small").innerText())
      ? true
      : null,
  );
  check("观看方也选到了自己的工位", Boolean(viewerSeated));

  // 1. Start sharing. getDisplayMedia is auto-granted by the launch flags.
  await sharer.getByRole("button", { name: /共享屏幕/ }).click();
  const sharingOn = await waitFor(async () =>
    (await sharer.getByRole("button", { name: /停止共享/ }).count()) > 0,
  );
  check("分享方已开始共享", Boolean(sharingOn));

  // 2. Viewer picks that seat and requests to see the screen.
  await viewer.locator(".seat", { hasText: sharerName }).first().click();
  const requestButton = viewer.getByRole("button", { name: "请求看屏幕" });
  const enabled = await waitFor(async () =>
    (await requestButton.isEnabled()) ? true : null,
  );
  check("观看方可以发起看屏幕请求", Boolean(enabled));
  await requestButton.click();

  // 3. Sharer approves the consent prompt.
  const modal = sharer.locator(".modal");
  await modal.waitFor({ timeout: 20000 });
  check("分享方收到同意弹窗", (await modal.count()) > 0);
  await modal.getByRole("button", { name: "同意" }).click();

  // 4. The LiveKit screen room must appear with both parties and a screen track.
  const room = await waitFor(async () => {
    const rooms = await screenRooms();
    return rooms.length ? rooms[0] : null;
  });
  check("已建立屏幕共享房间", Boolean(room), room?.name);

  const joined = await waitFor(async () => {
    const list = await service.listParticipants(room.name).catch(() => []);
    return list.length >= 2 ? list : null;
  });
  check(
    "房间内双方都在",
    (joined || []).length >= 2,
    (joined || []).map((p) => `${p.name}:${p.tracks.length}`).join(", "),
  );

  const screenTrack = await waitFor(async () => {
    const list = await service.listParticipants(room.name).catch(() => []);
    const found = list.flatMap((p) => p.tracks || []).find((t) => /screen/i.test(t.name || ""));
    return found || null;
  });
  check("已发布屏幕共享轨道", Boolean(screenTrack), screenTrack?.name);

  // 5. The viewer must actually render remote video.
  const video = await waitFor(async () => {
    const count = await viewer.locator(".session-panel video").count();
    if (!count) return null;
    const size = await viewer
      .locator(".session-panel video")
      .first()
      .evaluate((el) => ({ w: el.videoWidth, h: el.videoHeight }));
    return size.w > 0 ? size : null;
  });
  check("观看方收到并渲染了视频", Boolean(video), video ? `${video.w}x${video.h}` : "无视频帧");

  await viewer.screenshot({ path: "../Build/livekit-browser-screenshare.png" }).catch(() => undefined);

  // 6. Stopping the share tears the room down.
  await sharer.getByRole("button", { name: /停止共享/ }).click();
  const gone = await waitFor(async () => {
    const rooms = await screenRooms();
    return rooms.length === 0 ? true : null;
  });
  check("停止共享后房间关闭", Boolean(gone));
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
