const { app, Tray, Menu, nativeImage } = require('electron');

/** Closing hides the existing webContents, preserving calls and login state. */
function installTray(window, iconPath) {
  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) throw Error('无法加载应用图标');
  const tray = new Tray(icon);
  let quitting = false;
  const show = () => {
    if (window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  };
  const quit = () => { quitting = true; app.quit(); };
  const menu = Menu.buildFromTemplate([
    { label: '打开 iruler dream', click: show },
    { type: 'separator' },
    { label: '退出 iruler dream', click: quit },
  ]);
  tray.setToolTip('iruler dream · 一起在场');
  tray.setContextMenu(menu);
  tray.on('click', show);
  tray.on('double-click', show);
  window.on('close', event => {
    if (quitting || tray.isDestroyed()) return;
    event.preventDefault();
    window.hide();
  });
  // Windows session shutdown does not necessarily emit app.before-quit.
  const allowQuit = () => { quitting = true; };
  window.on('query-session-end', allowQuit);
  window.on('session-end', allowQuit);
  app.on('before-quit', allowQuit);
  app.once('will-quit', () => {
    app.removeListener('before-quit', allowQuit);
    if (!tray.isDestroyed()) tray.destroy();
  });
  return { tray, menu, show, quit };
}

module.exports = { installTray };
