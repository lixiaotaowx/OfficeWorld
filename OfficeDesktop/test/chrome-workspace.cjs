// Official web assets with isolated account/signaling data for desktop visual QA.
const { app, BrowserWindow, session, net, desktopCapturer, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { installChrome } = require('../chrome.cjs');
const { installDesktopBridge } = require('../desktop-bridge.cjs');
const output = path.resolve(__dirname, '../../Build/DesktopDesignQA');
fs.mkdirSync(path.join(output, 'server'), {recursive:true});
app.setPath('userData', path.join(output, 'workspace-profile'));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
app.whenReady().then(async () => {
  const { createOfficeServer } = await import(pathToFileURL(path.resolve(__dirname, '../../OfficeWeb/server.mjs')));
  const { http } = createOfficeServer({ secureCookies:false,
    statePath:path.join(output,'server/state.json'), accountsPath:path.join(output,'server/accounts.json') });
  await new Promise(resolve => http.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${http.address().port}`;
  const name = '界面验收员';
  await fetch(base+'/api/auth/register', {method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({name,password:'qa'})});
  const login = await fetch(base+'/api/auth/login', {method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({name,password:'qa'})});
  const cookie = login.headers.get('set-cookie').split(';')[0];
  const { io } = require('socket.io-client');
  await new Promise((resolve,reject) => {
    const socket = io(base,{transports:['websocket'],extraHeaders:{Origin:base,Cookie:cookie}});
    socket.on('connect',()=>socket.emit('join',{}));
    socket.once('people',()=>socket.emit('seat',0,reply=>{
      socket.disconnect(); reply.ok ? resolve() : reject(Error(reply.error));
    }));
    socket.on('connect_error',reject);
  });
  const ses = session.fromPartition('chrome-workspace-qa');
  ses.webRequest.onBeforeRequest({urls:['*://115.159.43.237/socket.io/*']}, (details, callback) => callback({cancel:details.resourceType==='webSocket'}));
  ses.protocol.handle('https', async request => {
    const url = new URL(request.url);
    if (url.origin === 'https://115.159.43.237' && /^\/(api|socket.io)\//.test(url.pathname)) {
      return fetch(base+url.pathname+url.search, {method:request.method,
        headers:{Origin:base,cookie,'Content-Type':request.headers.get('content-type') || 'application/json'},
        body:['GET','HEAD'].includes(request.method)?undefined:Buffer.from(await request.arrayBuffer())});
    }
    return net.fetch(request,{bypassCustomProtocolHandlers:true});
  });
  const pixel = nativeImage.createFromBitmap(Buffer.alloc(32*18*4,180),{width:32,height:18});
  desktopCapturer.getSources = async () => [{id:'screen:qa',display_id:'qa',thumbnail:pixel}];
  const win = new BrowserWindow({width:1440,height:940,frame:false,show:false,
    webPreferences:{session:ses,sandbox:true,contextIsolation:true,nodeIntegration:false,
      preload:path.resolve(__dirname,'../desktop-preload.cjs')}});
  installChrome(win); installDesktopBridge(()=>win);
  await win.loadURL('https://115.159.43.237/?debug=1');
  for(let i=0;i<100;i++) {
    if(await win.webContents.executeJavaScript('!!window.__officeDebug?.avatar?.model'))break;
    await wait(200);
  }
  await win.webContents.executeJavaScript(`document.querySelectorAll('button').forEach(b=>{if(b.textContent==='确认')b.click()})`);
  await wait(400);
  await wait(3000);
  assert.equal(await win.webContents.executeJavaScript(`document.querySelector('.brand-wordmark').textContent.includes('iruler dream')`),true);
  fs.writeFileSync(path.join(output,'workspace.png'),(await win.webContents.capturePage()).toPNG());
  win.destroy(); http.close(); app.exit(0);
}).catch(error=>{fs.writeFileSync(path.join(output,'workspace-failure.txt'),error.stack);app.exit(1)});
setTimeout(()=>app.exit(2),45000).unref();

