const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const {createServer: portServer} = require('node:net');
(async () => {
  const probe=portServer(); await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port; await new Promise(resolve=>probe.close(resolve));
  const vite = await createServer({ configFile: false, root: resolve('.'), plugins: [react()], server: { host: '127.0.0.1', port, strictPort:true } });
  await vite.listen();
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 540, height: 820 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/test/dock-meeting-harness.html`);
    await page.getByRole('button', { name: '同事乙', exact: true }).hover();
    await page.mouse.move(10, 10);
    await page.waitForTimeout(260);
    assert.equal(await page.locator('.dock-card').count(), 0, 'passing an avatar does not open a preview');
    await page.getByRole('button', { name: '同事乙', exact: true }).hover();
    await page.getByRole('button', { name: '发起会议', exact: true }).click();
    const picker = page.getByRole('dialog', { name: '发起会议', exact: true });
    await picker.waitFor();
    assert.equal(await picker.getByLabel('同事乙', { exact: true }).isChecked(), true);
    await picker.getByLabel('客户丙', { exact: true }).check();
    await picker.getByRole('button', { name: '创建会议并发送邀请' }).click();
    const action = await page.evaluate(() => window.__actions.at(-1));
    assert.equal(action[0], 'meeting-create');
    assert.deepEqual(action[2].invitees, ['account-b', 'account-c']);
    assert.equal(action[2].microphone, false);
    await page.screenshot({ path: resolve('../Build/dock-meeting-picker.png') });
    assert.equal(await page.locator('.dock-card').count(), 0, 'picker clears old avatar preview');
    await page.evaluate(() => window.__pushState({...window.__dockState,
      meeting:{...window.__dockState.meeting,active:true,id:'meeting-a',screens:[]}}));
    await page.waitForTimeout(300);
    assert.equal(await page.locator('.dock-card').count(), 0, 'create-to-active transition has no old screen flash');
    await page.evaluate(async () => {
      const { useDockMeetingVideo } = await import('/src/useDockMeetingVideo.ts');
      const React = await import('/node_modules/.vite/deps/react.js');
      const client = await import('/node_modules/.vite/deps/react-dom_client.js');
      const createRoot = client.createRoot || client.default.createRoot;
      window.officeDesktop = {
        dockVideo: async value => { window.__videoBytes += value.bytes?.byteLength || 0; window.__receiveVideo?.(value); return true; },
        onDockVideoWant: callback => { window.__sendVideo = callback; return () => { window.__sendVideo = undefined; }; },
      };
      const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360;
      const context = canvas.getContext('2d');
      let tick = 0;
      window.__paint = setInterval(() => {
        context.fillStyle = tick++ % 2 ? '#527864' : '#d4c5ac'; context.fillRect(0, 0, 640, 360);
        context.fillStyle = '#ffffff'; context.font = '42px sans-serif'; context.fillText('会议共享 ' + tick, 35, 190);
      }, 80);
      const stream = window.__sourceStream = canvas.captureStream(15);
      function Sender() { useDockMeetingVideo({ p1: stream }); return null; }
      const host = document.createElement('div'); document.body.append(host);
      window.__senderRoot = createRoot(host); window.__senderRoot.render((React.createElement || React.default.createElement)(Sender));
      await new Promise(resolve => setTimeout(resolve, 200));
      window.__pushState({ ...window.__dockState, meeting: { ...window.__dockState.meeting,
        active: true, title: '办公室讨论', mic: false, sharing: false,
        screens: [{ id: 'p1', name: '同事乙', streamId: stream.id }] } });
    });
    await page.waitForFunction(() => document.querySelector('.dock-meeting-video video')?.readyState >= 2, null, { timeout: 20000 });
    assert.equal(await page.locator('.dock-card').count(), 0, 'entering meeting never restores stale hover');
    const video = page.locator('.dock-meeting-video video');
    const first = await video.evaluate(e => ({ time: e.currentTime, frames: e.getVideoPlaybackQuality().totalVideoFrames }));
    await page.mouse.move(10, 10);
    await page.waitForTimeout(2200);
    const next = await video.evaluate(e => ({ time: e.currentTime, frames: e.getVideoPlaybackQuality().totalVideoFrames }));
    assert.ok(next.time > first.time && next.frames > first.frames + 5, '真实视频在鼠标离开后仍持续播放');
    assert.equal(await page.locator('.dock-share-bubble').count(), 1);
    assert.equal(await page.locator('.dock-share-bubble button').count(), 2, 'meeting picture has only maximize and fullscreen');
    const picture = await page.locator('.dock-share-picture').boundingBox();
    for (const button of await page.locator('.dock-share-picture button').all()) {
      const bounds = await button.boundingBox();
      assert.ok(bounds.x >= picture.x && bounds.y >= picture.y &&
        bounds.x + bounds.width <= picture.x + picture.width && bounds.y + bounds.height <= picture.y + picture.height);
    }
    assert.ok(await page.evaluate(() => window.__videoBytes > 0));
    await page.getByRole('button', { name: '屏幕分享', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__actions.at(-1)[0]), 'meeting-share');
    await page.getByRole('button', { name: '麦克风已静音，点击开启', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__actions.at(-1)[0]), 'meeting-mute');
    await page.getByRole('button', { name: '最大化 同事乙 的共享屏幕', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__actions.at(-1)[0]), 'meeting-view');
    await page.getByRole('button', { name: '全屏 同事乙 的共享屏幕', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__actions.at(-1)[0]), 'meeting-fullscreen');
    await page.screenshot({ path: resolve('../Build/dock-meeting-video.png') });
    const box = await page.locator('.dock-share-bubble').boundingBox();
    assert.ok(box.y >= 0 && box.x >= 0 && box.x + box.width <= 540);
    assert.ok(await page.evaluate(() => window.__layouts.at(-1).expanded));
    await page.evaluate(() => window.__pushState({ ...window.__dockState, meeting: { ...window.__dockState.meeting, active: false, screens: [] } }));
    await page.waitForFunction(() => !document.querySelector('.dock-share-bubble') && !document.querySelector('.dock-meeting-controls'));
    await page.evaluate(() => { window.__senderRoot.unmount(); clearInterval(window.__paint); });
    assert.equal(await page.evaluate(() => window.__sourceStream.getVideoTracks()[0].readyState), 'live', '退出预览不停止会议源轨道');
    assert.deepEqual(errors, []);
    console.log('PASS: member picker, shared commands, real encoded video playback, pinning, bounds, cleanup');
  } finally { await browser.close(); await vite.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
