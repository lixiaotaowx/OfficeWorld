// 小窗舞台：尺子角色的每套配色都要真的能拉出来演招手。
//
// 原来是"21 个角色各演一遍"（用户 2026-09-20：「注意检查所有角色都要适配打招呼的动作」）。
// 现在只有一个角色，但配色有 10 套、配件 19 件 —— 外观变了不能把动作演坏，
// 所以逐个配色演一遍，量手腕的累计位移。
//
//   node test/browser/greet-characters.cjs     (run from OfficeWeb/)
const { chromium } = require("./playwright.cjs");
const { createServer } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve, join } = require("node:path");
const assert = require("node:assert/strict");

const WATCH_MS = 900;
/** 待机约 0.02，招手 0.75~1.0；低于这个值就是"站着没动"。 */
const MOTION_MIN = 0.15;

(async () => {
  const vite = await createServer({
    configFile: false, root: resolve("."), plugins: [react()],
    server: { host: "127.0.0.1", port: 0 },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 520, height: 620 } });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    const models = new Set();
    page.on("response", (response) => {
      const match = /\/assets\/characters\/([^/]+)\.glb(?:\?.*)?$/.exec(response.url());
      if (match) models.add(match[1]);
    });
    await page.goto(`http://127.0.0.1:${port}/test/dock-harness.html`);
    await page.waitForFunction(() => document.querySelectorAll(".dock-avatar").length === 4, null, { timeout: 30000 });

    const colors = await page.evaluate(async () => {
      const module = await import("/src/look.ts");
      return module.PALETTE.map(entry => entry.id);
    });
    assert.ok(colors.length >= 8, "配色应该有 8 套以上，实际 " + colors.length);

    const rows = [];
    for (const color of colors) {
      const appearance = { color,
        accessories: { glasses: "black", hair: "short", beard: "none", hat: "none" } };
      await page.evaluate(look => window.__pushGreet({
        id: "p1", name: "同事乙", appearance: look, mode: "call" }), appearance);
      await page.waitForSelector(".dock-stage.call canvas", { timeout: 30000 });
      await page.waitForFunction(() => Boolean(document.querySelector(".dock-stage canvas")?.__dockStage),
        null, { timeout: 30000 });
      await page.waitForTimeout(WATCH_MS);
      const row = await page.evaluate(() => {
        const canvas = document.querySelector(".dock-stage canvas");
        const stage = canvas?.__dockStage || {};
        return { clip: stage.clip, frames: stage.frames || 0, motion: stage.motion || 0,
          size: [canvas.width, canvas.height] };
      });
      rows.push({ color, ...row });
      console.log(String(color).padEnd(10), "clip=" + row.clip, "frames=" + row.frames,
        "motion=" + row.motion.toFixed(3), "canvas=" + row.size.join("x"));
      assert.equal(row.clip, "招手_Wave", color + " 要演招手");
      assert.deepEqual(row.size, [320, 380], color + " 是打电话过来那一档，画布要够大");
      assert.ok(row.frames > 10, color + " 的舞台没有出帧：" + row.frames);
      assert.ok(row.motion > MOTION_MIN, `${color} 的招手根本没动（手腕累计位移 ${row.motion}）`);
    }
    assert.equal(rows.length, colors.length);
    assert.deepEqual([...models], ["ruler"], "只该下载尺子角色那一个模型：" + [...models].join(", "));

    // 只是鼠标停一下：小一倍、不演动作。
    await page.evaluate(() => window.__pushGreet({ id: "p1", name: "同事乙",
      appearance: { color: "sage", accessories: { glasses: "none", hair: "none", beard: "none", hat: "none" } } }));
    await page.waitForSelector(".dock-stage.peek canvas", { timeout: 30000 });
    await page.waitForTimeout(1200);
    const peekStage = await page.evaluate(() => {
      const canvas = document.querySelector(".dock-stage canvas");
      return { clip: canvas?.__dockStage?.clip, size: [canvas.width, canvas.height] };
    });
    assert.deepEqual(peekStage.size, [160, 190], "只是鼠标停一下：小一倍");
    assert.equal(peekStage.clip, "", "只是停一下不用打招呼");
    // Installed bridges keep roster.character but may discard greet.appearance.
    await page.waitForSelector('.dock-stage', { state: 'detached', timeout: 6000 });
    for (const mode of ['peek', 'call']) {
      await page.evaluate(mode => {
        const look = { color: 'lilac', accessories: {
          glasses: 'black', hair: 'bob', beard: 'goatee', hat: 'tophat' } };
        window.__pushState({ ...window.__dockState, people: window.__dockState.people.map(p =>
          p.id === 'p1' ? { ...p, character: 'look:' + JSON.stringify(look) } : p) });
        window.__pushGreet({ id: 'p1', name: '同事乙', mode });
      }, mode);
      await page.waitForFunction(mode => {
        const probe = document.querySelector('.dock-stage canvas')?.__dockStage;
        return probe?.mode === mode && probe.appearance.color === 'lilac' && probe.frames > 4;
      }, mode);
      const look = await page.evaluate(() => document.querySelector('.dock-stage canvas').__dockStage.appearance);
      assert.equal(look.accessories.hat, 'tophat');
      assert.equal(look.accessories.beard, 'goatee');
    }
    assert.equal(await page.locator('.dock-avatar').first().evaluate(el => el.getBoundingClientRect().width), 40);
    // A real second window carries the blue beard even if IPC and roster lose the look.
    const sender = await page.context().newPage();
    await sender.goto(`http://127.0.0.1:${port}/dock.html`);
    await sender.evaluate(async () => {
      window.officeDesktop = { dockGreet: async () => true };
      const { sendDockGreeting } = await import('/src/dockGreeting.ts');
      sendDockGreeting({ id: 'p1', name: '蓝色胡子', mode: 'peek', appearance: {
        color: 'sky', accessories: { glasses: 'none', hair: 'none', beard: 'full', hat: 'none' }
      } });
    });
    await page.waitForFunction(() => {
      const look = document.querySelector('.dock-stage canvas')?.__dockStage?.appearance;
      return look?.color === 'sky' && look.accessories.beard === 'full';
    });
    await page.evaluate(() => window.__pushGreet({ id: 'p1', name: '蓝色胡子', mode: 'peek' }));
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => document.querySelector('.dock-stage canvas').__dockStage.appearance.color), 'sky');
    await sender.close();
    const shot = await page.locator(".dock-stage").screenshot({
      path: join(resolve(__dirname, "..", "..", ".."), "Build/dock-greet-characters.png") });
    assert.ok(shot.length > 2000, "截图应该真的有内容：" + shot.length);

    assert.deepEqual(errors, []);
    console.log(`PASS ${rows.length} 套配色的招手都适配（画布 320×380，手腕位移都在 ${MOTION_MIN} 以上）`);
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

