// Capture only a synthetic WebFrameMain, never the user's desktop or microphone.
const { app, BrowserWindow, session, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const report = { checks: [], requests: [], errors: [] };
const output = path.resolve(__dirname, '../../Build/dock-capture-integration.json');
const save = () => fs.writeFileSync(output, JSON.stringify(report, null, 2));
app.whenReady().then(async () => {
  const ses = session.fromPartition('dock-capture-integration');
  await ses.protocol.handle('https', () => new Response('<canvas id="c" width="320" height="180"></canvas><script>setInterval(()=>{const x=c.getContext("2d");x.fillStyle="green";x.fillRect(0,0,320,180);x.fillStyle="white";x.fillText(Date.now(),10,40)},80)</script>', { headers: { 'content-type': 'text/html' } }));
  const win = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true,
    contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
    preload: path.resolve(__dirname, '../desktop-preload.cjs') } });
  const dock = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true,
    contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-dock-preload.cjs') } });
  ipcMain.handle('dream:resources', () => ({}));
  require('../dock-bridge.cjs').installDockBridge({ ipcMain, getWindow: () => win,
    dock: { window: () => dock, setVisible: () => true, send: () => true } });
  require('../permissions.cjs').configurePermissions({
    setPermissionCheckHandler: fn => ses.setPermissionCheckHandler(fn),
    setPermissionRequestHandler: fn => ses.setPermissionRequestHandler(fn),
    setDisplayMediaRequestHandler: fn => ses.setDisplayMediaRequestHandler((request, callback) => {
      report.requests.push({ userGesture: request.userGesture }); fn(request, callback);
    }),
  }, () => win, { displays: { source: async () => win.webContents.mainFrame } });
  await win.loadURL('https://115.159.43.237/');
  await dock.loadURL('https://115.159.43.237/dock.html');
  await win.webContents.executeJavaScript(`
    window.capture = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({audio:false,
          video:{width:{ideal:1920},height:{ideal:1080},frameRate:15}});
        const video=document.createElement('video');video.muted=true;video.srcObject=stream;
        await video.play();
        const result={ok:true,video:stream.getVideoTracks().length,audio:stream.getAudioTracks().length,
          width:video.videoWidth,height:video.videoHeight};
        stream.getTracks().forEach(track=>track.stop());video.srcObject=null;return result;
      } catch(e) { return {ok:false,name:e.name,message:e.message}; }
    };
    window.officeDesktop.onDockCommand(async value => {
      if(value.kind==='meeting-share') window.result=await window.capture();
    });
    undefined;
  `);
  report.checks.push({ name: 'direct page gesture', result: await win.webContents.executeJavaScript('window.capture()', true) });
  // Let the main page's transient activation expire before the independent dock click.
  await new Promise(resolve => setTimeout(resolve, 6000));
  await dock.webContents.executeJavaScript(`window.officeDock.action('meeting-share','')`, true);
  for (let i = 0; i < 100; i++) {
    const result = await win.webContents.executeJavaScript('window.result');
    if (result) { report.checks.push({ name: 'dock click through real IPC', result }); break; }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  save();
  assert.equal(report.checks.length, 2);
  for (const check of report.checks) {
    assert.equal(check.result.ok, true, JSON.stringify(check));
    assert.ok(check.result.width > 0 && check.result.height > 0);
  }
  await new Promise(resolve => setTimeout(resolve, 6000));
  const replay = await win.webContents.executeJavaScript('window.capture()', false);
  assert.equal(replay.ok, false, 'one dock click cannot authorize a second capture');
  report.checks.push({ name: 'unrequested repeated capture rejected', result: replay });
  save();
  app.exit(0);
}).catch(error => { report.errors.push(String(error)); save(); app.exit(1); });
setTimeout(() => { report.errors.push('timeout'); save(); app.exit(1); }, 30000).unref();
