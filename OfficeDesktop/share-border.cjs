
const path = require('node:path');

function createShareBorder(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || require('electron').BrowserWindow;
  const screen = overrides.screen || require('electron').screen;
  const layers = new Map();
  const captured = new Set();
  let preview = '';
  let source = '', active = new Set(), disposed = false;

  function clearLayers() {
    for (const layer of layers.values()) if (!layer.isDestroyed()) layer.destroy();
    layers.clear();
  }
  function sync() {
    if (disposed) return;
    const displays = screen.getAllDisplays();
    const wanted = displays.filter(display => (active.has(String(display.id)) || preview === String(display.id)));
    for (const [id, layer] of layers) {
      if (!wanted.some(display => String(display.id) === id) || layer.preview !== !active.has(id)) {
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
        current.preview = !active.has(id);
        current.setIgnoreMouseEvents(true);
        current.setAlwaysOnTop(true, 'screen-saver');
        current.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

        current.setContentProtection(true);
        current.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
        current.webContents.on('will-navigate', event => event.preventDefault());
        current.once('ready-to-show', () => {
          if (!disposed && (active.has(id) || preview === id) && layers.get(id) === current && !current.isDestroyed())
            current.showInactive();
        });
        current.on('closed', () => { if (layers.get(id) === current) layers.delete(id); });
        void current.loadFile(path.join(__dirname, 'share-border.html'), { hash: current.preview ? 'preview' : '' }).catch(() => {
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
  const reset = () => { source = ''; preview = ''; captured.clear(); active.clear(); clearLayers(); };
  return {

    captured(displayId) {
      source = typeof displayId === 'string' ? displayId : '';
      if (source) captured.add(source);
    },
    source: () => source,
    preview(displayId) {
      if (disposed) return;
      const display = screen.getAllDisplays().find(item => String(item.id) === displayId || String(Number(item.id) >>> 0) === displayId);
      preview = display ? String(display.id) : '';
      sync();
    },
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
