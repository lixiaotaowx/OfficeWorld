const { chromium } = require("./playwright.cjs");
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [], errors = [];
  try {
    for (const mode of ['original', 'balanced', 'webp', 'fallback']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 940 } });
      if (mode === 'fallback') await context.route('**/office-balanced-gpu.glb*', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (/INVALID_(VALUE|OPERATION)|GL_INVALID/.test(message.text())) errors.push(message.text());
      });
      await page.goto('http://127.0.0.1:5199/test/screen-click.html?textures=' + mode);
      await page.waitForFunction(() => window.__officeDebug?.monitors?.meshFor(0), null, { timeout: 60000 });
      await page.waitForTimeout(1800);
      const textures = await page.evaluate(() => {
        const maps = new Set();
        window.__officeDebug.__scene.traverse(o => {
          if (o.isMesh) for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m.map) maps.add(m.map);
        });
        return { count: maps.size, compressed: [...maps].filter(t => t.isCompressedTexture).length,
          maxSize: Math.max(...[...maps].map(t => Math.max(t.image?.width || 0, t.image?.height || 0))) };
      });
      if (mode === 'balanced') assert.ok(textures.compressed > 100);
      if (mode === 'webp' || mode === 'fallback') assert.equal(textures.compressed, 0);
      await page.locator('#member').click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.resolve('Build/memory-near-' + mode + '.png') });
      if (mode === 'balanced') {
        const race = await page.evaluate(() => {
          const Original = window.Image, pending = [];
          window.Image = class { constructor() { pending.push(this); } };
          const monitors = window.__officeDebug.monitors;
          try {
            monitors.setPreview(0, 'data:image/jpeg;base64,delayed');
            monitors.setPreview(0, null);
            pending[0].onload();
            const cleared = !monitors.previewInfo(0).hasPreview;
            monitors.setPreview(0, 'data:image/jpeg;base64,disposed');
            const canvases = [...monitors.slots.values()].map(s => s.canvas);
            monitors.dispose(); pending[1].onload();
            return { cleared, released: canvases.every(c => c.width === 0 && c.height === 0) };
          } finally { window.Image = Original; }
        });
        assert.equal(race.cleared, true); assert.equal(race.released, true);
      }
      results.push({ mode, ...textures });
      await context.close();
    }
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(path.resolve('Build/memory-texture-validation.json'), JSON.stringify({ results, errors }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
