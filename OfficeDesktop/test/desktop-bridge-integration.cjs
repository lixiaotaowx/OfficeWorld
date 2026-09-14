// Actual sandbox preload/IPC and OS encryption; synthetic monitor pixels only.
const { app, BrowserWindow, session, desktopCapturer, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const profile = path.resolve(__dirname, '../../Build/desktop-auto-integration-profile');
app.setPath('userData', profile);
const evidence = { checks: [], errors: [] };
const report = () => fs.writeFileSync(path.resolve(__dirname, '../../Build/desktop-auto-integration.json'), JSON.stringify(evidence, null, 2));
app.whenReady().then(async () => {
  const ses = session.fromPartition('desktop-auto-integration');
  await ses.protocol.handle('https', () => new Response('<h1>Desktop integration fixture</h1>', {
    headers: { 'Content-Type': 'text/html' },
  }));
  const win = new BrowserWindow({ show: false, webPreferences: { session: ses,
    sandbox: true, contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-preload.cjs') } });
  win.webContents.on('preload-error', (_event, _file, error) => evidence.errors.push(error.message));
  const pixel = nativeImage.createFromBitmap(Buffer.alloc(32 * 18 * 4, 180), { width: 32, height: 18 });
  desktopCapturer.getSources = async () => ['1', '2'].map(id => ({ id: 'screen:' + id, display_id: id, thumbnail: pixel }));
  require('../desktop-bridge.cjs').installDesktopBridge(() => win);
  await win.loadURL('https://115.159.43.237/');
  const result = await win.webContents.executeJavaScript(`(async()=>{
    const b=window.officeDesktop;
    const rows=await b.displays();
    await b.selectDisplay('2');
    const selected=(await b.displays()).find(d=>d.selected).id;
    const image=await b.previewFrame();
    const saved=await b.saveLogin({name:'Fixture',password:'fixture1'});
    const login=await b.readLogin();
    return {count:rows.length,selected,image:image.startsWith('data:image/jpeg;base64,'),saved,loginMatches:login?.password==='fixture1'};
  })()`);
  assert.equal(result.count, 2); assert.equal(result.selected, '2');
  assert.equal(result.image, true); assert.equal(result.saved, true); assert.equal(result.loginMatches, true);
  assert.equal(fs.readFileSync(path.join(profile, 'login.enc')).includes(Buffer.from('fixture1')), false);
  evidence.checks.push({ name: 'sandbox IPC, synthetic dual displays and OS-encrypted credentials', ...result });
  await win.webContents.executeJavaScript('officeDesktop.clearLogin()');
  assert.equal(fs.existsSync(path.join(profile, 'login.enc')), false);
  await win.loadURL('https://example.com/');
  assert.equal(await win.webContents.executeJavaScript('officeDesktop.previewFrame().then(()=>false,()=>true)'), true);
  evidence.checks.push({ name: 'logout removes credentials; foreign navigation cannot use native capture' });
  assert.deepEqual(evidence.errors, []); report(); app.exit(0);
}).catch(error => { evidence.errors.push(error.stack); report(); app.exit(1); });
setTimeout(() => { evidence.errors.push('timeout'); report(); app.exit(1); }, 45000).unref();
