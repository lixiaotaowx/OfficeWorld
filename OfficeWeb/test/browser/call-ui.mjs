import { createRequire } from 'node:module';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require("./playwright.cjs");
const vite = await createServer({ configFile: false, root: resolve('.'), plugins: [react()], server: { host: '127.0.0.1', port: 0 } });
await vite.listen();
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
try {
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(e.message));
  for (const mobile of [false, true]) {
    await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1280, height: 850 });
    for (const meeting of [false, true]) {
      await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/test/call-ui-harness.html${meeting ? '?meeting' : ''}`);
      await page.getByRole('button', { name: '静音', exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: '静音', exact: true }).locator('svg').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: resolve(`../Build/call-ui-${meeting ? 'meeting' : 'private'}-${mobile ? 'mobile' : 'desktop'}.png`) });
    }
  }
  assert.deepEqual(errors, []);
  console.log('PASS private and meeting SVG controls, desktop/mobile layout, zero page errors');
} finally { await browser.close(); await vite.close(); }
