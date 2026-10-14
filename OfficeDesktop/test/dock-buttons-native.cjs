// Production dock UI, offline fixture bridge: actions only append to an array.
// No main application, accounts, Socket, permission grants or invitation handlers.
const { app, BrowserWindow, session, screen } = require('electron');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const packageRoot = process.env.DOCK_INPUT_PACKAGE || path.resolve(__dirname, '..');
const { createDockWindow } = require(path.join(packageRoot, 'dock-window.cjs'));
const k = require('koffi'), u = k.load('user32.dll');
const style = u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)');
const message = u.func('intptr_t __stdcall SendMessageW(uintptr_t,uint32_t,uintptr_t,intptr_t)');
const foreground = u.func('uintptr_t __stdcall GetForegroundWindow()');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const root = path.resolve('../Build/OfficeWeb');
app.setPath('userData', path.resolve('../Build/dock-buttons-qa'));
app.whenReady().then(async () => {
  let window, dock, focusFixture;
  const result = { checks: [] };
  try {
    const ses = session.fromPartition('offline-dock-buttons');
    const entry = fs.readFileSync(path.join(root, 'dock.html'), 'utf8');
    const assets = entry.match(/<script[^>]*src="([^"]+)"/)[1];
    const css = [...entry.matchAll(/<link[^>]*href="([^"]+\.css)"/g)]
      .map(m => `<link rel="stylesheet" href="${m[1]}">`).join('');
    const fixture = fs.readFileSync('../OfficeWeb/test/dock-harness.html', 'utf8')
      .replace('<script type="module" src="/src/dock.tsx"></script>', `${css}<script type="module" src="${assets}"></script>`);
    ses.protocol.handle('https', request => {
      const url = new URL(request.url);
      if (url.origin !== 'https://offline-dock.test') return new Response('', { status: 403 });
      if (url.pathname === '/') return new Response(fixture, { headers: { 'Content-Type': 'text/html' } });
      const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return new Response('', { status: 404 });
      const mime = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream';
      return new Response(fs.readFileSync(file), { headers: { 'Content-Type': mime } });
    });
    let cursor = { x: 0, y: 0 };
    const previousForeground = foreground();
    dock = createDockWindow({ url: 'https://offline-dock.test/',
      // Keep all production window/input settings, but no production preload.
      BrowserWindow: class extends BrowserWindow {
        constructor(options) { super({ ...options, webPreferences: { ...options.webPreferences, preload: undefined } }); }
      },
      session: { fromPartition: () => ses },
      screen: { getPrimaryDisplay: () => screen.getPrimaryDisplay(), getCursorScreenPoint: () => cursor },
      dockBounds: ({ stagePx = 0, width = 340 }) => {
        const height = Math.max(250, stagePx + 40);
        return { x:400, y:650-height, width:700, height, hidden:false,
          edge:'bottom', popup:'left', strip:{x:400,y:610,width:700,height:40} };
      },
      // Test input without rearranging Explorer or another app's z-order.
      zOrder: { start() {}, stop() {}, sync: () => true, blocked: () => false },
    });
    window = dock.ensure();
    await new Promise(resolve => window.webContents.once('did-finish-load', resolve));
    window.showInactive(); window.hide(); window.showInactive();
    await wait(400);
    assert.equal(foreground(), previousForeground, 'appearing never steals focus');
    const hwnd = window.getNativeWindowHandle().readBigUInt64LE();
    const rect = selector => window.webContents.executeJavaScript(`(() => {
      const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height}; })()`);
    async function move(point) {
      cursor = { x: window.getBounds().x + point.x, y: window.getBounds().y + point.y };
      dock.applyLayout(await window.webContents.executeJavaScript('window.__layouts.at(-1)'));
      assert.equal(Boolean(Number(style(hwnd, -20)) & 32), false, 'visible control accepts native input');
      window.webContents.sendInputEvent({ type: 'mouseMove', ...point });
    }
    const center = r => ({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) });
    for (const peer of ['p1', 'p2']) {
      for (const [index, kind] of ['watch', 'share', 'call'].entries()) {
        await move(center(await rect(`[data-person-id="${peer}"]`)));
        await wait(250);
        const target = center(await rect(`.dock-card-actions button:nth-child(${index + 1})`));
        await move(target);
        await wait(450);
        assert.equal(foreground(), previousForeground, 'hover never steals focus');
        // sendInputEvent bypasses WM_MOUSEACTIVATE. Check the Windows decision
        // first, otherwise a MA_NOACTIVATEANDEAT (4) window falsely passes.
        const activate = Number(message(hwnd, 0x21, hwnd, 0x02010001));
        result.checks.push({ peer, kind, mouseActivate: activate });
        assert.ok(activate === 1 || activate === 3, `Windows must deliver the click; WM_MOUSEACTIVATE=${activate}`);
        const before = await window.webContents.executeJavaScript('window.__actions.length');
        window.webContents.sendInputEvent({ type: 'mouseDown', ...target, button: 'left', clickCount: 1 });
        await wait(90);
        window.webContents.sendInputEvent({ type: 'mouseUp', ...target, button: 'left', clickCount: 1 });
        await wait(180);
        const actions = await window.webContents.executeJavaScript('window.__actions');
        result.checks.push({ peer, kind, actions: actions.slice(before) });
        assert.deepEqual(actions.slice(before), [[kind, peer]]);
      }
    }
    // Durable invitation plus native button hit regions. Everything remains offline.
    await window.webContents.executeJavaScript(`window.__pushState({...window.__dockState,
      privateCalls:{invitations:[{id:'ring',personId:'p1',name:'同事乙',kind:'voice',offer:false}],
        sessions:[],busy:false,error:''}})`);
    await wait(400);
    dock.applyLayout(await window.webContents.executeJavaScript('window.__layouts.at(-1)'));
    await wait(250);
    const answerPoint = center(await rect('.dock-call-answer'));
    await move(answerPoint);
    window.webContents.sendInputEvent({type:'mouseDown',...answerPoint,button:'left',clickCount:1});
    window.webContents.sendInputEvent({type:'mouseUp',...answerPoint,button:'left',clickCount:1});
    await wait(150);
    assert.deepEqual(await window.webContents.executeJavaScript('window.__answers.at(-1)'), ['ring',true]);
    await window.webContents.executeJavaScript(`window.__pushState({...window.__dockState,
      sharing:true,privateCalls:{invitations:[],sessions:[{id:'session-a',name:'同事乙',
        connected:true,mic:false,sharing:false}],busy:false,error:''}})`);
    await wait(300);
    dock.applyLayout(await window.webContents.executeJavaScript('window.__layouts.at(-1)'));
    await wait(250);
    for (const [index, kind] of ['private-share','private-mute'].entries()) {
      const point = center(await rect(`.dock-meeting-controls button:nth-child(${index+1})`));
      await move(point);
      const count = await window.webContents.executeJavaScript('window.__actions.length');
      window.webContents.sendInputEvent({type:'mouseDown',...point,button:'left',clickCount:1});
      window.webContents.sendInputEvent({type:'mouseUp',...point,button:'left',clickCount:1});
      await wait(150);
      assert.deepEqual(await window.webContents.executeJavaScript(`window.__actions.slice(${count})`), [[kind,'session-a']]);
    }
    result.privateControls = 'answer, share, mute: native hit regions and exact command IDs passed';
    await window.webContents.executeJavaScript(`window.__pushState(window.__dockState)`);
    await wait(200);
    dock.applyLayout(await window.webContents.executeJavaScript('window.__layouts.at(-1)'));
    await wait(250);
    result.phase = 'native focus restoration after private controls';
    // Exercise real native blur/focus, rather than only sendInputEvent. Both
    // windows belong to this offline fixture; no colleague receives anything.
    focusFixture = new BrowserWindow({ show: false, width: 100, height: 100,
      x: 0, y: 0, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
    await focusFixture.loadURL('data:text/html,<title>Offline focus fixture</title>');
    window.focus();
    await window.webContents.executeJavaScript(`document.querySelector('[data-person-id="p2"]').focus()`);
    await wait(120);
    focusFixture.show(); focusFixture.focus();
    window.webContents.sendInputEvent({type:'mouseMove',x:0,y:0});
    await wait(120);
    await move(center(await rect('[data-person-id="p1"]')));
    await wait(250);
    result.focusDebug = {bounds:window.getBounds(),cursor, layout:await window.webContents.executeJavaScript('window.__layouts.at(-1)'),
      dom:await window.webContents.executeJavaScript('document.body.innerText')};
    const target = center(await rect('.dock-card-actions button:nth-child(3)'));
    await move(target); await wait(100);
    const before = await window.webContents.executeJavaScript('window.__actions.length');
    window.focus();
    await wait(160);
    const name = await window.webContents.executeJavaScript(`document.querySelector('.dock-card')?.getAttribute('aria-label')`);
    window.webContents.sendInputEvent({ type: 'mouseDown', ...target, button: 'left', clickCount: 1 });
    await wait(90);
    window.webContents.sendInputEvent({ type: 'mouseUp', ...target, button: 'left', clickCount: 1 });
    await wait(180);
    const actions = await window.webContents.executeJavaScript('window.__actions');
    result.focusRestore = { name, actions: actions.slice(before) };
    assert.equal(name, '同事乙 的屏幕预览', 'native focus restoration must not replace the hovered person');
    assert.deepEqual(actions.slice(before), [['call', 'p1']]);
  } catch (error) { result.error = error.stack;
    if (window && !window.isDestroyed()) result.dom = await window.webContents.executeJavaScript(`document.body.innerText`).catch(() => 'unavailable');
  }
  finally {
    focusFixture?.destroy();
    dock?.destroy();
    fs.writeFileSync(path.resolve('../Build/dock-buttons-native.json'), JSON.stringify(result, null, 2));
    app.exit(result.error ? 1 : 0);
  }
});
