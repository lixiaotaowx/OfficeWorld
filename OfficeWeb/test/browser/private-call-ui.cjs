const { chromium } = require("./playwright.cjs");
const { io } = require('socket.io-client');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const BASE = 'http://127.0.0.1:3200';
const BUILD = 'Build/OfficeWebPrivateCallCheck';
const html = fs.readFileSync(BUILD + '/index.html', 'utf8');
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'] });
  const evidence = { checks: [], errors: [], input: 'synthetic permissions/track loss; real UI and SFU' };
  const check = name => { console.log('PASS', name); evidence.checks.push(name); };
  try {
    const pages = [], names = ['PrivateUI-A-20260913', 'PrivateUI-B-20260913'];
    for (const name of names) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      const options = { headers: { origin: BASE }, data: { name, password: 'qa' } };
      let response = await context.request.post(BASE + '/api/auth/login', options);
      if (response.status() === 401) response = await context.request.post(BASE + '/api/auth/register', options);
      assert.equal(response.status(), 200);
      const cookies = await context.cookies(BASE);
      await new Promise((resolve, reject) => {
        const socket = io(BASE, { transports: ['websocket'], extraHeaders: { origin: BASE,
          cookie: cookies.map(cookie => cookie.name + '=' + cookie.value).join('; ') } });
        const timer = setTimeout(() => { socket.disconnect(); reject(Error('seat setup timeout')); }, 10000);
        socket.on('connect', () => socket.emit('join', {}));
        socket.once('seats', seats => {
          const mine = seats.findIndex(seat => seat?.name === name);
          socket.emit('seat', mine >= 0 ? mine : seats.findIndex(seat => !seat), reply => {
            clearTimeout(timer); socket.disconnect(); reply.ok ? resolve() : reject(Error(reply.error));
          });
        });
      });
      await context.addInitScript(() => {
        window.__denyMic = false; window.__denyScreen = false; window.__holdScreen = false;
        window.__captures = []; window.__microphones = [];
        navigator.mediaDevices.getUserMedia = async () => {
          if (window.__denyMic) throw new DOMException('denied in test', 'NotAllowedError');
          const ctx = new AudioContext(); await ctx.resume();
          const oscillator = ctx.createOscillator(), gain = ctx.createGain(), dest = ctx.createMediaStreamDestination();
          gain.gain.value = .1; oscillator.connect(gain).connect(dest); oscillator.start();
          window.__microphones.push(dest.stream); return dest.stream;
        };
        navigator.mediaDevices.getDisplayMedia = async () => {
          if (window.__denyScreen) throw new DOMException('chooser cancelled in test', 'NotAllowedError');
          if (window.__holdScreen) await new Promise(resolve => { window.__resolveScreen = resolve; });
          const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 600;
          const ctx = canvas.getContext('2d');
          setInterval(() => { ctx.fillStyle = '#306547'; ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = 'white'; ctx.font = '30px sans-serif'; ctx.fillText(Date.now(), 20, 100); }, 100);
          const stream = canvas.captureStream(12); window.__captures.push(stream); return stream;
        };
      });
      await context.route(BASE + '/', route => route.fulfill({ body: html, contentType: 'text/html' }));
      for (const asset of assets) await context.route(BASE + asset, route => route.fulfill({
        path: BUILD + asset, contentType: asset.endsWith('.css') ? 'text/css' : 'text/javascript',
      }));
      const page = await context.newPage(); page.on('pageerror', error => evidence.errors.push(error.message));
      await page.goto(BASE); pages.push(page);
    }
    const [a, b] = pages;
    await a.getByRole('button', { name: new RegExp(names[1]) }).click();
    await b.getByRole('button', { name: new RegExp(names[0]) }).click();
    const panel = page => page.locator('.private-calls');
    const accept = page => page.getByRole('button', { name: '同意并接通', exact: true }).click();
    await b.evaluate(() => { window.__denyScreen = true; });
    await a.getByRole('button', { name: '请求观看对方屏幕', exact: true }).click();
    await accept(b);
    await b.getByText('未授权屏幕共享，已拒绝请求', { exact: false }).waitFor();
    await panel(a).waitFor({ state: 'hidden' });
    assert.equal(await b.locator('.sharing-preview').count(), 0);
    check('cancel screen selection rejects invitation without false sharing state');

    await a.evaluate(() => { window.__denyScreen = true; });
    await a.getByRole('button', { name: '分享我的屏幕给对方', exact: true }).click();
    await a.getByText('未授权屏幕共享，邀请未发送', { exact: false }).waitFor();
    assert.equal(await panel(a).count(), 0);
    await a.evaluate(() => { window.__denyScreen = false; });
    check('offer chooser denial sends no invitation');
    await b.evaluate(() => { window.__denyScreen = false; window.__holdScreen = true; });
    await a.getByRole('button', { name: '请求观看对方屏幕', exact: true }).click();
    await accept(b);
    await b.waitForFunction(() => typeof window.__resolveScreen === 'function');
    await a.getByRole('button', { name: '取消请求', exact: true }).click();
    await b.evaluate(() => { window.__holdScreen = false; window.__resolveScreen(); });
    await b.waitForFunction(() => window.__captures.length > 0 && window.__captures.at(-1).getTracks().every(track => track.readyState === 'ended'));
    assert.equal(await b.locator('.sharing-preview').count(), 0);
    await panel(b).waitFor({ state: 'hidden' });
    check('invite cancelled during pending chooser stops late capture and creates no call');

    await a.evaluate(() => { window.__denyMic = true; });
    await b.getByRole('button', { name: '分享我的屏幕给对方', exact: true }).click();
    await a.getByRole('heading', { name: /看屏幕并语音通话/ }).waitFor();
    await accept(a);
    await a.waitForFunction(() => [...document.querySelectorAll('.private-calls video')].some(video => video.videoWidth > 0), null, { timeout: 40000 });
    await panel(a).getByText(/麦克风：等待授权或开启失败/).waitFor();
    assert.equal(await panel(a).getByRole('button', { name: '开启或重试麦克风' }).isEnabled(), true);
    await a.screenshot({ path: 'Build/private-ui-mic-denied.png' });
    check('accepted offer displays video, microphone failure and enabled retry control');
    await a.evaluate(() => { window.__denyMic = false; });
    await panel(a).getByRole('button', { name: '开启或重试麦克风' }).click();
    await panel(a).getByText(/麦克风：已开启/).waitFor();
    await panel(a).getByRole('button', { name: '静音', exact: true }).click();
    await panel(a).getByText(/麦克风：已静音/).waitFor();
    await panel(a).getByRole('button', { name: '开启或重试麦克风' }).click();
    await panel(a).getByText(/麦克风：已开启/).waitFor();
    check('retry and mute buttons follow actual published microphone state');

    await panel(b).getByRole('button', { name: '停止屏幕，保留语音' }).click();
    await panel(a).getByText(/当前仅语音/).waitFor();
    assert.equal(await panel(a).locator('video').count(), 0);
    await panel(a).getByText(/麦克风：已开启/).waitFor();
    await a.screenshot({ path: 'Build/private-ui-voice-remains.png' });
    check('stop-screen UI explicitly keeps voice alive');
    await panel(a).getByRole('button', { name: '挂断通话' }).click();
    for (const page of pages) await panel(page).waitFor({ state: 'hidden' });
    check('hangup clears both call panels');
    await b.getByRole('button', { name: '共享屏幕', exact: true }).click();
    await b.getByRole('button', { name: '停止共享', exact: true }).waitFor();
    assert.equal(await b.getByLabel('我的共享预览').count(), 0);
    const originalTrack = await b.evaluate(() => window.__captures.at(-1).getVideoTracks()[0].id);
    await a.getByRole('button', { name: '请求观看对方屏幕', exact: true }).click();
    await b.getByRole('button', { name: '暂时不方便', exact: true }).click();
    await panel(a).waitFor({ state: 'hidden' });
    assert.equal(await b.evaluate(() => window.__captures.at(-1).active), true);
    await a.getByRole('button', { name: '请求观看对方屏幕', exact: true }).click();
    await a.getByRole('button', { name: '取消请求', exact: true }).click();
    await b.getByRole('button', { name: '同意并接通', exact: true }).waitFor({ state: 'hidden' });
    assert.equal(await b.evaluate(() => window.__captures.at(-1).getVideoTracks()[0].id), originalTrack);
    assert.equal(await b.evaluate(() => window.__captures.at(-1).active), true);
    await a.getByRole('button', { name: '请求观看对方屏幕', exact: true }).click();
    await accept(b);
    await a.waitForFunction(() => [...document.querySelectorAll('.private-calls video')].some(video => video.videoWidth > 0));
    await panel(a).getByRole('button', { name: '挂断通话' }).click();
    await panel(b).waitFor({ state: 'hidden' });
    assert.equal(await b.evaluate(() => window.__captures.at(-1).getVideoTracks()[0].id), originalTrack);
    assert.equal(await b.evaluate(() => window.__captures.at(-1).active), true);
    assert.equal(await b.getByLabel('我的共享预览').count(), 0);
    await b.getByRole('button', { name: '停止共享', exact: true }).click();
    check('reject/cancel and hanging up a viewer preserve the pre-existing public capture instance');
    assert.deepEqual(evidence.errors, []);
  } finally {
    fs.writeFileSync('Build/private-call-ui-evidence.json', JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
