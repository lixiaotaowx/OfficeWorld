const { launch } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const vite = await createServer({ configFile: false, root: resolve('.'), plugins: [react()], server: { host: '127.0.0.1', port: 0 } });
  await vite.listen();
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 720, height: 540 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin + '/test/dock-harness.html');
    await page.getByRole('button', { name: '我', exact: true }).click();
    await page.getByRole('button', { name: '加状态', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.__actions.at(-1)), ['status', 'me']);
    await page.getByRole('button', { name: '我', exact: true }).click({ button: 'right' });
    await page.getByRole('dialog', { name: '我的状态' }).waitFor();
    await page.getByRole('button', { name: '关闭状态菜单' }).click();
    await page.getByRole('button', { name: '同事乙', exact: true }).click({ button: 'right' });
    assert.equal(await page.getByRole('dialog', { name: '我的状态' }).count(), 0);
    await page.evaluate(() => {
      const next = structuredClone(window.__dockState);
      next.people.forEach((p, i) => { p.status = ['吃饭去了', '有事外出', '报销提醒', '文件准备提醒'][i]; });
      window.__pushState(next);
    });
    await page.locator('.dock-status-bubble').last().waitFor();
    await page.mouse.move(5, 5);
    await page.waitForTimeout(600);
    const boxes = await page.locator('.dock-status-bubble').evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    }));
    for (let i = 0; i < boxes.length; i++) {
      assert.ok(boxes[i].top >= 0 && boxes[i].bottom < 510);
      if (i) assert.ok(boxes[i-1].right <= boxes[i].left, 'status bubbles do not overlap');
    }
    assert.equal(await page.evaluate(() => window.__layouts.at(-1).expanded), true);
    await page.screenshot({ path: resolve('../Build/presence-status-dock.png') });
    assert.equal(await page.locator('.dock-status-bubble').first().evaluate(n => getComputedStyle(n).fontSize), '11px');
    await page.getByRole('button', { name: '我', exact: true }).click({ button: 'right' });
    await page.getByRole('button', { name: '清除状态', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.__actions.at(-1)), ['status-clear', 'me']);
    await page.evaluate(() => {
      const next = structuredClone(window.__dockState);
      next.people[0].status = '';
      window.__pushState(next);
    });
    await page.getByRole('dialog', { name: '我的状态' }).waitFor({ state: 'detached' });
    let statuses = {}, fail = false, hang = false;
    await page.route('**/api/presence-status', async route => {
      if (route.request().method() === 'POST') {
        if (hang) return; // Deliberately leave this request unanswered.
        if (fail) return route.fulfill({ status: 400, json: { error: '状态未能保存，请重试' } });
        const { text } = route.request().postDataJSON();
        statuses = text ? { me: text } : {};
      }
      await route.fulfill({ json: { statuses } });
    });
    await page.goto(origin + '/test/presence-status-harness.html');
    await page.waitForFunction(() => typeof window.__command === 'function');
    await page.evaluate(() => window.__command({ kind: 'status', personId: 'somebody-else' }));
    assert.equal(await page.getByRole('dialog', { name: '加状态' }).count(), 0);
    await page.evaluate(() => window.__command({ kind: 'status', personId: 'socket-me' }));
    await page.getByRole('button', { name: '吃饭去了', exact: true }).click();
    await page.getByRole('button', { name: '发布状态' }).click();
    await page.waitForFunction(() => document.querySelector('output').textContent.includes('吃饭去了'));
    await page.waitForFunction(() => window.__published?.people[0]?.status === '吃饭去了');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('output').textContent.includes('吃饭去了'));
    await page.getByRole('button', { name: '加状态', exact: true }).click();
    await page.getByRole('textbox').fill('周五前准备好报销文件');
    fail = true;
    await page.getByRole('button', { name: '发布状态' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByRole('textbox').inputValue(), '周五前准备好报销文件');
    await page.screenshot({ path: resolve('../Build/presence-status-editor.png') });
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await page.evaluate(() => window.__command({ kind: 'status-clear', personId: 'somebody-else' }));
    assert.ok((await page.locator('output').textContent()).includes('吃饭去了'));
    await Promise.all([
      page.waitForResponse(r => r.url().endsWith('/api/presence-status') && r.request().method() === 'POST'),
      page.evaluate(() => window.__command({ kind: 'status-clear', personId: 'socket-me' })),
    ]);
    await page.waitForFunction(() => window.__published?.statusControl?.error === '状态未能保存，请重试');
    assert.equal(await page.getByRole('dialog', { name: '加状态' }).count(), 0);
    assert.ok((await page.locator('output').textContent()).includes('吃饭去了'));
    fail = false;
    await page.evaluate(() => window.__command({ kind: 'status-clear', personId: 'socket-me' }));
    await page.waitForFunction(() => document.querySelector('output').textContent === '{}');
    assert.equal(await page.getByRole('dialog', { name: '加状态' }).count(), 0);
    assert.deepEqual(errors, []);
    hang = true;
    await page.getByRole('button', { name: '加状态', exact: true }).click();
    await page.getByRole('textbox').fill('保存卡住也能退出');
    await page.getByRole('button', { name: '发布状态' }).click();
    await page.getByRole('button', { name: '保存中…' }).waitFor();
    await page.getByRole('button', { name: '关闭状态编辑' }).click();
    await page.getByRole('dialog', { name: '加状态' }).waitFor({ state: 'detached' });
    await page.waitForFunction(() => window.__published?.statusControl?.error === '保存超时，请检查网络后重试', null, { timeout: 12000 });
    await page.getByRole('button', { name: '加状态', exact: true }).click();
    assert.equal(await page.getByRole('textbox').isEnabled(), true, 'timeout releases the editor');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog', { name: '加状态' }).waitFor({ state: 'detached' });
    console.log('PASS: own click/right-click, status command, bubbles, editor persistence/failure/clear');
  } finally { await browser.close(); await vite.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
