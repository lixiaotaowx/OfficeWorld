const { chromium } = require("./playwright.cjs");
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve('OfficeWeb/server.mjs')));
  const dir = fs.mkdtempSync(path.resolve('Build/chat-threads-qa-'));
  const build = path.resolve('Build/OfficeWebChatThreadsRelease');
  const server = createOfficeServer({ statePath: dir + '/state.json', accountsPath: dir + '/accounts.json', secureCookies: false });
  await new Promise(resolve => server.http.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.http.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [], checks = [];
  try {
    const contexts = [], pages = [];
    for (const name of ['林晓', '陈安', '许宁']) {
      const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
      contexts.push(context);
      const response = await context.request.post(base + '/api/auth/register', {
        headers: { Origin: base }, data: { name, password: '1' } });
      assert.equal(response.status(), 200);
      await context.route(base + '/**', async route => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname.startsWith('/api/') || pathname.startsWith('/socket.io/')) return route.continue();
        const file = path.join(build, pathname === '/' ? 'index.html' : pathname);
        if (fs.existsSync(file)) return route.fulfill({ path: file });
        return route.continue();
      });
      const page = await context.newPage(); pages.push(page);
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.getByRole('button', { name: '确认', exact: true }).click();
      await page.getByRole('button', { name: '空间聊天', exact: true }).click();
    }
    const [a, b, c] = pages;
    await a.getByRole('button', { name: /^打开公共聊天/ }).click();
    await a.getByRole('textbox', { name: '聊天消息' }).fill('大家早上好');
    await a.getByRole('button', { name: '发送', exact: true }).click();
    await a.getByText('大家早上好', { exact: true }).waitFor();
    await a.getByRole('textbox', { name: '聊天消息' }).fill('公共草稿保留');
    await a.getByRole('button', { name: '返回会话列表' }).click();
    // Contact synchronization is periodic; opening other pages may have happened later.
    await a.getByRole('button', { name: /^打开陈安的私聊/ }).waitFor({ timeout: 40000 });
    await a.getByRole('button', { name: /^打开陈安的私聊/ }).click();
    await a.getByRole('textbox', { name: '聊天消息' }).fill('这是我们两人的讨论');
    await a.getByRole('button', { name: '发送', exact: true }).click();
    await a.getByText('这是我们两人的讨论', { exact: true }).waitFor();
    await b.getByRole('button', { name: /打开林晓的私聊，1条未读/ }).waitFor();
    await b.getByRole('button', { name: /^打开林晓的私聊/ }).click();
    await b.getByText('这是我们两人的讨论', { exact: true }).waitFor();
    await b.getByRole('textbox', { name: '聊天消息' }).fill('收到，只回复给你');
    await b.getByRole('button', { name: '发送', exact: true }).click();
    await a.getByText('收到，只回复给你', { exact: true }).waitFor();
    await a.getByLabel('选择图片或文件').setInputFiles({ name: '讨论.txt', mimeType: 'text/plain', buffer: Buffer.from('private attachment') });
    await a.getByRole('button', { name: '发送文件', exact: true }).click();
    await b.getByText('讨论.txt', { exact: true }).waitFor();
    await c.getByRole('button', { name: /^打开公共聊天/ }).click();
    await c.getByText('大家早上好', { exact: true }).waitFor();
    assert.equal(await c.getByText('这是我们两人的讨论', { exact: true }).count(), 0);
    assert.equal(await c.getByText('讨论.txt', { exact: true }).count(), 0);
    checks.push('public broadcast; private replies/unread/files only in private conversation');
    await a.screenshot({ path: path.resolve('Build/chat-private-desktop.png') });
    await a.getByRole('button', { name: '返回会话列表' }).click();
    await a.getByRole('button', { name: /^打开公共聊天/ }).click();
    assert.equal(await a.getByRole('textbox', { name: '聊天消息' }).inputValue(), '公共草稿保留');
    checks.push('return navigation preserves per-conversation draft');
    await b.getByRole('button', { name: '返回会话列表' }).click();
    await b.reload();
    await b.getByRole('button', { name: '空间聊天', exact: true }).click();
    await b.getByRole('button', { name: /^打开林晓的私聊/ }).waitFor();
    assert.ok(!(await b.getByRole('button', { name: /^打开林晓的私聊/ }).getAttribute('aria-label')).includes('未读'));
    await b.getByRole('button', { name: /^打开林晓的私聊/ }).click();
    await b.getByText('这是我们两人的讨论', { exact: true }).waitFor();
    checks.push('reload restores private history and read state');
    await b.getByRole('button', { name: '返回会话列表' }).click();
    await b.setViewportSize({ width: 390, height: 844 });
    await b.getByRole('textbox', { name: '搜索聊天会话' }).scrollIntoViewIfNeeded();
    await b.screenshot({ path: path.resolve('Build/chat-conversations-mobile.png'), fullPage: true });
    await b.getByRole('textbox', { name: '搜索聊天会话' }).fill('许宁');
    assert.equal(await b.getByRole('button', { name: /^打开许宁的私聊/ }).count(), 1);
    assert.equal(await b.getByRole('button', { name: /^打开林晓的私聊/ }).count(), 0);
    checks.push('mobile conversation list/search');
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.resolve('Build/chat-threads-browser.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log('PASS', checks);
  } finally { await browser.close(); await new Promise(resolve => server.io.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
