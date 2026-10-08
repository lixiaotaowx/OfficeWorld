const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const vite = await createServer({ configFile: false, root: resolve('.'), plugins: [react()],
    server: { host: '127.0.0.1', port: 0 } });
  await vite.listen();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 700, height: 160 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    if (process.env.LIVE_DOCK) {
      const harness = require('node:fs').readFileSync(resolve('test/dock-harness.html'), 'utf8');
      await page.addInitScript({ content: harness.match(/<script>([\s\S]*?)<\/script>/)[1] });
    }
    await page.goto(process.env.LIVE_DOCK ? 'https://115.159.43.237/dock.html' :
      `http://127.0.0.1:${vite.httpServer.address().port}/test/dock-harness.html`);
    await page.waitForFunction(() => typeof window.__pushState === 'function');
    const poses = ['focused', 'busy', 'happy', 'away', 'sleepy', 'wave'];
    await page.evaluate(poses => window.__pushState({ people: poses.map((pose, i) => ({
      id: String(i), name: pose, character: 'look:' + JSON.stringify({ color: 'kraft',
        accessories: {}, autoExpression: pose }), atDesk: !['away', 'sleepy'].includes(pose),
      sharing: false, inCall: false, unread: 0, missed: false,
    })), sharing: false, missed: 0, hidden: false }), poses);
    await page.waitForFunction(() => document.querySelectorAll('.dock-avatar').length === 6 &&
      [...document.querySelectorAll('.dock-avatar')].every(n => n.style.backgroundImage.includes('data:image')));
    const images = await page.locator('.dock-avatar').evaluateAll(nodes => nodes.map(n => n.style.backgroundImage));
    assert.equal(new Set(images).size, 6, 'six distinct automatic portraits survive legacy bridge');
    assert.deepEqual(errors, []);
    await page.screenshot({ path: resolve('../Build/automatic-expressions.png') });
    console.log('Six automatic expressions rendered; no page errors');
  } finally { await browser.close(); await vite.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
