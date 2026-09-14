// Quick browser smoke check for the character picker and avatar loading.
// Run against a deployed/development OfficeWeb instance.
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(
  process.env.APPDATA + "/npm/node_modules/playwright",
);

const APP = process.env.OFFICE_APP_URL || "http://127.0.0.1:3108/?debug=1";
const browser = await chromium.launch({
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text().slice(0, 180));
});

try {
  await page.goto(APP, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("text=本地协作已连接", { timeout: 30000 });

  const picker = await page.locator(".seat-picker-hint").count();
  const genderTabs = await page
    .locator(".seat-picker-hint .gender-tabs button")
    .count();
  const gridButtons = await page
    .locator(".seat-picker-hint .character-grid button")
    .count();
  const thumbs = await page
    .locator(".seat-picker-hint .character-grid button img")
    .count();
  console.log(
    `picker=${picker} genderTabs=${genderTabs} womanGrid=${gridButtons} thumbs=${thumbs}`,
  );

  await page.locator(".gender-tabs button", { hasText: "男角色" }).click();
  const menGrid = await page
    .locator(".seat-picker-hint .character-grid button")
    .count();
  console.log(`menGrid=${menGrid}`);

  await page.locator(".character-grid button", { hasText: "宇航服" }).click();
  const selectVal = await page
    .locator("select[aria-label='选择角色']")
    .inputValue();
  console.log(`selectedCharacter=${selectVal}`);

  await page.waitForTimeout(3500);
  const scene = await page.evaluate(() => {
    const s = window.__officeDebug?.__scene;
    const root = s?.getObjectByName?.("Controlled avatar");
    const meshes = [];
    root?.traverse((o) => {
      if (o.isMesh) meshes.push(o.name);
    });
    return {
      hasScene: Boolean(s),
      rootChildren: root ? root.children.length : -1,
      meshCount: meshes.length,
    };
  });
  console.log(`scene=${JSON.stringify(scene)}`);

  const local = await page.evaluate(() => window.__officeDebug?.local?.());
  console.log(`local=${JSON.stringify(local)}`);

  // Exercise the sitting library: walk to seat 0, sit, switch pose, stand up.
  const waitFor = async (fn, timeoutMs = 30000) => {
    const deadline = Date.now() + timeoutMs;
    let last = null;
    while (Date.now() < deadline) {
      last = await fn();
      if (last) return last;
      await new Promise((r) => setTimeout(r, 300));
    }
    return last;
  };
  await page.evaluate(() => window.__officeDebug.avatar.sit(0));
  const sitting = await waitFor(() =>
    page.evaluate(() => window.__officeDebug.local().sitting),
  );
  console.log(`sitting=${Boolean(sitting)}`);
  await page.evaluate(() => window.__officeDebug.avatar.setPose("crossLegs"));
  await page.waitForTimeout(400);
  const pose = await page.evaluate(() => window.__officeDebug.local().pose);
  const seatedState = await page.evaluate(() => window.__officeDebug.local());
  console.log(`pose=${pose} seated=${JSON.stringify(seatedState)}`);
  await page.evaluate(() => window.__officeDebug.avatar.standUp());
  const stood = await waitFor(() =>
    page.evaluate(() => !window.__officeDebug.local().sitting),
  );
  console.log(`stoodUp=${Boolean(stood)}`);
} catch (error) {
  console.log("SMOKE_ERROR:", error.message);
} finally {
  console.log(`errors=${JSON.stringify(errors)}`);
  await browser.close();
}
