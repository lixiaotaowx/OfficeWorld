const { ipcMain, shell, dialog, nativeImage, app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { trusted, OFFICE_URL } = require('./policy.cjs');
const { applyFullscreenState, setWindowFullscreen } = require('./fullscreen.cjs');

function installChrome(window) {
  const actions = {
    minimize: () => window.minimize(),
    maximize: () => window.isMaximized() ? window.unmaximize() : window.maximize(),
    close: () => window.close(),
    devices: () => shell.openExternal('ms-settings:sound'),
    microphone: () => shell.openExternal('ms-settings:privacy-microphone'),
    reload: () => window.webContents.reload(),
    browser: () => shell.openExternal(OFFICE_URL),
    quit: () => app.quit(),
    zoomIn: () => window.webContents.setZoomLevel(Math.min(3, window.webContents.getZoomLevel() + .5)),
    zoomOut: () => window.webContents.setZoomLevel(Math.max(-2, window.webContents.getZoomLevel() - .5)),
    zoomReset: () => window.webContents.setZoomLevel(0),
    fullscreen: () => setWindowFullscreen(window, !window.isFullScreen()),
    permissions: () => dialog.showMessageBox(window, {
      title: "iruler dream · 声音和共享", message: "在一个空间里一起工作",
      detail: "在设备设置里选 Windows 的扬声器和麦克风。\n打开麦克风后才会录音；共享屏幕要先选一块屏幕或一个窗口。\n关掉窗口后通话和共享还在托盘里继续，要退出请选“退出”。",
    }),
  };
  const allow = event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame ||
        !trusted(event.senderFrame.url)) throw Error('Untrusted desktop chrome request');
  };
  ipcMain.handle('officeworld:resources', event => {
    allow(event);
    return {
      html: fs.readFileSync(path.join(__dirname, 'chrome.html'), 'utf8'),
      css: fs.readFileSync(path.join(__dirname, 'chrome.css'), 'utf8'),
      theme: fs.readFileSync(path.join(__dirname, 'desktop-theme.css'), 'utf8'),
      icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icon.ico')).toDataURL(),
    };
  });
  ipcMain.handle('officeworld:action', (event, action) => {
    allow(event);
    if (!Object.hasOwn(actions, action)) throw Error('Unknown desktop action');
    return actions[action]();
  });
  window.on('page-title-updated', event => { event.preventDefault(); window.setTitle('iruler dream'); });

  const setMaximized = value => {
    if (window.isDestroyed() || window.webContents.isDestroyed()) return;
    void window.webContents
      .executeJavaScript(`document.documentElement.classList.toggle('officeworld-maximized', ${value});`, true)
      .catch(() => {});
  };
  window.on('maximize', () => setMaximized(true));
  window.on('unmaximize', () => setMaximized(false));
  window.on('enter-full-screen', () => applyFullscreenState(window, true));
  window.on('leave-full-screen', () => applyFullscreenState(window, false));

  window.webContents.on('did-navigate', () => { setWindowFullscreen(window, false); });
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    let action;
    if (input.key === 'F11') action = 'fullscreen';
    if (input.control || input.meta) {
      action = ({ r: 'reload', R: 'reload', '0': 'zoomReset', '+': 'zoomIn', '=': 'zoomIn', '-': 'zoomOut' })[input.key];
    }
    if (action) { event.preventDefault(); void actions[action](); }
  });
  window.once('closed', () => {
    ipcMain.removeHandler('officeworld:resources');
    ipcMain.removeHandler('officeworld:action');
  });
}
module.exports = { installChrome };
