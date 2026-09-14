// Real Electron permission plumbing, with fake source enumeration: no user desktop capture.
const { app, BrowserWindow, session, desktopCapturer, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const evidence = [];
app.setPath('userData', path.resolve(__dirname, '../../Build/desktop-capture-profile'));
app.whenReady().then(async () => {
  const ses = session.fromPartition('capture-trace');
  await ses.protocol.handle('https', () => new Response('<button id="capture">capture</button>', {
    headers: { 'content-type': 'text/html' },
  }));
  const win = new BrowserWindow({ show: false, webPreferences: {
    session: ses, sandbox: true, contextIsolation: true, nodeIntegration: false,
  } });
  desktopCapturer.getSources = async () => {
    evidence.push({ step: 'enumerate' });
    return [{ id: 'screen:1', display_id: '1', name: 'Synthetic screen', thumbnail: nativeImage.createEmpty() }];
  };
  const displays = { source: async (capturer, screenApi) => (await capturer.getSources({ types: ['screen'] }))[0] };
  const proxy = {
    setPermissionCheckHandler(handler) { ses.setPermissionCheckHandler((wc, permission, origin, details) => {
      const result = handler(wc, permission, origin, details);
      evidence.push({ step: 'check', permission, origin, details, result }); return result;
    }); },
    setPermissionRequestHandler(handler) { ses.setPermissionRequestHandler((wc, permission, callback, details) => {
      evidence.push({ step: 'request', permission, details }); handler(wc, permission, callback, details);
    }); },
    setDisplayMediaRequestHandler(handler) { ses.setDisplayMediaRequestHandler((request, callback) => {
      evidence.push({ step: 'display', securityOrigin: request.securityOrigin,
        userGesture: request.userGesture, videoRequested: request.videoRequested,
        sameFrame: request.frame === win.webContents.mainFrame });
      return handler(request, callback);
    }); },
  };
  require('../permissions.cjs').configurePermissions(proxy, () => win, { displays });
  await win.loadURL('https://115.159.43.237/');
  const result = await win.webContents.executeJavaScript(`navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
    .then(s=>{s.getTracks().forEach(t=>t.stop());return 'captured'})
    .catch(e=>({name:e.name,message:e.message}))`, true);
  evidence.push({ step: 'result', result });
  fs.writeFileSync(path.resolve(__dirname, '../../Build/desktop-capture-trace.json'), JSON.stringify(evidence, null, 2));
  app.quit();
});
setTimeout(() => { fs.writeFileSync(path.resolve(__dirname, '../../Build/desktop-capture-trace.json'),
  JSON.stringify([...evidence, {error:'timeout'}],null,2)); app.exit(1); }, 20000).unref();
