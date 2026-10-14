const { app, BrowserWindow, session } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const report = { checks: [], errors: [] };
const write = () => fs.writeFileSync(path.resolve(__dirname, '../../Build/dock-meeting-chain.json'),
  JSON.stringify(report, null, 2));

app.whenReady().then(async () => {
  const ses = session.fromPartition('dock-meeting-chain');
  // 只喂一个空白夹具页：`policy.trusted()` 只看 origin，所以两个窗口都算"可信来源"。
  const root = path.resolve(__dirname, '../../Build/OfficeWeb');
  await ses.protocol.handle('https', request => {
    const url = new URL(request.url);
    if (url.pathname === '/') return new Response('<html><body>main fixture</body></html>', { headers: { 'Content-Type': 'text/html' } });
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return new Response('', { status: 404 });
    const mime = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'application/octet-stream';
    return new Response(fs.readFileSync(file), { headers: { 'Content-Type': mime } });
  });

  const appWin = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true, backgroundThrottling: false,
    contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-preload.cjs') } });
  const dockWin = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true, backgroundThrottling: false,
    contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-dock-preload.cjs') } });
  for (const win of [appWin, dockWin]) {
    win.webContents.on('preload-error', (_e, file, error) =>
      report.errors.push(`${path.basename(file)}: ${error.message}`));
  }

  const sentToDock = [];
  const visible = [];
  let hitRegions = [];
  let cursor = { x: 0, y: 0 };
  const pointer = require('../dock-pointer.cjs').createDockPointer({
    screen: { getCursorScreenPoint: () => cursor }, getWindow: () => dockWin,
  });
  const user32 = require('koffi').load('user32.dll');
  const getStyle = user32.func('long __stdcall GetWindowLongW(void *hWnd, int nIndex)');
  const hwnd = dockWin.getNativeWindowHandle().readBigUInt64LE();
  const passesThrough = () => Boolean(getStyle(hwnd, -20) & 0x20);
  // Keep this isolated test hidden when a view command requests main-window focus.
  appWin.show = appWin.moveTop = appWin.focus = () => {};
  // 夹具里没有真正的主进程：preload 会问一次 `dream:resources`，给它一个空答案，
  // 免得 stderr 里刷一堆 "No handler registered"（和这条链无关）。
  require('electron').ipcMain.handle('dream:resources', () => ({}));
  require('../dock-bridge.cjs').installDockBridge({
    ipcMain: require('electron').ipcMain,
    getWindow: () => appWin,
    dock: {
      window: () => dockWin,
      send: (channel, payload) => { sentToDock.push({ channel, payload }); dockWin.webContents.send(channel, payload); return true; },
      setVisible: (on, reason) => { visible.push([on === true, String(reason || '')]); return true; },
      resize: () => true,
      applyLayout: input => { hitRegions = input.hitRegions || []; pointer.update(hitRegions); return true; },
      theme: async () => null,
      edge: () => 'bottom', popup: () => 'left', stripHeight: () => 40,
    },
  });

  await appWin.loadURL('https://115.159.43.237/');
  await dockWin.loadURL('https://115.159.43.237/dock.html');

  const wait = async (window, expression) => {
    for (let i = 0; i < 100; i++) {
      if (await window.webContents.executeJavaScript(expression)) return;
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    throw Error('Timed out: ' + expression);
  };
  await appWin.webContents.executeJavaScript(`
    window.__commands = [];
    window.officeDesktop.onDockCommand(value => window.__commands.push(value));
    window.officeDesktop.onDockVideoWant(id => {
      if (id !== 'peer') return;
      if (window.__recorder?.state === 'recording') window.__recorder.stop();
      const epoch = crypto.randomUUID();
      window.officeDesktop.dockVideo({ id, epoch, mime:'video/webm;codecs=vp8', reset:true });
      const canvas = document.createElement('canvas'); canvas.width=640; canvas.height=360;
      const context = canvas.getContext('2d'); let tick=0;
      window.__paint = setInterval(() => {
        context.fillStyle = tick++ % 2 ? '#527864' : '#d4c5ac'; context.fillRect(0,0,640,360);
        context.fillStyle='#fff'; context.font='40px sans-serif'; context.fillText('Meeting '+tick,30,180);
      },80);
      const recorder = window.__recorder = new MediaRecorder(canvas.captureStream(15), {mimeType:'video/webm;codecs=vp8'});
      recorder.ondataavailable = async event => {
        if (event.data.size) window.officeDesktop.dockVideo({id,epoch,mime:'video/webm;codecs=vp8',bytes:await event.data.arrayBuffer()});
      };
      recorder.start(400);
    });
    window.officeDesktop.dockState({people:[{id:'me',name:'我',self:true},{id:'peer',name:'同事乙'}],
      meeting:{active:true,title:'讨论',mic:false,sharing:false,candidates:[],screens:[{id:'peer',name:'同事乙',streamId:'native-video'}]}});
  `);
  await wait(dockWin, `document.querySelector('.dock-meeting-video video')?.readyState >= 2`);
  const time = await dockWin.webContents.executeJavaScript(`document.querySelector('video').currentTime`);
  await new Promise(resolve => setTimeout(resolve, 1700));
  assert.ok(await dockWin.webContents.executeJavaScript(`document.querySelector('video').currentTime > ${time}`));
  await dockWin.webContents.executeJavaScript(`document.querySelector('.dock-meeting-controls button').click()`);
  await wait(appWin, `window.__commands.some(value => value.kind === 'meeting-share')`);
  report.checks.push({ name: '真实 preload / IPC 视频播放与会议命令', ok: true });
  assert.equal(await dockWin.webContents.executeJavaScript(`document.querySelectorAll('.dock-share-bubble button').length`), 2);
  for (const [selector, kind] of [
    ['.dock-meeting-controls button', 'meeting-share'],
    ['.dock-meeting-mic', 'meeting-mute'],
    ['.dock-share-picture button:nth-child(1)', 'meeting-view'],
    ['.dock-share-picture button:nth-child(2)', 'meeting-fullscreen'],
  ]) {
    await appWin.webContents.executeJavaScript('window.__commands.length = 0');
    const point = await dockWin.webContents.executeJavaScript(`(() => {
      const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return { x: Math.round(rect.x + rect.width / 2), y: Math.round(rect.y + rect.height / 2) };
    })()`);
    assert.ok(hitRegions.some(r => point.x >= r.x && point.x < r.x + r.width && point.y >= r.y && point.y < r.y + r.height), 'real preload must forward the button hit region');
    const bounds = dockWin.getBounds();
    cursor = { x: bounds.x + point.x, y: bounds.y + point.y }; pointer.sync();
    assert.equal(passesThrough(), false, 'native window must accept the picture-button click');
    dockWin.webContents.sendInputEvent({ type: 'mouseDown', ...point, button: 'left', clickCount: 1 });
    dockWin.webContents.sendInputEvent({ type: 'mouseUp', ...point, button: 'left', clickCount: 1 });
    await wait(appWin, `window.__commands.some(value => value.kind === '${kind}')`);
  }
  cursor = { x: dockWin.getBounds().x + 5, y: dockWin.getBounds().y + 5 }; pointer.sync();
  assert.equal(passesThrough(), true, 'empty background remains click-through');
  report.checks.push({ name: '完整 preload 命中区域与 Windows 鼠标穿透、画面内双按钮输入', ok: true });
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({people:[{id:'me',name:'我',self:true}],meeting:{active:false,candidates:[],screens:[]}})`);
  await wait(dockWin, `!document.querySelector('video') && !document.querySelector('.dock-meeting-controls')`);
  report.checks.push({ name: '停止共享移除视频与会议按钮', ok: true });
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({people:[{id:'peer',name:'CCC'}],
    meeting:{active:false,invitations:[{id:'invite-a',personId:'peer',name:'CCC'}]}})`);
  await wait(dockWin, `document.querySelector('.dock-call-text')?.textContent === 'CCC发起的会议'`);
  await dockWin.webContents.executeJavaScript(`document.querySelector('.dock-call-answer').click()`);
  await wait(appWin, `window.__commands.some(value => value.kind === 'meeting-accept' && value.personId === 'invite-a')`);
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({people:[{id:'me',self:true}],
    meeting:{active:true,id:'invite-a',host:true,title:'讨论',screens:[],invitations:[],
      members:[{id:'me',name:'小桃1',status:'joined'},{id:'peer',name:'CCC',status:'invited'}]}})`);
  await wait(dockWin, `!!document.querySelector('.dock-meeting-panel') && !document.querySelector('.dock-call')`);
    await wait(dockWin, `document.querySelector('[aria-label="小桃1，已加入"]')?.textContent === '小桃1✓' &&
      document.querySelector('[aria-label="CCC，等待加入"]')?.textContent === 'CCC◷'`);
    report.checks.push({ name: '成员姓名与入会状态通过生产 IPC 白名单', ok: true });
  await dockWin.webContents.executeJavaScript(`document.querySelector('[aria-label="折叠会议小窗口"]').click()`);
  await wait(dockWin, `!!document.querySelector('.dock-meeting-folded')`);
  await dockWin.webContents.executeJavaScript(`document.querySelector('.dock-meeting-folded').click()`);
  await wait(dockWin, `!!document.querySelector('.dock-meeting-actions')`);
  await dockWin.webContents.executeJavaScript(`document.querySelectorAll('.dock-meeting-actions button')[2].click()`);
  await wait(dockWin, `!!document.querySelector('.dock-meeting-confirm')`);
  await dockWin.webContents.executeJavaScript(`document.querySelectorAll('.dock-meeting-confirm button')[1].click()`);
  await wait(appWin, `window.__commands.some(value => value.kind === 'meeting-end' && value.personId === 'invite-a')`);
  report.checks.push({ name: '原生会议邀请接听、折叠展开与主持人结束命令', ok: true });
  assert.deepEqual(report.errors, []); write();
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({people:[{id:'me',name:'我',self:true,status:'吃饭去了'}]})`);
  pointer.start();
  async function mouseClick(selector, button = 'left') {
    const point = await dockWin.webContents.executeJavaScript(`(() => {
      const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};
    })()`);
    for(let i=0;i<30 && !hitRegions.some(r=>point.x>=r.x && point.y>=r.y && point.x<r.x+r.width && point.y<r.y+r.height);i++)
      await new Promise(resolve=>setTimeout(resolve,100));
    cursor = {x:dockWin.getBounds().x+point.x,y:dockWin.getBounds().y+point.y};
    await new Promise(resolve=>setTimeout(resolve,150));
    pointer.sync(); assert.equal(passesThrough(),false, selector+' must accept native mouse input '+JSON.stringify({point,hitRegions,bounds:dockWin.getBounds()}));
    dockWin.webContents.sendInputEvent({type:'mouseDown',...point,button,clickCount:1});
    dockWin.webContents.sendInputEvent({type:'mouseUp',...point,button,clickCount:1});
  }
  await wait(dockWin, `document.querySelector('.dock-status-bubble')?.textContent === '吃饭去了'`);
  await mouseClick('.dock-avatar.mine','right');
  await wait(dockWin, `!!document.querySelector('.dock-status-menu')`);
  await mouseClick('.dock-status-close');
  await wait(dockWin, `!document.querySelector('.dock-status-menu')`);
  await mouseClick('.dock-avatar.mine','right');
  await wait(dockWin, `!!document.querySelector('.dock-status-menu')`);
  await mouseClick('.dock-status-menu button');
  await wait(appWin, `window.__commands.some(value => value.kind === 'status' && value.personId === 'me')`);
  report.checks.push({ name: '个人状态通过生产 preload/IPC，右键入口回传编辑命令', ok: true });
  await mouseClick('.dock-avatar.mine');
  await wait(dockWin, `!!document.querySelector('.dock-status-menu')`);
  await mouseClick('.dock-status-menu button:nth-of-type(2)');
  await wait(appWin, `window.__commands.some(value => value.kind === 'status-clear' && value.personId === 'me')`);
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({people:[{id:'me',self:true,status:''}],statusControl:{busy:false,error:''}})`);
  await wait(dockWin, `!document.querySelector('.dock-status-menu') && !document.querySelector('.dock-status-bubble')`);
  report.checks.push({ name: '菜单直接清除命令及确认后气泡消失', ok: true });
  write();
  console.log('PASS native dock meeting chain: real video + IPC + commands + cleanup');
  app.exit(0);
}).catch(error => { report.errors.push(error.stack || String(error)); write(); console.error(error); app.exit(1); });
setTimeout(() => { report.errors.push('timeout'); write(); app.exit(1); }, 55000).unref();
