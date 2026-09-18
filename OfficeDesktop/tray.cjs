const { app, Tray, Menu, nativeImage } = require('electron');

/**
 * The notification area draws at 16 logical pixels. Handing Windows the frame a
 * single-entry 256px .ico decodes to is what produced a blank tray icon, so the tray
 * image is built at that size explicitly. (assets/icon.ico carries 16-256px frames
 * for the exe, window and installer; see tools/build-icons.ps1.)
 */
const TRAY_ICON_PX = 16;

/** Closing hides the existing webContents, preserving calls and login state. */
function installTray(window, iconPath, options = {}) {
  const autoStart = options.autoStart;
  const source = nativeImage.createFromPath(iconPath);
  if (source.isEmpty()) throw Error('无法加载应用图标');
  const tray = new Tray(source.resize({ width: TRAY_ICON_PX, height: TRAY_ICON_PX, quality: 'best' }));
  let quitting = false;
  const show = () => {
    if (window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
  };
  const quit = () => { quitting = true; app.quit(); };
  const template = [
    { label: '打开 iruler dream', click: show },
    { type: 'separator' },
  ];
  // The app owns this registration rather than the installer, so it can be turned off
  // here. A portable build reports unsupported and the row is left out entirely,
  // because its executable path changes on every run.
  if (autoStart?.supported()) {
    template.push({
      label: '开机自动启动',
      type: 'checkbox',
      checked: autoStart.enabled(),
      click: (item) => { autoStart.set(item.checked); item.checked = autoStart.enabled(); },
    });
    template.push({ type: 'separator' });
  }
  // 任务栏头像条的开关：它贴在任务栏上，用户随时能关掉（托盘里再打开）。
  if (options.dock) {
    template.push({
      label: '显示任务栏头像条',
      type: 'checkbox',
      checked: options.dock.enabled?.() !== false,
      click: (item) => { options.dock.set?.(item.checked); item.checked = options.dock.enabled?.() !== false; },
    });
    template.push({ type: 'separator' });
  }
  template.push({ label: '退出 iruler dream', click: quit });
  const menu = Menu.buildFromTemplate(template);
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

module.exports = { installTray, TRAY_ICON_PX };
