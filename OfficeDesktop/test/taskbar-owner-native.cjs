// Electron integration, isolated test windows only. Never modifies Explorer.
const { app, BrowserWindow, screen } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const moduleRoot = process.env.DOCK_OWNER_PACKAGE || path.resolve(__dirname, '..');
const { createTaskbarOwner, windowHandle } = require(path.join(moduleRoot, 'dock-taskbar-owner.cjs'));
const k = require('koffi');
const user32 = k.load('user32.dll');
const getWindow = user32.func('uintptr_t __stdcall GetWindow(uintptr_t, uint32_t)');
const setOwner = user32.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t, int, intptr_t)');
const foreground = user32.func('uintptr_t __stdcall GetForegroundWindow()');
const find = user32.func('uintptr_t __stdcall FindWindowW(str16,str16)');
const valid = user32.func('bool __stdcall IsWindow(uintptr_t)');
const wait = ms => new Promise(r => setTimeout(r, ms));
function above(hwnd, other) {
  for (let next = getWindow(other, 3), n = 0; next && n < 1000; n++, next = getWindow(next, 3)) {
    if (BigInt(next) === BigInt(hwnd)) return true;
  }
  return false;
}
app.setPath('userData', path.resolve('../Build/taskbar-owner-qa'));
app.whenReady().then(async () => {
  const windows = [];
  try {
    const d = screen.getPrimaryDisplay();
    const options = { show: false, frame: false, focusable: false, skipTaskbar: true,
      x: d.workArea.x + 20, y: d.workArea.y + 20, width: 160, height: 40 };
    const host = new BrowserWindow(options); windows.push(host);
    const dock = new BrowserWindow({ ...options, transparent: true }); windows.push(dock);
    await host.loadURL('data:text/html,<body style="background:%23233343">Taskbar QA</body>');
    await dock.loadURL('data:text/html,<body style="background:%237db291">Dock QA</body>');
    const initialFocus = foreground();
    host.setAlwaysOnTop(true, 'screen-saver'); dock.setAlwaysOnTop(true, 'screen-saver');
    host.showInactive(); dock.showInactive();
    host.moveTop();
    assert.equal(above(windowHandle(dock), windowHandle(host)), false, 'baseline reproduces occlusion');
    const binding = createTaskbarOwner({ load: () => ({
      find: () => windowHandle(host), valid, owner: getWindow, setOwner,
    }) });
    assert.equal(binding.sync(dock), true);
    for (let i = 0; i < 100; i++) {
      host.moveTop();
      assert.equal(above(windowHandle(dock), windowHandle(host)), true, 'OS preserves ordering immediately');
    }
    assert.equal(BigInt(foreground()), BigInt(initialFocus), 'no focus stolen');
    // Closing an owner must reach Electron's destruction path, so the existing
    // dock ensure() loop can reconstruct it after Explorer restarts.
    const recoveryHost = new BrowserWindow(options); windows.push(recoveryHost);
    const recoveryDock = new BrowserWindow(options); windows.push(recoveryDock);
    let closed = false;
    recoveryDock.on('closed', () => { closed = true; });
    setOwner(windowHandle(recoveryDock), -8, windowHandle(recoveryHost));
    recoveryHost.destroy();
    await wait(100);
    assert.equal(recoveryDock.isDestroyed(), true, 'native owner destruction reaches BrowserWindow');
    assert.equal(closed, true, 'closed handler permits ensure() recovery');
    const real = createTaskbarOwner();
    assert.equal(real.sync(dock), true, real.error());
    assert.equal(BigInt(getWindow(windowHandle(dock), 4)), BigInt(find('Shell_TrayWnd', null)));
    await wait(200);
    assert.equal(above(windowHandle(dock), find('Shell_TrayWnd', null)), true);
    dock.hide(); assert.equal(dock.isVisible(), false);
    assert.equal(real.sync(dock), true); assert.equal(dock.isVisible(), false, 'sync does not show hidden dock');
    dock.showInactive(); assert.equal(dock.isVisible(), true);
    dock.setBounds({ ...dock.getBounds(), height: 300 });
    assert.equal(dock.getBounds().height, 300, 'popup can expand outside taskbar');
    const result = { baselineOccluded: true, immediateOrderingChecks: 100,
      realTaskbarOwner: true, noFocusStolen: true, hideShow: true, popupExpansion: true,
      ownerDestroyedRecovery: true, moduleRoot };
    fs.writeFileSync(path.resolve('../Build/taskbar-owner-native.json'), JSON.stringify(result, null, 2));
    console.log('PASS', result);
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { for (const w of windows) if (!w.isDestroyed()) w.destroy(); app.exit(process.exitCode || 0); }
});
