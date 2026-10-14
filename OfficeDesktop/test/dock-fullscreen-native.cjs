// Isolated native windows; never connect to accounts or change Explorer's state.
const { app, BrowserWindow, screen } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const moduleRoot = process.env.DOCK_ORDER_PACKAGE || path.resolve(__dirname, '..');
const { createDockWindow } = require(path.join(moduleRoot, 'dock-window.cjs'));
const { windowHandle, loadNative } = require(path.join(moduleRoot, 'dock-z-order.cjs'));
const k = require('koffi'), u = k.load('user32.dll');
const foreground = u.func('uintptr_t __stdcall GetForegroundWindow()');
const getWindow = u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)');
const style = u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)');
const find = u.func('uintptr_t __stdcall FindWindowW(str16,str16)');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const reportPath = path.resolve('../Build/dock-fullscreen-native.json');
app.setPath('userData', path.resolve('../Build/dock-fullscreen-qa'));
async function until(check, label, timeout = 4000) {
  const started = Date.now();
  while (!check() && Date.now() - started < timeout) await wait(30);
  assert.ok(check(), label);
}
app.whenReady().then(async () => {
  let dock, player;
  const result = { passed: false, cycles: 0 };
  try {
    const display = screen.getPrimaryDisplay();
    player = new BrowserWindow({ show: false, width: 640, height: 400,
      x: display.workArea.x + 100, y: display.workArea.y + 100,
      webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
    await player.loadURL('data:text/html,<title>Fullscreen regression</title><body style="background:%2313202b;color:white">Isolated fullscreen QA</body>');
    // Start-Process Hidden supplies SW_HIDE for the first native ShowWindow.
    // Cycle only this test window before checking genuine visible fullscreen.
    player.show(); player.hide(); player.show(); player.focus();
    await until(() => loadNative().visible(windowHandle(player)), 'test player natively visible');
    await until(() => BigInt(foreground()) === windowHandle(player), 'test player foreground');
    dock = createDockWindow({ url: 'data:text/html,<title>Dock QA</title><body>Dock QA</body>' });
    const win = dock.ensure(); dock.place();
    await until(() => win.isVisible(), 'normal taskbar dock visible');
    const taskbar = find('Shell_TrayWnd', null);
    await until(() => BigInt(getWindow(taskbar, 3)) === windowHandle(win), 'dock directly above taskbar');
    assert.equal(BigInt(foreground()), windowHandle(player), 'dock did not steal focus');
    for (let i = 0; i < 3; i++) {
      player.setFullScreen(true);
      await until(() => !win.isVisible() && dock.why() === 'fullscreen', 'fullscreen hides dock');
      // Stress other showing paths while fullscreen is still active.
      for (let j = 0; j < 5; j++) {
        dock.applyLayout({ expanded: true, cardPx: 290 + j, width: 200 }); dock.place();
      }
      await wait(450);
      assert.equal(win.isVisible(), false, 'layout updates never raise over fullscreen');
      assert.equal(BigInt(foreground()), windowHandle(player), 'fullscreen keeps focus');
      player.setFullScreen(false);
      await until(() => win.isVisible(), 'leaving fullscreen restores without mouse movement');
      result.cycles++;
    }
    player.maximize();
    await wait(500);
    assert.equal(win.isVisible(), true, 'ordinary maximized app leaves taskbar dock visible');
    player.unmaximize();
    dock.setVisible(false, 'sharing');
    player.setFullScreen(true); await wait(400);
    player.setFullScreen(false); await wait(500);
    assert.equal(win.isVisible(), false, 'fullscreen exit does not override page hiding');
    dock.setVisible(true); await until(() => win.isVisible(), 'page can show again');
    result.passed = true;
    result.topmostMatchesTaskbar = (Number(style(windowHandle(win), -20)) & 8) === (Number(style(taskbar, -20)) & 8);
    assert.ok(result.topmostMatchesTaskbar);
    result.diagnostics = dock.ownership();
  } catch (error) {
    result.error = error.stack; result.diagnostics = dock?.ownership(); result.why = dock?.why();
    const native = loadNative();
    result.observation = { frame: native.frame(foreground()), monitor: native.monitorRect(foreground()),
      taskbarMonitor: native.monitorRect(native.find('Shell_TrayWnd', null)),
      visible: native.visible(foreground()), minimized: native.minimized(foreground()),
      cloaked: native.cloaked(foreground()), className: native.className(foreground()) };
    result.player = { fullscreen: player?.isFullScreen(), bounds: player?.getBounds(),
      foreground: String(foreground()), handle: player && String(windowHandle(player)) };
    process.exitCode = 1;
  }
  finally {
    dock?.destroy(); if (player && !player.isDestroyed()) player.destroy();
    fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
    app.exit(process.exitCode || 0);
  }
});
