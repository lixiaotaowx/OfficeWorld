// Real Electron window, native tray and synthetic WebRTC; no user accounts/devices.
const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const appRoot = process.env.OFFICE_DESKTOP_TEST_APP || path.resolve(__dirname, '..');
const { installTray } = require(path.join(appRoot, 'tray.cjs'));
const { applyWindowIcon } = require(path.join(appRoot, 'window-icon.cjs'));
const iconPath = path.join(appRoot, 'assets', 'icon.ico');
const output = path.resolve(__dirname, '../../Build/DesktopTrayQA');
fs.mkdirSync(output, { recursive: true });
app.setPath('userData', path.join(output, 'profile'));
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const report = { checks: [] };
let tray;
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 500, height: 400,
    icon: iconPath,
    webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
  applyWindowIcon(win, iconPath);
  assert.deepEqual(fs.readFileSync(path.join(app.getPath('userData'), 'iruler-dream.ico')), fs.readFileSync(iconPath));
  report.checks.push({ stableShellIconMatchesSource: true });
  tray = installTray(win, iconPath);
  await win.loadURL('data:text/html,<title>Tray integration</title><h1>Tray integration</h1>');
  await win.webContents.executeJavaScript(`(async () => {
    window.ticks = 0;
    setInterval(() => window.ticks++, 250);
    const audio = new AudioContext();
    await audio.resume();
    const oscillator = audio.createOscillator(), destination = audio.createMediaStreamDestination();
    oscillator.connect(destination); oscillator.start();
    const canvas = document.createElement('canvas'); canvas.width=320; canvas.height=180;
    const paint = canvas.getContext('2d');
    setInterval(() => { paint.fillStyle = ticks % 2 ? 'green' : 'blue'; paint.fillRect(0,0,320,180); },100);
    window.sender = new RTCPeerConnection(); window.receiver = new RTCPeerConnection();
    sender.onicecandidate = e => e.candidate && receiver.addIceCandidate(e.candidate);
    receiver.onicecandidate = e => e.candidate && sender.addIceCandidate(e.candidate);
    for(const track of [...destination.stream.getTracks(), ...canvas.captureStream(10).getTracks()]) sender.addTrack(track);
    await sender.setLocalDescription(await sender.createOffer());
    await receiver.setRemoteDescription(sender.localDescription);
    await receiver.setLocalDescription(await receiver.createAnswer());
    await sender.setRemoteDescription(receiver.localDescription);
    window.mediaStats = async () => {
      const stats = await receiver.getStats(), bytes = {};
      stats.forEach(s => { if(s.type === 'inbound-rtp') bytes[s.kind] = s.bytesReceived; });
      return {state:receiver.connectionState, bytes, ticks};
    };
  })()`);
  await wait(1500);
  const before = await win.webContents.executeJavaScript('mediaStats()');
  const contentsId = win.webContents.id;
  // Consume Windows STARTUPINFO's initial hidden-show override from the test runner.
  win.show();
  await wait(100);
  win.hide();
  tray.show();
  await wait(100);
  assert.equal(win.isVisible(), true);
  win.close();
  assert.equal(win.isDestroyed(), false);
  assert.equal(win.isVisible(), false);
  await wait(2500);
  const after = await win.webContents.executeJavaScript('mediaStats()');
  assert.equal(win.webContents.id, contentsId);
  assert.equal(after.state, 'connected');
  assert.ok(after.bytes.audio > before.bytes.audio, 'audio continues hidden');
  assert.ok(after.bytes.video > before.bytes.video, 'synthetic screen continues hidden');
  assert.ok(after.ticks > before.ticks, 'renderer stays alive');
  report.checks.push({ closeHides: true, sameWebContents: true, before, after });
  // Look the rows up by label: the tray menu also carries the launch-at-sign-in
  // checkbox, so a hard-coded index would silently click the wrong row.
  const openItem = tray.menu.items.find(item => item.label === '打开 iruler dream');
  const quitItem = tray.menu.items.find(item => item.label === '退出 iruler dream');
  assert.ok(openItem && quitItem, 'tray menu keeps its open and quit rows');
  tray.tray.emit('click');
  await wait(100);
  assert.equal(win.isVisible(), true);
  win.close();
  openItem.click();
  await wait(100);
  assert.equal(win.isVisible(), true);
  report.checks.push({ trayClickRestores: true, menuRestores: true });
  app.once('will-quit', () => {
    assert.equal(win.isDestroyed(), true);
    assert.equal(tray.tray.isDestroyed(), true);
    report.checks.push({ explicitQuitDestroysWindowAndTray: true });
    fs.writeFileSync(path.join(output, 'integration.json'), JSON.stringify(report, null, 2));
  });
  quitItem.click();
}).catch(error => {
  fs.writeFileSync(path.join(output, 'failure.txt'), error.stack);
  app.exit(1);
});
setTimeout(() => app.exit(2), 20000).unref();
