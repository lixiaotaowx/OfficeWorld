const { app, Tray, Menu, nativeImage } = require('electron');

const TRAY_ICON_PX = 16;

function installTray(getWindow, iconPath, options = {}) {
  const autoStart = options.autoStart;
  const source = nativeImage.createFromPath(iconPath);
  if (source.isEmpty()) throw Error("Unable to load the application icon");
  const tray = new Tray(source.resize({ width: TRAY_ICON_PX, height: TRAY_ICON_PX, quality: 'best' }));
  let quitting = false;
  let attached;

  const allowQuit = () => { quitting = true; };

  const onClose = event => {
    if (quitting || tray.isDestroyed()) return;
    const window = getWindow();
    if (!window || window !== attached || window.isDestroyed()) return;
    // Closing only hides the hall. The page behind it feeds the taskbar avatars,
    // chat and calls, so it stays; the 3D scene lets go of the GPU by itself.
    event.preventDefault();
    window.hide();
  };

  const attach = window => {
    if (!window || window.isDestroyed?.() || window === attached) return;
    if (attached) {
      attached.removeListener('close', onClose);
      attached.removeListener('query-session-end', allowQuit);
      attached.removeListener('session-end', allowQuit);
    }
    attached = window;
    window.on('close', onClose);
    window.on('query-session-end', allowQuit);
    window.on('session-end', allowQuit);
    window.once('closed', () => { if (attached === window) attached = undefined; });
  };

  const show = () => {
    if (quitting) return;
    let window = getWindow();
    if (!window || window.isDestroyed()) window = options.createWindow?.({ show: true });
    if (!window || window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show();
    window.focus();
    options.onShow?.();
  };
  const quit = () => { quitting = true; app.quit(); };
  const template = [
    { label: "Open iruler dream", click: show },
    { type: 'separator' },
  ];

  if (autoStart?.supported()) {
    template.push({
      label: "Launch at sign-in",
      type: 'checkbox',
      checked: autoStart.enabled(),
      click: (item) => { autoStart.set(item.checked); item.checked = autoStart.enabled(); },
    });
    template.push({ type: 'separator' });
  }

  if (options.dock) {
    template.push({
      label: "Show taskbar avatars",
      type: 'checkbox',
      checked: options.dock.enabled?.() !== false,
      click: (item) => { options.dock.set?.(item.checked); item.checked = options.dock.enabled?.() !== false; },
    });
    template.push({ type: 'separator' });
  }

  if (options.glow) {
    template.push({ label: "Preview screen glow", click: () => options.glow.flash?.() });
    template.push({ type: 'separator' });
  }
  template.push({ label: "Quit iruler dream", click: quit });
  const menu = Menu.buildFromTemplate(template);
  tray.setToolTip("iruler dream · Together in one space");
  tray.setContextMenu(menu);
  tray.on('click', show);
  tray.on('double-click', show);
  app.on('before-quit', allowQuit);
  app.once('will-quit', () => {
    app.removeListener('before-quit', allowQuit);
    if (!tray.isDestroyed()) tray.destroy();
  });
  return { tray, menu, show, quit, attach, isQuitting: () => quitting };
}

module.exports = { installTray, TRAY_ICON_PX };
