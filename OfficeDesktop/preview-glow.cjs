

const path = require('node:path');

const GLOW_MS = 4300;

const DEFAULT_FADE_MS = 0;

const MAX_FADE_MS = 10000;
const CHANNEL = 'office:preview-glow';

function createPreviewGlow(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || require('electron').BrowserWindow;
  const screenApi = overrides.screen || require('electron').screen;
  const preload = overrides.preload || path.join(__dirname, 'preview-glow-preload.cjs');
  const glowMs = overrides.glowMs ?? GLOW_MS;
  const setTimeoutFn = overrides.setTimeout || setTimeout;
  const clearTimeoutFn = overrides.clearTimeout || clearTimeout;

  const layers = new Map();
  let timer;

  let lastFade = DEFAULT_FADE_MS;

  let lastTone = 'watch';
  function notify(layer, fade, restart) {
    const contents = layer.webContents;
    const payload = { at: Date.now(), fade, restart: restart === true, tone: lastTone };
    const send = () => { if (layer.isDestroyed()) return; try { contents.send(CHANNEL, payload); } catch {  } };
    if (typeof contents.isLoading === 'function' && contents.isLoading()) contents.once('did-finish-load', send);
    else send();
  }

  const displays = () => {
    try {
      const all = screenApi.getAllDisplays();
      return all.length ? all : [screenApi.getPrimaryDisplay()];
    } catch {
      return [];
    }
  };

  function create(display) {
    const layer = new BrowserWindow({
      ...display.bounds,
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
      webPreferences: { preload, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    layer.setAlwaysOnTop(true, 'screen-saver');

    layer.setIgnoreMouseEvents(true);
    layer.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    layer.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    layer.webContents.on('will-navigate', event => event.preventDefault());

    layer.webContents.on('did-finish-load', () => { if (timer) notify(layer, lastFade, true); });
    layer.on('closed', () => { const id = String(display.id); if (layers.get(id) === layer) layers.delete(id); });
    void layer.loadFile(path.join(__dirname, 'preview-glow.html')).catch(() => {});
    layers.set(String(display.id), layer);
    return layer;
  }

  function sync(createMissing = false) {
    // Display change events must not create full-screen renderer processes while idle.
    if (!timer && !createMissing) return layers.size;
    const current = displays();
    const wanted = new Set(current.map(display => String(display.id)));
    for (const [id, layer] of [...layers]) {
      if (wanted.has(id) || layer.isDestroyed()) continue;
      layer.destroy();
      layers.delete(id);
    }
    for (const display of current) {
      const id = String(display.id);
      let layer = layers.get(id);
      if (!layer || layer.isDestroyed()) {
        layer = create(display);
        // A display added during an active glow should receive the same indication.
        if (timer && !createMissing) { layer.showInactive(); notify(layer, lastFade, true); }
      }
      const bounds = layer.getBounds();
      const box = display.bounds;
      if (bounds.x !== box.x || bounds.y !== box.y || bounds.width !== box.width || bounds.height !== box.height) {
        layer.setBounds(box);
      }
    }
    return layers.size;
  }

  function hide() {
    timer = undefined;
    // These layers occupy a renderer and a screen-sized surface per display.
    for (const layer of layers.values()) if (!layer.isDestroyed()) layer.destroy();
    layers.clear();
  }

  return {

    flash(options = {}) {
      const fade = Math.max(0, Math.min(MAX_FADE_MS, Number(options?.fade) || DEFAULT_FADE_MS));
      lastFade = fade;
      lastTone = options?.tone === 'call' ? 'call' : 'watch';
      sync(true);
      if (timer) clearTimeoutFn(timer);
      timer = setTimeoutFn(hide, glowMs);
      timer?.unref?.();
      for (const layer of layers.values()) {
        if (layer.isDestroyed()) continue;

        const restart = !layer.isVisible();
        if (restart) layer.showInactive();
        notify(layer, fade, restart);
      }
      return layers.size;
    },

    hide() {
      if (timer) clearTimeoutFn(timer);
      timer = undefined;
      hide();
      return true;
    },

    sync,
    glowMs: () => glowMs,
    isVisible: () => [...layers.values()].some(layer => !layer.isDestroyed() && layer.isVisible()),

    count: () => layers.size,
    layerFor: displayId => layers.get(String(displayId)),
    destroy() {
      if (timer) clearTimeoutFn(timer);
      timer = undefined;
      for (const layer of layers.values()) if (!layer.isDestroyed()) layer.destroy();
      layers.clear();
    },
  };
}

module.exports = { createPreviewGlow, GLOW_MS, CHANNEL };
