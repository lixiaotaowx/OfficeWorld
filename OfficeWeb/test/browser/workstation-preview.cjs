const { chromium } = require("./playwright.cjs");
const { io } = require('socket.io-client');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');

(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve('OfficeWeb/server.mjs')));
  const build = path.resolve(process.env.PREVIEW_BUILD || 'Build/OfficeWebPreviewRelease');
  const dir = fs.mkdtempSync(path.resolve('Build/preview-qa-'));
  const server = createOfficeServer({ statePath: dir + '/state.json',
    accountsPath: dir + '/accounts.json', chatPath: dir + '/chat', secureCookies: false });
  await new Promise(resolve => server.http.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.http.address().port;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const frames = [], errors = [];
  server.io.on('connection', socket => socket.on('preview', () => frames.push(Date.now())));
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const response = await context.request.post(base + '/api/auth/register', {
      headers: { origin: base }, data: { name: '工位预览测试', password: 'qa' },
    });
    assert.equal(response.status(), 200);
    const cookies = await context.cookies(base);
    await new Promise((resolve, reject) => {
      const socket = io(base, { transports: ['websocket'], extraHeaders: { origin: base,
        cookie: cookies.map(c => c.name + '=' + c.value).join('; ') } });
      socket.on('connect', () => socket.emit('join', {}));
      socket.once('seats', () => socket.emit('seat', 0, result => {
        socket.disconnect(); result.ok ? resolve() : reject(Error(result.error));
      }));
    });
    await context.route(base + '/**', async route => {
      const url = new URL(route.request().url());
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) return route.continue();
      const file = path.join(build, url.pathname === '/' ? 'index.html' : url.pathname);
      if (!fs.existsSync(file)) return route.continue();
      await route.fulfill({ path: file });
    });
    await context.addInitScript(() => {
      window.__micRequests = 0;
      navigator.mediaDevices.getUserMedia = async () => {
        window.__micRequests++; throw Error('preview must not request microphone');
      };
      navigator.mediaDevices.getDisplayMedia = async () => {
        const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#de5020'; ctx.fillRect(0, 0, 800, 600);
        const timer = setInterval(() => ctx.fillRect(0, 0, 800, 600), 100);
        window.__capture = canvas.captureStream(10);
        window.__capture.getVideoTracks()[0].addEventListener('ended', () => clearInterval(timer));
        return window.__capture;
      };
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/?debug=1');
    await page.getByRole('button', { name: '共享屏幕', exact: true }).click();
    await page.getByRole('button', { name: '停止共享', exact: true }).waitFor();
    await page.waitForFunction(() => window.__officeDebug?.monitors?.previewInfo(0)?.hasPreview,
      null, { timeout: 60000 });
    assert.equal(await page.getByLabel('我的共享预览').count(), 0);
    assert.equal(await page.evaluate(() => window.__micRequests), 0);
    while (frames.length < 3) await new Promise(resolve => setTimeout(resolve, 500));
    const intervals = frames.slice(1).map((time, i) => time - frames[i]);
    assert(intervals.every(ms => ms >= 2700 && ms <= 4500), JSON.stringify(intervals));
    const info = await page.evaluate(() => window.__officeDebug.monitors.previewInfo(0));
    const power = {};
    if (process.env.CHECK_SCENE_POWER) {
      const stats = () => page.evaluate(() => window.__officeDebug.rendering);
      await page.waitForFunction(() => window.__officeDebug.rendering.mode === 'idle');
      let before = await stats(); await page.waitForTimeout(2000);
      power.idleFramesInTwoSeconds = (await stats()).renderedFrames - before.renderedFrames;
      assert(power.idleFramesInTwoSeconds >= 12 && power.idleFramesInTwoSeconds <= 24);
      await page.getByRole('button', { name: '设置', exact: true }).click();
      await page.getByLabel('暂停三维画面（语音、共享和聊天继续）').check();
      await page.getByRole('button', { name: '关闭', exact: true }).click();
      before = await stats(); const previewCount = frames.length;
      await page.waitForTimeout(3400);
      power.pausedFrames = (await stats()).renderedFrames - before.renderedFrames;
      assert.equal(power.pausedFrames, 0); assert(frames.length > previewCount);
      assert((await stats()).simulationSteps > before.simulationSteps);
      assert.equal(await page.evaluate(() => window.__capture.active), true);
      await page.screenshot({ path: 'Build/scene-paused-preview-running.png' });
      await page.getByRole('button', { name: '恢复三维画面' }).click();
      await page.waitForFunction(count => window.__officeDebug.rendering.renderedFrames > count,
        before.renderedFrames);
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      before = await stats(); await page.waitForTimeout(1500);
      power.simulatedHiddenFrames = (await stats()).renderedFrames - before.renderedFrames;
      assert.equal(power.simulatedHiddenFrames, 0);
      await page.evaluate(() => {
        delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.waitForFunction(count => window.__officeDebug.rendering.renderedFrames > count,
        before.renderedFrames);
      power.resumed = true;
    }
    await page.screenshot({ path: 'Build/workstation-preview-only.png' });
    await page.getByRole('button', { name: '停止共享', exact: true }).click();
    await page.waitForFunction(() => !window.__capture.active);
    assert.deepEqual(errors, []);
    fs.writeFileSync('Build/workstation-preview-evidence.json', JSON.stringify({ intervals, info,
      floatingPreview: false, microphoneRequests: 0, captureStopped: true, power, errors }, null, 2));
    console.log('PASS: self monitor preview, 3-second cadence, no floating window/microphone, stop cleanup');
  } finally {
    await browser.close(); await new Promise(resolve => server.io.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
