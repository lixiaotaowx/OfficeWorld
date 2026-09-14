// Remote avatars: one real browser client must be able to see the other one
// standing, walking and sitting in the 3D office.
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
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -- " + detail : ""}`);
};
const waitFor = async (fn, timeoutMs = 30000, interval = 400) => {
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
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});

async function open() {
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log("  pageerror:", e.message));
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=本地协作已连接", { timeout: 30000 });
  return page;
}

// Ask the page what remote avatars it is currently drawing.
const avatarIds = (page) =>
  page.evaluate(() => {
    const debug = window.__officeDebug;
    return debug?.remotes ? debug.remotes.snapshot() : null;
  });

try {
  const a = await open();
  const b = await open();

  // A must appear on B as a real, loaded character.
  const seen = await waitFor(async () => {
    const list = await avatarIds(b);
    return list && list.length === 1 && list[0].loaded ? list : null;
  }, 30000);
  check(
    "另一个玩家出现在我的场景里且模型已加载",
    Boolean(seen),
    seen ? JSON.stringify(seen) : "没有远端角色",
  );

  // Default character matches what the other client joined with.
  check(
    "远端角色外观跟随对方选择",
    seen?.[0]?.kind === "woman_casual",
    seen?.[0]?.kind,
  );

  // Switch A to a male avatar and confirm B renders that change.
  const before = (await avatarIds(b))?.[0];
  await a.selectOption("select[aria-label='选择角色']", "man_casual_2");
  const switched = await waitFor(async () => {
    const list = await avatarIds(b);
    return list?.[0]?.kind === "man_casual_2" ? list[0] : null;
  }, 15000);
  check("对方切换角色后我这边也跟着换", Boolean(switched), switched?.kind);

  // Walk A around; B's copy must follow and end up at the same place.
  // Blur whatever got focus from the select above, otherwise the avatar's
  // key handler ignores the events as "typing into a form field".
  await a.evaluate(() => {
    const active = document.activeElement;
    if (active && active.blur) active.blur();
  });
  await a.keyboard.down("a");
  await new Promise((r) => setTimeout(r, 2500));
  await a.keyboard.up("a");

  const localMoved = await a.evaluate(() => window.__officeDebug?.local?.());
  const travelled = localMoved
    ? Math.hypot(localMoved.x - before.x, localMoved.z - before.z)
    : 0;
  check(
    "分享方自己的角色确实走动了（发送端）",
    travelled > 0.3,
    `走了 ${travelled.toFixed(2)}m -> ${JSON.stringify(localMoved)}`,
  );

  const followed = await waitFor(async () => {
    const list = await avatarIds(b);
    const now = list?.[0];
    if (!now || !localMoved || travelled < 0.3) return null;
    // The remote copy must converge on where the sender actually is.
    const gap = Math.hypot(now.x - localMoved.x, now.z - localMoved.z);
    return gap < 0.5 ? { now, gap } : null;
  }, 20000);
  check(
    "我看到对方的位置与他自己的一致",
    Boolean(followed),
    followed
      ? `误差 ${followed.gap.toFixed(2)}m，（我这边 ${followed.now.x}, ${followed.now.z}）`
      : "远端位置未收敛",
  );

  // Claiming a desk should show that player seated.
  await a.locator(".seat").nth(2).click();
  await a.getByRole("button", { name: "占用这个工位" }).click();
  const localSeated = await waitFor(async () => {
    const state = await a.evaluate(() => window.__officeDebug?.local?.());
    return state?.sitting ? state : null;
  }, 25000);
  check(
    "分享方自己确实坐下了（发送端）",
    Boolean(localSeated),
    JSON.stringify(localSeated),
  );

  const seated = await waitFor(async () => {
    const list = await avatarIds(b);
    const now = list?.[0];
    if (!now?.sitting) return null;
    // Seat 2 is A-3 at (1.987, 4.98).
    const near = Math.hypot(now.x - 1.987, now.z - 4.98) < 1.2;
    return near ? now : null;
  }, 25000);
  check(
    "对方坐下后我看到他坐在对应工位",
    Boolean(seated),
    seated ? `坐在 (${seated.x}, ${seated.z})` : "没有坐下或位置不符",
  );

  // Leaving removes the avatar from the scene.
  await b.close();
  const gone = await waitFor(async () => {
    const list = await avatarIds(a);
    return list && list.length === 0 ? true : null;
  }, 20000);
  check("对方离开后角色从场景中移除", Boolean(gone));
} catch (error) {
  check("测试执行未抛异常", false, error.message);
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
