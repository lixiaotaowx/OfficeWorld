const { chromium } = require("./playwright.cjs");
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { io } = require('socket.io-client');

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve('OfficeWeb/server.mjs')));
  const dir = fs.mkdtempSync(path.resolve('Build/desktop-auto-qa-'));
  const build = path.resolve(process.env.OFFICE_QA_BUILD || 'Build/OfficeWebDesktopAutoQA');
  const server = createOfficeServer({ statePath: dir + '/state.json', accountsPath: dir + '/accounts.json', secureCookies: false });
  await new Promise(resolve => server.http.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.http.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [], checks = [], captures = [];
  let saved = { name: '自动预览测试', password: '1' }, failMe = true, meCalls = 0, logins = 0;
  try {
    const context = await browser.newContext({ viewport: { width: 1360, height: 960 } });
    const registration = await context.request.post(base + '/api/auth/register', {
      headers: { Origin: base }, data: saved });
    assert.equal(registration.status(), 200);
    const cookie = (await context.cookies()).map(c => c.name + '=' + c.value).join('; ');
    const socket = io(base, { transports: ['websocket'], extraHeaders: { Cookie: cookie, Origin: base } });
    await new Promise((resolve, reject) => {
      socket.once('connect', resolve); socket.once('connect_error', reject);
    });
    socket.emit('join', { name: saved.name });
    await new Promise(resolve => socket.once('people', resolve));
    assert.equal((await socket.emitWithAck('seat', 0)).ok, true);
    socket.disconnect();
    await context.clearCookies();
    await context.exposeBinding('qaRead', () => saved);
    await context.exposeBinding('qaSave', (_source, value) => { saved = value; return true; });
    await context.exposeBinding('qaClear', () => { saved = null; return true; });
    await context.exposeBinding('qaCapture', (_source, id) => { captures.push({ id, time: Date.now() }); });
    await context.addInitScript(() => {
      let selected = sessionStorage.getItem('qa-display') || '1';
      window.officeDesktop = {
        readLogin: () => window.qaRead(), saveLogin: value => window.qaSave(value), clearLogin: () => window.qaClear(),
        displays: async () => ['1', '2'].map(id => ({ id, name: '屏幕 ' + id,
          width: 1920, height: 1080, selected: id === selected })),
        selectDisplay: async id => { selected = id; sessionStorage.setItem('qa-display', id); return true; },
        previewFrame: async () => {
          await window.qaCapture(selected);
          const c = document.createElement('canvas'); c.width = 480; c.height = 270;
          const x = c.getContext('2d'); x.fillStyle = selected === '1' ? '#388c44' : '#c35399';
          x.fillRect(0, 0, 480, 270); x.fillStyle = 'white'; x.fillText(Date.now(), 20, 30);
          return c.toDataURL('image/jpeg', .55);
        },
      };
      navigator.mediaDevices.getDisplayMedia = async () => { throw Error('Unexpected picker'); };
      navigator.mediaDevices.getUserMedia = async () => { throw Error('Unexpected microphone'); };
    });
    await context.route(base + '/**', async route => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/api/auth/me') {
        meCalls++;
        if (failMe) { failMe = false; return route.fulfill({ status: 503, body: '{}' }); }
      }
      if (pathname === '/api/auth/login') logins++;
      if (pathname.startsWith('/api/') || pathname.startsWith('/socket.io/')) return route.continue();
      const file = path.join(build, pathname === '/' ? 'index.html' : pathname);
      if (fs.existsSync(file)) return route.fulfill({ path: file });
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/?debug=1');
    await page.getByText(/5 秒后自动重试/).waitFor();
    await page.getByRole('button', { name: '他人工位预览：开', exact: true }).waitFor({ timeout: 25000 });
    assert.ok(meCalls >= 2); assert.equal(logins, 1);
    await page.waitForFunction(() => window.__officeDebug?.monitors?.meshFor(0));
    await page.waitForTimeout(6500);
    assert.ok(captures.length >= 3);
    assert.ok(captures[1].time - captures[0].time >= 2900);
    const shown = await page.evaluate(() => window.__officeDebug.monitors.slots.get(0).shown);
    assert.ok(shown?.startsWith('data:image/jpeg;base64,'));
    assert.equal(await page.locator('.sharing-preview').count(), 0);
    checks.push('transient login failure retries; saved login restores; native 3-second frames reach own 3D monitor without picker/audio/floating window');
    const peerContext = await browser.newContext();
    await peerContext.request.post(base + '/api/auth/register', {
      headers: { Origin: base }, data: { name: '预览接收测试', password: '1' } });
    const peerCookie = (await peerContext.cookies()).map(c => c.name + '=' + c.value).join('; ');
    const peer = io(base, { transports: ['websocket'], extraHeaders: { Cookie: peerCookie, Origin: base } });
    await new Promise(resolve => peer.once('connect', resolve));
    peer.emit('join', { name: '预览接收测试' });
    await new Promise(resolve => peer.once('people', resolve));
    await peer.emitWithAck('seat', 1);
    peer.emit('ambient-sharing', true);
    let ownRelays = 0;
    peer.on('preview', value => { if (value.id !== peer.id && value.image) ownRelays++; });
    const frame = await page.evaluate(() => window.officeDesktop.previewFrame());
    peer.emit('preview', frame);
    await page.waitForFunction(() => window.__officeDebug.monitors.slots.get(1).shown);
    await page.getByRole('button', { name: '他人工位预览：开', exact: true }).click();
    await page.getByRole('button', { name: '他人工位预览：关', exact: true }).waitFor();
    await page.waitForFunction(() => !window.__officeDebug.monitors.slots.get(1).shown);
    const before = captures.length;
    await page.waitForTimeout(3300);
    peer.emit('preview', frame);
    await page.waitForTimeout(500);
    assert.ok(captures.length > before && ownRelays > 0);
    assert.ok(await page.evaluate(() => window.__officeDebug.monitors.slots.get(0).shown));
    assert.equal(await page.evaluate(() => window.__officeDebug.monitors.slots.get(1).shown), null);
    await page.getByRole('button', { name: '他人工位预览：关', exact: true }).click();
    await page.waitForTimeout(500);
    peer.emit('preview', frame);
    await page.waitForFunction(() => window.__officeDebug.monitors.slots.get(1).shown);
    peer.disconnect(); await peerContext.close();
    checks.push('receive toggle clears other monitors, preserves own capture/display/upload, and resumes receiving');
    async function pointAtSeat(index) {
      await page.locator('.seat-grid .seat').nth(index).click();
      await page.waitForTimeout(2800);
      return page.evaluate(index => {
        const d = window.__officeDebug, mesh = d.monitors.meshFor(index);
        const v = mesh.getWorldPosition(mesh.position.clone()).project(d.__camera);
        const r = document.querySelector('.scene').getBoundingClientRect();
        return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
      }, index);
    }
    let p = await pointAtSeat(0);
    await page.mouse.click(p.x, p.y, { button: 'right' });
    await page.getByRole('menu', { name: '工位预览屏幕' }).waitFor();
    await page.screenshot({ path: path.resolve('Build/desktop-screen-menu.png') });
    await page.getByRole('menuitemradio', { name: /屏幕 2/ }).click();
    await page.waitForTimeout(3500);
    assert.equal(captures.at(-1).id, '2');
    p = await pointAtSeat(1);
    await page.mouse.click(p.x, p.y, { button: 'right' });
    assert.equal(await page.getByRole('menu').count(), 0);
    p = await pointAtSeat(0);
    await page.mouse.move(p.x, p.y); await page.mouse.down({ button: 'right' });
    await page.mouse.move(p.x + 25, p.y + 10); await page.mouse.up({ button: 'right' });
    assert.equal(await page.getByRole('menu').count(), 0);
    checks.push('own monitor right-click switches display; other monitor and right drag cannot open menu');
    assert.equal(await page.getByRole('button', { name: '暂停工位预览', exact: true }).count(), 0);
    assert.equal(await page.locator('.bottom-bar').getByRole('button', { name: /麦克风/ }).count(), 0);
    await page.reload();
    await page.getByRole('button', { name: '他人工位预览：开', exact: true }).waitFor();
    assert.equal(logins, 1);
    assert.equal(captures.at(-1).id, '2');
    checks.push('no pause or microphone buttons in bottom bar; reload restores selection without a new login');
    await page.getByRole('button', { name: '退出登录', exact: true }).first().click();
    await page.getByLabel('姓名', { exact: true }).waitFor();
    assert.equal(saved, null);
    const loggedOutCaptures = captures.length;
    await page.waitForTimeout(3500); assert.equal(captures.length, loggedOutCaptures);
    await page.getByLabel('姓名', { exact: true }).fill('自动预览测试');
    await page.getByLabel('密码', { exact: true }).fill('1');
    await page.getByRole('button', { name: '进入办公室 →' }).click();
    await page.getByRole('button', { name: '他人工位预览：开', exact: true }).waitFor();
    assert.equal(saved.name, '自动预览测试');
    checks.push('explicit logout clears saved login and stops preview; successful manual login saves it again');
    assert.deepEqual(errors, []);
  } finally {
    fs.writeFileSync(path.resolve('Build/desktop-auto-browser.json'), JSON.stringify({ checks, errors, captures: captures.length }, null, 2));
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
