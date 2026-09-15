// The sharer's screen layer.
//
// When the desktop app shares a *display*, the people watching can draw on it.
// Those strokes must appear where the sharer is actually looking, which is usually
// another application - not our page. So the app opens a transparent,
// click-through, always-on-top window exactly over the shared display and draws
// the strokes there.
//
// Three properties matter and are easy to get wrong:
//   * setIgnoreMouseEvents(true, { forward: true }) - the sharer keeps working;
//     clicks must pass straight through to whatever is underneath.
//   * setAlwaysOnTop(true, 'screen-saver') - a normal topmost window would drop
//     behind full-screen apps.
//   * setContentProtection(false) - this layer MUST be captured. Annotation works
//     like a remote-desktop tool: the stroke is painted here, on the screen being
//     shared, and the screen share carries it to every viewer. Excluding this
//     window from the capture (the earlier setting) is exactly what forced a second
//     copy of the strokes to be drawn over the video in the app.
const electron = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const CHANNEL = 'office:annotation-strokes';

/** Bounds of the shared display, falling back to the primary one. */
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
    // The page maps strokes against its own content box, so the layer must cover the
    // shared display exactly. Skipping an identical setBounds avoids a flicker, and
    // re-fitting when the display changes keeps that invariant on every resolution.
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
      // A display can be larger than the primary work area.
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
    // Captured on purpose: the strokes are meant to travel inside the shared picture.
    layer.setContentProtection(false);
    layer.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    layer.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    layer.webContents.on('will-navigate', (event) => event.preventDefault());
    layer.on('closed', () => { layer = undefined; });
    void layer.loadFile(path.join(__dirname, 'annotation-overlay.html')).catch(() => {});
    // The window is sized before the page exists; re-fit once it is live, and again
    // whenever the display's resolution or scaling changes under a running share.
    layer.webContents.on('did-finish-load', () => place());
    screenApi.on?.('display-metrics-changed', () => { if (visible) place(); });
    return layer;
  }

  return {
    /** Remember which display is being shared and cover it with the layer. */
    open(displayId) {
      targetDisplayId = displayId == null ? '' : String(displayId);
      if (!layer || layer.isDestroyed()) create();
      else place();
      visible = true;
      if (layer && !layer.isDestroyed()) layer.showInactive();
      return true;
    },
    /**
     * Record the share target without showing anything. An empty id means the
     * sharer picked a window, which cannot be mapped onto the desktop: the layer
     * stays off and the strokes are only drawn on the shared picture.
     */
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
    /** Push the current board to the layer; an empty board clears it. */
    push(payload) {
      if (!layer || layer.isDestroyed()) return false;
      layer.webContents.send(CHANNEL, payload);
      return true;
    },
    isOpen: () => Boolean(layer) && !layer.isDestroyed(),
    isVisible: () => visible,
    displayId: () => targetDisplayId,
    bounds: () => boundsForDisplay(screenApi.getAllDisplays(), targetDisplayId),
    /** Exposed for tests: the window when it exists. */
    window: () => layer,
  };
}

module.exports = { createAnnotationLayer, boundsForDisplay, CHANNEL };
