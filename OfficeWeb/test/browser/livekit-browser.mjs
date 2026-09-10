// Browser verification harness for the LiveKit media path.
//
// Requires three things, so it is kept out of `npm test`:
//   1. the signaling server:  npm run server        (port 3108)
//   2. the Vite dev server:   npm run dev           (port 5188)
//   3. Playwright with Chromium installed globally
//
// Run from OfficeWeb:  npm run test:browser
//
// It drives two real browser clients, then queries the LiveKit server directly
// to confirm both actually joined the room and published audio.
import { createRequire } from "node:module";
import { RoomServiceClient } from "livekit-server-sdk";
import { livekit } from "../../livekit.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  chromium = require(process.env.APPDATA + "/npm/node_modules/playwright").chromium;
} catch {
  console.error("找不到全局 playwright，请先安装：npm i -g playwright && npx playwright install chromium");
  process.exit(2);
}

const APP = process.env.OFFICE_APP_URL || "http://127.0.0.1:5188/";
const SHOT = process.env.OFFICE_SHOT || "../Build/livekit-browser-meeting.png";
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

if (!livekit.ready) {
  console.error("未配置 LiveKit：请先创建 OfficeWeb/.env（参考 .env.example）");
  process.exit(2);
}
const service = new RoomServiceClient(
  livekit.url.replace(/^ws/, "http"),
  livekit.apiKey,
  livekit.apiSecret,
);
const participants = async (room) => {
  try {
    return await service.listParticipants(room);
  } catch {
    return [];
  }
};

const browser = await chromium.launch({
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
  ],
});
const sockets = new Set();
const errors = [];

async function open(label) {
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  page.on("websocket", (ws) => {
    if (ws.url().includes(":7880")) sockets.add(ws.url().split("?")[0]);
  });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`${label}: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`${label}: pageerror ${e.message}`));
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=本地协作已连接", { timeout: 30000 });
  return page;
}

try {
  const a = await open("A");
  const b = await open("B");
  check("两客户端已连接到信令服务", true);

  for (const page of [a, b]) {
    await page.getByRole("button", { name: "加入会议" }).click();
  }

  const panel = await waitFor(async () => {
    const text = await a.locator(".session-panel").innerText().catch(() => "");
    return /2 人/.test(text) ? text.replace(/\s+/g, " ").trim() : null;
  });
  check("会议面板显示 2 人在线", Boolean(panel), panel || "未出现");

  const joined = await waitFor(async () => {
    const list = await participants("meeting");
    return list.length >= 2 ? list : null;
  });
  check(
    "LiveKit 房间内确有 2 个参与者",
    (joined || []).length === 2,
    (joined || []).map((p) => p.name).join(", "),
  );

  const published = await waitFor(async () => {
    const list = await participants("meeting");
    if (list.length < 2) return null;
    return list.every((p) => p.tracks?.some((t) => /microphone/i.test(t.name || "")))
      ? list
      : null;
  });
  check("双方都发布了麦克风轨道", Boolean(published));

  check("浏览器已建立到 LiveKit 的 WebSocket", sockets.size > 0, [...sockets].join(","));

  // The client probes /rtc/v1 first and falls back to /rtc on this older
  // server, which the browser reports as one 404. That is expected here.
  const probe = errors.filter((e) => /rtc\/v1|404/.test(e));
  const other = errors.filter(
    (e) => !/rtc\/v1|404|favicon|Autoplay|WebGL|Permission/i.test(e),
  );
  check(
    "除版本探测 404 外无其他控制台错误",
    probe.length > 0 && other.length === 0,
    other.slice(0, 2).join(" | ") || `${probe.length} 次 /rtc/v1 探测`,
  );

  await a.screenshot({ path: SHOT }).catch(() => undefined);

  await a.locator(".session-panel").getByRole("button", { name: "离开" }).click();
  const after = await waitFor(async () => {
    const list = await participants("meeting");
    return list.length <= 1 ? list : null;
  });
  check("离开会议后房间成员减少到 1", (after || []).length <= 1, `${(after || []).length} 人`);
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
