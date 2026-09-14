const { chromium } = require("./playwright.cjs");
const { io } = require('socket.io-client');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const BASE = 'http://127.0.0.1:3200';
const BUILD = 'Build/OfficeWebPrivateCallCheck';
const html = fs.readFileSync(BUILD + '/index.html', 'utf8');
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match => match[1]);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'] });
  const evidence = { checks: [], errors: [], samples: [], hashes: {}, input: 'synthetic permissions/track loss; real UI and SFU' };
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
      for (const asset of assets) {
        const remote = await context.request.get('https://115.159.43.237' + asset);
        assert.equal(remote.status(), 200);
        const actual = createHash('sha256').update(await remote.body()).digest('hex');
        assert.equal(actual, createHash('sha256').update(fs.readFileSync(BUILD + asset)).digest('hex'));
        evidence.hashes[asset] = actual;
      }
      await context.addInitScript(() => {
        window.__pcs = [];
        const PC = window.RTCPeerConnection;
        window.RTCPeerConnection = class extends PC {
          constructor(...args) { super(...args); window.__pcs.push(this); }
        };
        window.__audio = async () => {
          const rows = [];
          for (const pc of window.__pcs) {
            if (pc.connectionState === 'closed') continue;
            for (const stat of (await pc.getStats()).values())
              if (stat.type === 'inbound-rtp' && stat.kind === 'audio')
                rows.push({ bytes: stat.bytesReceived, energy: stat.totalAudioEnergy || 0 });
          }
          return rows;
        };

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
    async function audio(page) {
      for (let attempt = 0; attempt < 120; attempt++) {
        const rows = await page.evaluate(() => window.__audio());
        if (rows.some(row => row.energy > 0 && row.bytes > 0)) {
          evidence.samples.push(rows); return;
        }
        await page.waitForTimeout(250);
      }
      throw Error('No inbound audio energy');
    }
    for (const direction of ['request', 'offer']) {
      await a.getByRole('button', { name: direction === 'request' ? '请求观看对方屏幕' : '分享我的屏幕给对方', exact: true }).click();
      await accept(b);
      const viewer = direction === 'request' ? a : b;
      await viewer.waitForFunction(() => [...document.querySelectorAll('.private-calls video')].some(video => video.videoWidth > 0), null, { timeout: 40000 });
      for (const page of pages) {
        await panel(page).getByText(/麦克风：已开启/).waitFor();
        await audio(page);
      }
      check(direction + ': deployed frontend receives screen and bidirectional audio');
      await panel(a).getByRole('button', { name: '挂断通话', exact: true }).click();
      for (const page of pages) await panel(page).waitFor({ state: 'hidden' });
      const sharer = direction === 'request' ? b : a;
      await sharer.getByLabel('我的共享预览').waitFor({state:'hidden'});
    }
    assert.deepEqual(evidence.errors, []);
    check('both directions hang up and stop private capture without page errors');
  } finally {
    fs.writeFileSync('Build/private-deployed-smoke-evidence.json', JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
