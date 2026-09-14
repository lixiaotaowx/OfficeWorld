const { app, BrowserWindow, session } = require('electron');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
app.setPath('userData', path.resolve(__dirname, '../../Build/notifications-integration-profile'));
app.setAppUserModelId('com.officeworld.desktop');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
const evidence = {};
const output = path.resolve(__dirname, '../../Build/notifications-integration.json');
app.whenReady().then(async () => {
  const ses = session.fromPartition('notifications-integration');
  await ses.protocol.handle('https', () => new Response('<h1>Notification fixture</h1>', { headers: { 'Content-Type': 'text/html' } }));
  const win = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true, contextIsolation: true } });
  require('../permissions.cjs').configurePermissions(ses, () => win);
  await win.loadURL('https://115.159.43.237/');
  evidence.result = await win.webContents.executeJavaScript(`(async()=>{
    const permission = await Notification.requestPermission();
    const audio = new AudioContext(); await audio.resume();
    const tone = audio.createOscillator(), gain = audio.createGain();
    tone.frequency.value = 660; gain.gain.value = .06;
    tone.connect(gain); gain.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .2);
    const notification = new Notification('Office World · 通知测试', { body: '来电与消息通知已就绪', silent: true });
    const shown = await new Promise(resolve => {
      notification.onshow = () => resolve(true);
      notification.onerror = () => resolve(false);
      setTimeout(() => resolve(false), 8000);
    });
    notification.close(); const state = audio.state; await audio.close();
    return {permission, audioState:state, shown};
  })()`);
  assert.equal(evidence.result.permission, 'granted');
  assert.equal(evidence.result.audioState, 'running');
  fs.writeFileSync(output, JSON.stringify(evidence, null, 2)); app.exit(0);
}).catch(e => { evidence.error = e.stack; fs.writeFileSync(output, JSON.stringify(evidence, null, 2)); app.exit(1); });
setTimeout(() => app.exit(2), 30000).unref();
