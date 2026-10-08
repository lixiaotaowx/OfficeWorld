const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const vite = await createServer({ configFile: false, root: resolve('.'), plugins: [react()], server: { host: '127.0.0.1', port: 0 } });
  await vite.listen();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/test/compact-call-harness.html`);
      await page.getByRole('button', { name: '收起通话窗口', exact: true }).click();
      await page.getByRole('button', { name: '收起共享预览', exact: true }).click();
      const call = page.locator('.private-calls'), sharing = page.locator('.sharing-preview');
      const a = await call.boundingBox(), b = await sharing.boundingBox();
      assert.ok(a.height <= 44 && a.width <= 240, JSON.stringify(a));
      assert.ok(b.height <= 44 && b.width <= 220, JSON.stringify(b));
      assert.ok(a.y + a.height <= b.y, 'cards do not overlap');
      const checkClear = async () => {
        const rail = await page.locator('.call-floating-panels').boundingBox();
        for (const selector of ['.build-ui', '.bottom-bar']) {
          const box = await page.locator(selector).boundingBox();
          assert.ok(rail.y + rail.height <= box.y - 6, selector);
          assert.equal(await page.locator(selector).evaluate(n => {
            const r = n.getBoundingClientRect(); return n.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
          }), true, `${selector} remains reachable`);
        }
      };
      await checkClear();
      await page.locator('.build-ui').evaluate(n => { n.style.height = '140px'; });
      await page.waitForTimeout(100); await checkClear();
      await page.getByRole('button', { name: '静音', exact: true }).click();
      await call.getByRole('button', { name: '挂断通话', exact: true }).click();
      await sharing.getByRole('button', { name: '停止共享', exact: true }).click();
      assert.deepEqual(await page.evaluate(() => window.actions), { mute: 1, end: 1, stop: 1 });
      assert.equal(await page.evaluate(() => window.testStream.getVideoTracks()[0].readyState), 'live');
      assert.equal(await page.locator('.sharing-preview video').evaluate(v => v.srcObject === window.testStream), true);
      await page.screenshot({ path: resolve(`../Build/compact-call-${width}.png`) });
      await page.getByRole('button', { name: '展开共享预览', exact: true }).click();
      await page.getByRole('button', { name: /^展开与/ }).click();
      await page.locator('.sharing-preview video').waitFor({ state: 'visible' });
      assert.ok(await call.getByRole('button', { name: '收起通话窗口', exact: true }).isVisible());
      console.log('PASS compact dimensions, toolbar clearance, controls and stream preservation', width);
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); await vite.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
