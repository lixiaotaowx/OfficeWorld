// Isolated Electron windows: reproduce the owner defect, then exercise real hooks.
const { app, BrowserWindow, screen, desktopCapturer } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const moduleRoot = process.env.DOCK_ORDER_PACKAGE || path.resolve(__dirname, '..');
const { createDockZOrder, windowHandle } = require(path.join(moduleRoot, 'dock-z-order.cjs'));
const k = require('koffi'), u = k.load('user32.dll');
const getWindow = u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)');
const setOwner = u.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t,int,intptr_t)');
const popups = u.func('bool __stdcall ShowOwnedPopups(uintptr_t,bool)');
const style = u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)');
const fg = u.func('uintptr_t __stdcall GetForegroundWindow()');
const wait = ms => new Promise(r => setTimeout(r, ms));
const isTop = w => (Number(style(windowHandle(w), -20)) & 8) !== 0;
app.setPath('userData', path.resolve('../Build/dock-independent-qa'));
app.whenReady().then(async () => {
  let order;
  const windows = [];
  try {
    const display = screen.getPrimaryDisplay();
    const options = { show: false, frame: false, focusable: false, skipTaskbar: true,
      x: display.bounds.x + 600, y: display.workArea.y + display.workArea.height,
      width: 220, height: 40, webPreferences: { backgroundThrottling: false } };
    const owner = new BrowserWindow(options); windows.push(owner);
    const dock = new BrowserWindow({ ...options, transparent: true }); windows.push(dock);
    await owner.loadURL('data:text/html,<body style="background:%23334455">QA taskbar</body>');
    await dock.loadURL('data:text/html,<body style="margin:0;background:%2300cc66;color:black">Independent dock QA</body>');
    const initialFocus = fg();
    owner.setAlwaysOnTop(true); dock.setAlwaysOnTop(true);
    owner.showInactive(); dock.showInactive();
    setOwner(windowHandle(dock), -8, windowHandle(owner));
    popups(windowHandle(owner), false); await wait(100);
    assert.equal(dock.isVisible(), false, 'baseline: owner alone can hide an otherwise visible dock');
    popups(windowHandle(owner), true); dock.showInactive();
    owner.setAlwaysOnTop(false); await wait(100);
    assert.equal(isTop(dock), false, 'baseline: demoting the owner strips the dock topmost flag');

    setOwner(windowHandle(dock), -8, 0);
    let allowed = true;
    order = createDockZOrder({ allowed: () => allowed, repair: () => {
      if (!dock.isVisible()) dock.showInactive();
      order.sync(dock);
    } });
    order.start(); assert.equal(order.watching(), true, JSON.stringify(order.diagnostics()));
    order.sync(dock); assert.equal(isTop(dock), true);
    popups(windowHandle(owner), false); await wait(100);
    assert.equal(dock.isVisible(), true, 'independent window ignores owner hide');
    for (let i = 0; i < 20; i++) {
      dock.setAlwaysOnTop(false); // Simulate actual loss; no cursor or click is injected.
      const start = Date.now();
      while (!isTop(dock) && Date.now() - start < 1000) await wait(10);
      assert.equal(isTop(dock), true, 'native events repair without a taskbar click');
    }
    const repairs = order.diagnostics().repairs;
    await wait(500);
    assert.equal(order.diagnostics().repairs, repairs, 'no periodic topmost churn');
    allowed = false; dock.hide(); owner.moveTop(); await wait(100);
    assert.equal(dock.isVisible(), false, 'intentional sharing/fullscreen hide stays hidden');
    allowed = true; dock.showInactive(); order.sync(dock);
    assert.equal(BigInt(getWindow(windowHandle(dock), 4)), 0n);
    assert.equal(BigInt(fg()), BigInt(initialFocus), 'no focus stolen');
    await wait(300);
    const sources = await desktopCapturer.getSources({ types: ['screen'],
      thumbnailSize: { width: display.size.width, height: display.size.height } });
    const source = sources.find(s => s.display_id === String(display.id));
    assert.ok(source, 'real desktop capture');
    const crop = source.thumbnail.crop({ x: 600, y: display.workArea.height, width: 220, height: 40 });
    fs.writeFileSync(path.resolve('../Build/dock-independent-screen.png'), crop.toPNG());
    const bitmap = crop.toBitmap(); let green = 0;
    for (let i = 0; i < bitmap.length; i += 4) if (bitmap[i + 1] > 150 && bitmap[i + 2] < 60) green++;
    assert.ok(green > 1000, `dock actually painted above taskbar (${green} green pixels)`);
    const result = { ownerHideReproduced: true, ownerDemotionReproduced: true,
      noInputRecoveries: 20, noInputNeeded: true, independentOwner: true,
      intentionalHide: true, noFocusStolen: true, desktopGreenPixels: green, ...order.diagnostics() };
    fs.writeFileSync(path.resolve('../Build/dock-independent-native.json'), JSON.stringify(result, null, 2));
    console.log('PASS', result);
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { order?.stop(); for (const w of windows) if (!w.isDestroyed()) w.destroy(); app.exit(process.exitCode || 0); }
});
