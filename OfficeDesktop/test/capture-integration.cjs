// Actual Electron capture + sandboxed picker IPC, using only our synthetic app frame.
const { app, BrowserWindow, session, desktopCapturer, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const evidence = { checks: [], errors: [], input: 'synthetic test frame only; no desktop or microphone' };
app.setPath('userData', path.resolve(__dirname, '../../Build/desktop-capture-integration-profile'));
const report = () => fs.writeFileSync(path.resolve(__dirname, '../../Build/desktop-capture-integration.json'), JSON.stringify(evidence,null,2));
app.whenReady().then(async () => {
  const ses = session.fromPartition('capture-integration');
  await ses.protocol.handle('https', () => new Response('<h1>Office synthetic capture</h1><canvas id="c" width="320" height="180"></canvas><script>const x=c.getContext("2d");setInterval(()=>{x.fillStyle="green";x.fillRect(0,0,320,180);x.fillStyle="white";x.fillText(Date.now(),10,60)},100)</script>', {
    headers: { 'content-type': 'text/html' },
  }));
  const win = new BrowserWindow({ show: false, webPreferences: {
    session: ses, sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false,
  } });
  desktopCapturer.getSources = async () => [{ id: 'synthetic-frame', name: 'Synthetic test frame', thumbnail: nativeImage.createEmpty() }];
  const pickerModule = require('../source-picker.cjs'), realPicker = pickerModule.chooseSource;
  let cancel = false;
  pickerModule.chooseSource = async (parent, sources) => {
    const result = realPicker(parent, sources, { show: false });
    const picker = BrowserWindow.getAllWindows().find(w => w !== win);
    picker.webContents.on('preload-error', (_event, _file, error) => evidence.errors.push(error.message));
    await new Promise(resolve => picker.webContents.once('did-finish-load', resolve));
    assert.equal(await picker.webContents.executeJavaScript('!!window.sourcePicker'), true);
    await picker.webContents.executeJavaScript(`new Promise(resolve=>{const wait=()=>{const b=document.querySelector(${JSON.stringify(cancel ? '#cancel' : '#sources button')});if(b){b.click();resolve()}else setTimeout(wait,25)};wait()})`, true);
    const selected = await result;
    return selected ? win.webContents.mainFrame : undefined;
  };
  require('../permissions.cjs').configurePermissions(ses, () => win);
  await win.loadURL('https://115.159.43.237/');
  for (const [name, constraints] of [
    ['workstation', {video:{frameRate:{ideal:15,max:20}},audio:false}],
    ['private', {video:true,audio:false}], ['meeting', {video:{displaySurface:'monitor'},audio:false}],
  ]) {
    const result = await win.webContents.executeJavaScript(`(async()=>{
      const s=await navigator.mediaDevices.getDisplayMedia(${JSON.stringify(constraints)});
      const v=document.createElement('video');v.muted=true;v.srcObject=s;await v.play();
      await new Promise((resolve,reject)=>{const start=Date.now();const check=()=>{
        if(v.videoWidth>0)resolve();else if(Date.now()-start>8000)reject(Error('no frames'));else setTimeout(check,50)};check()});
      const r={width:v.videoWidth,height:v.videoHeight,audio:s.getAudioTracks().length};
      s.getTracks().forEach(t=>t.stop());v.srcObject=null;r.stopped=!s.active;return r;
    })()`, true);
    assert(result.width > 0 && result.height > 0 && result.stopped && result.audio === 0);
    evidence.checks.push({ name, ...result });
  }
  cancel = true;
  const denied = await win.webContents.executeJavaScript('navigator.mediaDevices.getDisplayMedia({video:true}).then(s=>{s.getTracks().forEach(t=>t.stop());return false},()=>true)',true);
  assert.equal(denied,true); evidence.checks.push({name:'cancel rejects without capture'});
  const camera = await win.webContents.executeJavaScript('navigator.mediaDevices.getUserMedia({video:true}).then(s=>{s.getTracks().forEach(t=>t.stop());return false},()=>true)',true);
  assert.equal(camera,true); evidence.checks.push({name:'camera remains denied'});
  assert.deepEqual(evidence.errors,[]); report(); app.exit(0);
}).catch(error => { evidence.errors.push(error.stack); report(); app.exit(1); });
setTimeout(()=>{evidence.errors.push('timeout');report();app.exit(1)},45000).unref();
