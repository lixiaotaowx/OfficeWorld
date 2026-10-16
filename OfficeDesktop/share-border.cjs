// 常驻共享提示：只围住实际采集并已共享的显示器，不能影响鼠标与键盘。
const electron = require('electron');
const path = require('node:path');

function createShareBorder(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || electron.BrowserWindow;
  const screen = overrides.screen || electron.screen;
  const layers = new Map();
  const captured = new Set();
  let source = '', active = new Set(), disposed = false;

  function clearLayers() {
    for (const layer of layers.values()) if (!layer.isDestroyed()) layer.destroy();
    layers.clear();
  }
  function sync() {
    if (disposed) return;
    const displays = screen.getAllDisplays();
    const wanted = displays.filter(display => active.has(String(display.id)));
    for (const [id, layer] of layers) {
      if (!wanted.some(display => String(display.id) === id)) {
        layers.delete(id);
        if (!layer.isDestroyed()) layer.destroy();
      }
    }
    for (const display of wanted) {
      const id = String(display.id);
      let layer = layers.get(id);
      if (!layer || layer.isDestroyed()) {
        layer = new BrowserWindow({
          ...display.bounds, show: false, frame: false, transparent: true,
          backgroundColor: '#00000000', hasShadow: false, focusable: false,
          skipTaskbar: true, resizable: false, movable: false, minimizable: false,
          maximizable: false, fullscreenable: false, enableLargerThanScreen: true,
          webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
        });
        const current = layer;
        layers.set(id, current);
        current.setIgnoreMouseEvents(true);
        current.setAlwaysOnTop(true, 'screen-saver');
        current.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        // Windows 把提示层排除在捕获画面之外；对方只收到原来的屏幕内容。
        current.setContentProtection(true);
        current.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        current.webContents.on('will-navigate', event => event.preventDefault());
        current.once('ready-to-show', () => {
          if (!disposed && active.has(id) && layers.get(id) === current && !current.isDestroyed())
            current.showInactive();
        });
        current.on('closed', () => { if (layers.get(id) === current) layers.delete(id); });
        void current.loadFile(path.join(__dirname, 'share-border.html')).catch(() => {
          if (!current.isDestroyed()) current.destroy();
        });
      } else {
        const before = layer.getBounds(), next = display.bounds;
        if (['x', 'y', 'width', 'height'].some(key => before[key] !== next[key])) layer.setBounds(next);
      }
    }
  }
  const displayEvents = ['display-added', 'display-removed', 'display-metrics-changed'];
  for (const event of displayEvents) screen.on?.(event, sync);
  const reset = () => { source = ''; captured.clear(); active.clear(); clearLayers(); };
  return {
    // 权限处理器选定的真实来源；改预览选项本身不会改这份记录。
    captured(displayId) {
      source = typeof displayId === 'string' ? displayId : '';
      if (source) captured.add(source);
    },
    source: () => source,
    show(ids) {
      if (disposed || !Array.isArray(ids) || ids.length > 32 ||
          ids.some(id => typeof id !== 'string' || !captured.has(id))) return false;
      active = new Set(ids);
      sync();
      return true;
    },
    reset,
    sync,
    destroy() {
      disposed = true;
      for (const event of displayEvents) screen.removeListener?.(event, sync);
      reset();
    },
  };
}

module.exports = { createShareBorder };
