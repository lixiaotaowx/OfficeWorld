// Offline dock bridge: no real accounts, calls or permissions. Each command must
// address the person whose card was pressed, even when focus changes mid-click.
const { launch } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  let vite, browser;
  try {
    let base = process.env.DOCK_UI_SITE;
    if (!base) {
      vite = await createServer({ configFile: false, root: process.cwd(), plugins: [react()],
        server: { host: '127.0.0.1', port: 0, strictPort: true } });
      await vite.listen(); base = 'http://127.0.0.1:' + vite.httpServer.address().port;
    }
    browser = await launch();
    const page = await browser.newPage({ viewport: { width: 540, height: 520 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    let target = '/test/dock-harness.html';
    if (process.env.DOCK_UI_SITE) {
      const html = await (await page.request.get(base + '/dock.html')).text();
      const script = html.match(/<script[^>]*src="([^"]+)"/)[1];
      const css = [...html.matchAll(/<link[^>]*href="([^"]+\.css)"/g)]
        .map(m => `<link rel="stylesheet" href="${m[1]}">`).join('');
      const fixture = fs.readFileSync('test/dock-harness.html', 'utf8')
        .replace('<script type="module" src="/src/dock.tsx"></script>', `${css}<script type="module" src="${script}"></script>`);
      target = '/target-identity-regression';
      await page.route(base + target, route => route.fulfill({ contentType: 'text/html', body: fixture }));
    }
    await page.goto(base + target);
    if (process.env.DOCK_UI_SITE) await page.reload(); // Ordinary refresh uses the published hashed assets.
    const card = page.locator('.dock-card');
    const avatar = id => page.locator(`[data-person-id="${id}"]`);
    async function show(id) {
      await avatar(id).hover();
      const name = await avatar(id).getAttribute('aria-label');
      await page.getByRole('dialog', { name: name + ' 的屏幕预览', exact: true }).waitFor();
      await page.waitForTimeout(120);
    }
    const results = [];
    for (const [index, kind] of ['watch', 'share', 'call'].entries()) {
      await show('p1');
      const button = card.locator('button').nth(index);
      await button.hover();
      const count = await page.evaluate(() => window.__actions.length);
      await page.mouse.down();
      // An inactive native window can restore its previously focused avatar.
      // Recreate that focus transition while the mouse is still on p1's button.
      await avatar('p2').focus();
      await page.waitForTimeout(140);
      const shown = await card.getAttribute('aria-label');
      await page.mouse.up();
      await page.waitForTimeout(50);
      const actions = await page.evaluate(n => window.__actions.slice(n), count);
      results.push({ kind, pressed: 'p1', shown, actions });
      console.log(JSON.stringify(results.at(-1)));
      assert.equal(shown, '同事乙 的屏幕预览', 'restored focus must not replace the card under the pointer');
      assert.deepEqual(actions, [[kind, 'p1']], 'never retarget a button press to another person');
    }
    // Re-ranking and changes to name/status must preserve ID, including while
    // the user holds a button down. No array index or display name is a target.
    for (const [index, kind] of ['watch', 'share', 'call'].entries()) {
      await show('p1');
      await card.locator('.dock-card-actions button').nth(index).hover();
      const count = await page.evaluate(() => window.__actions.length);
      await page.mouse.down();
      await page.evaluate(() => window.__pushState({ ...window.__dockState,
        people: [...window.__dockState.people].reverse().map(p => ({ ...p, unread: 7 })) }));
      await page.waitForTimeout(150);
      await page.mouse.up();
      assert.deepEqual(await page.evaluate(n => window.__actions.slice(n), count), [[kind, 'p1']]);
    }
    // If the target leaves and another avatar takes its place, cancel the press.
    await show('p1'); await card.locator('.dock-card-actions button').last().hover();
    const count = await page.evaluate(() => window.__actions.length);
    await page.mouse.down();
    await page.evaluate(() => window.__pushState({ ...window.__dockState,
      people: window.__dockState.people.filter(p => p.id !== 'p1') }));
    await card.waitFor({ state: 'detached' });
    await page.mouse.up();
    assert.equal(await page.evaluate(() => window.__actions.length), count);
    await page.evaluate(() => window.__pushState(window.__dockState));
    // Change to a different card during a held press: new DOM identity prevents
    // the mouseup from completing a click on the replacement person's button.
    await show('p1'); await card.locator('.dock-card-actions button').last().hover();
    await page.mouse.down();
    await avatar('p2').dispatchEvent('mouseover', { relatedTarget: null });
    await page.getByRole('dialog', { name: '客户丙 的屏幕预览', exact: true }).waitFor();
    await page.waitForTimeout(140);
    await page.mouse.up();
    assert.equal(await page.evaluate(() => window.__actions.length), count, 'replacement card must not inherit a held click');
    // Keyboard navigation is explicit and remains usable without a mouse hover.
    await page.mouse.move(0, 0); await page.waitForTimeout(400);
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    for (let n = 0; n < 8 && await page.evaluate(() => document.activeElement?.getAttribute('data-person-id')) !== 'p1'; n++) {
      await page.keyboard.press('Tab');
    }
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('data-person-id')), 'p1');
    await page.getByRole('dialog', { name: '同事乙 的屏幕预览', exact: true }).waitFor();
    await card.locator('.dock-card-actions button').last().focus();
    await page.keyboard.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.__actions.at(-1)), ['call', 'p1']);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify(results));
  } finally { await browser?.close(); await vite?.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
