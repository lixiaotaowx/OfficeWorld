

const electron = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const CHANNEL = 'office:annotation-strokes';

function boundsForDisplay(displays, displayId) {
  const wanted = String(displayId ?? '');
  const match = displays.find((display) => String(display.id) === wanted);
  const fallback = displays[0];
  const target = match || fallback;
  return target ? { ...target.bounds } : { x: 0, y: 0, width: 1280, height: 720 };
}

function createAnnotationLayer(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || electron.BrowserWindow;
  const screenApi = overrides.screen || electron.screen;
  const windowOptions = overrides.windowOptions || {};
  let layer;
  let targetDisplayId = '';
  let visible = false;

  function place() {
    if (!layer || layer.isDestroyed()) return;
    const bounds = boundsForDisplay(screenApi.getAllDisplays(), targetDisplayId);

    const current = typeof layer.getBounds === 'function' ? layer.getBounds() : undefined;
    if (current && current.x === bounds.x && current.y === bounds.y &&
        current.width === bounds.width && current.height === bounds.height) return;
    layer.setBounds(bounds);
  }

  function create() {
    const bounds = boundsForDisplay(screenApi.getAllDisplays(), targetDisplayId);
    layer = new BrowserWindow({
      ...bounds,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      focusable: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,

      enableLargerThanScreen: true,
      webPreferences: {
        preload: path.join(__dirname, 'annotation-overlay-preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
      ...windowOptions,
    });
    layer.setAlwaysOnTop(true, 'screen-saver');
    layer.setIgnoreMouseEvents(true, { forward: true });

    layer.setContentProtection(false);
    layer.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    layer.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    layer.webContents.on('will-navigate', (event) => event.preventDefault());
    layer.on('closed', () => { layer = undefined; });
    void layer.loadFile(path.join(__dirname, 'annotation-overlay.html')).catch(() => {});

    layer.webContents.on('did-finish-load', () => place());
    screenApi.on?.('display-metrics-changed', () => { if (visible) place(); });
    return layer;
  }

  return {

    open(displayId) {
      targetDisplayId = displayId == null ? '' : String(displayId);
      if (!layer || layer.isDestroyed()) create();
      else place();
      visible = true;
      if (layer && !layer.isDestroyed()) layer.showInactive();
      return true;
    },

    target(displayId) {
      targetDisplayId = displayId == null ? '' : String(displayId);
      if (!targetDisplayId) return this.close();
      if (layer && !layer.isDestroyed()) place();
      return true;
    },
    close() {
      visible = false;
      if (layer && !layer.isDestroyed()) layer.hide();
      return true;
    },

    push(payload) {
      if (!layer || layer.isDestroyed()) return false;
      layer.webContents.send(CHANNEL, payload);
      return true;
    },
    isOpen: () => Boolean(layer) && !layer.isDestroyed(),
    isVisible: () => visible,
    displayId: () => targetDisplayId,
    bounds: () => boundsForDisplay(screenApi.getAllDisplays(), targetDisplayId),

    window: () => layer,
  };
}

module.exports = { createAnnotationLayer, boundsForDisplay, CHANNEL };
