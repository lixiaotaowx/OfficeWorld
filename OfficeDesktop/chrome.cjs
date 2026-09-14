const { ipcMain, shell, dialog, nativeImage, app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { trusted, OFFICE_URL } = require('./policy.cjs');

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
    fullscreen: () => window.setFullScreen(!window.isFullScreen()),
    permissions: () => dialog.showMessageBox(window, {
      title: 'iruler dream · 声音与共享', message: '让协作自然发生',
      detail: '设备管理可选择 Windows 扬声器与麦克风。\n开麦后才采集声音；高清共享仍需选择窗口或屏幕。\n关闭窗口会留在托盘，通话和共享继续；选择“退出”才结束程序。',
    }),
  };
  const allow = event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame ||
        !trusted(event.senderFrame.url)) throw Error('Untrusted desktop chrome request');
  };
  ipcMain.handle('dream:resources', event => {
    allow(event);
    return {
      html: fs.readFileSync(path.join(__dirname, 'chrome.html'), 'utf8'),
      css: fs.readFileSync(path.join(__dirname, 'chrome.css'), 'utf8'),
      theme: fs.readFileSync(path.join(__dirname, 'desktop-theme.css'), 'utf8'),
      icon: nativeImage.createFromPath(path.join(__dirname, 'assets/icon.ico')).toDataURL(),
    };
  });
  ipcMain.handle('dream:action', (event, action) => {
    allow(event);
    if (!Object.hasOwn(actions, action)) throw Error('Unknown desktop action');
    return actions[action]();
  });
  window.on('page-title-updated', event => { event.preventDefault(); window.setTitle('iruler dream'); });
  // The window is rounded by CSS, so a maximized/full-screen window must drop the
  // radius to fill the work area. The page gets a class; chrome.css reacts to it.
  const setMaximized = value => {
    if (window.isDestroyed() || window.webContents.isDestroyed()) return;
    void window.webContents
      .executeJavaScript(`document.documentElement.classList.toggle('iruler-maximized', ${value});`, true)
      .catch(() => {});
  };
  window.on('maximize', () => setMaximized(true));
  window.on('unmaximize', () => setMaximized(false));
  window.on('enter-full-screen', () => setMaximized(true));
  window.on('leave-full-screen', () => setMaximized(false));
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
    ipcMain.removeHandler('dream:resources');
    ipcMain.removeHandler('dream:action');
  });
}
module.exports = { installChrome };
