// Actual Electron capture with no picker window: sharing follows the display the
// workstation preview already selected, using only our synthetic frame.
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
  // Two synthetic displays so the selection can actually pick the second one.
  desktopCapturer.getSources = async () => ['1', '2'].map(id => ({
    id: 'screen:' + id, display_id: id, name: 'Synthetic screen ' + id, thumbnail: nativeImage.createEmpty(),
  }));
  const displays = require('../display-store.cjs').createDisplayStore(path.resolve(__dirname, '../../Build/desktop-capture-display.json'));
  assert.equal(displays.select('2'), '2', 'the selected display must persist');
  require('../permissions.cjs').configurePermissions(ses, () => win, { displays });
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
      const r={width:v.videoWidth,height:v.videoHeight,audio:s.getAudioTracks().length,label:s.getVideoTracks()[0].label};
      s.getTracks().forEach(t=>t.stop());v.srcObject=null;r.stopped=!s.active;return r;
    })()`, true);
    assert(result.width > 0 && result.height > 0 && result.stopped && result.audio === 0);
    evidence.checks.push({ name, ...result });
  }
  // No picker exists any more, so a missing gesture must still be refused.
  const gesture = await win.webContents.executeJavaScript('navigator.mediaDevices.getDisplayMedia({video:true}).then(s=>{s.getTracks().forEach(t=>t.stop());return "captured"},()=>"refused")', true);
  assert.equal(gesture, 'captured', 'a user gesture from the page is enough; no chooser window appears');
  evidence.checks.push({ name: 'no chooser window is opened' });
  desktopCapturer.getSources = async () => [];
  const none = await win.webContents.executeJavaScript('navigator.mediaDevices.getDisplayMedia({video:true}).then(()=>"captured",()=>"refused")', true);
  assert.equal(none, 'refused'); evidence.checks.push({name:'no display available rejects without capture'});
  const camera = await win.webContents.executeJavaScript('navigator.mediaDevices.getUserMedia({video:true}).then(s=>{s.getTracks().forEach(t=>t.stop());return false},()=>true)',true);
  assert.equal(camera,true); evidence.checks.push({name:'camera remains denied'});
  assert.deepEqual(evidence.errors,[]); report(); app.exit(0);
}).catch(error => { evidence.errors.push(error.stack); report(); app.exit(1); });
setTimeout(()=>{evidence.errors.push('timeout');report();app.exit(1)},45000).unref();
