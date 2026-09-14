const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const reply = await context.request.post('http://127.0.0.1:3198/api/auth/register', {
      headers: { origin: 'http://127.0.0.1:3198' },
      data: { name: '预览QA' + Date.now(), password: 'qa' },
    });
    assert.equal(reply.status(), 200);
    await context.addInitScript(() => {
      navigator.mediaDevices.getDisplayMedia = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 960; canvas.height = 540;
        const ctx = canvas.getContext('2d');
        const draw = () => {
          ctx.fillStyle = '#315e3e'; ctx.fillRect(0, 0, 960, 540);
          ctx.fillStyle = 'white'; ctx.font = '40px sans-serif';
          ctx.fillText('Office screen preview test', 60, 200);
          ctx.fillText(new Date().toISOString(), 60, 300);
        };
        draw(); const timer = setInterval(draw, 100);
        const stream = canvas.captureStream(10);
        const track = stream.getVideoTracks()[0];
        track.addEventListener('ended', () => clearInterval(timer));
        window.stopTestScreen = () => { track.stop(); track.dispatchEvent(new Event('ended')); };
        return stream;
      };
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5198');
    await page.getByRole('button', { name: '会议', exact: true }).click();
    await page.getByRole('button', { name: '创建会议并发送邀请' }).click();
    await page.getByText(/已连接会议/).waitFor({ timeout: 25000 });
    await page.getByRole('button', { name: '共享屏幕到会议', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('video[aria-label="我正在共享的屏幕"]')?.videoWidth > 0);
    assert.equal(await page.getByLabel('我正在共享的屏幕').evaluate(v => v.muted), true);
    await page.screenshot({ path: 'Build/Audit/meeting-self-preview.png' });
    await page.getByLabel('收起会议面板').click();
    await page.getByLabel('我的共享预览').waitFor();
    await page.getByLabel('收起共享预览').click();
    await page.getByLabel('展开共享预览').click();
    await page.getByRole('button', { name: '停止共享', exact: true }).click();
    await page.getByLabel('我的共享预览').waitFor({ state: 'detached' });
    await page.getByRole('button', { name: '会议进行中', exact: true }).click();
    await page.getByRole('button', { name: '共享屏幕到会议', exact: true }).click();
    await page.getByLabel('我正在共享的屏幕').waitFor();
    await page.evaluate(() => window.stopTestScreen());
    await page.getByLabel('我正在共享的屏幕').waitFor({ state: 'detached' });
    await page.getByRole('button', { name: '共享屏幕到会议', exact: true }).waitFor();
    await page.getByRole('button', { name: '结束会议', exact: true }).click();
    await page.getByRole('button', { name: '确认结束', exact: true }).click();
    console.log('PASS: live local video, muted preview, floating preview, collapse, stop, system-ended cleanup');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
