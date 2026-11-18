

const electron = require('electron');
const path = require('node:path');

const MAX_EDGE = 300;
const FRAME_RATE = 2;
const JPEG_QUALITY = 55;

function createPreviewCapture(overrides = {}) {
  const BrowserWindow = overrides.BrowserWindow || electron.BrowserWindow;
  const sessionApi = overrides.session || electron.session;
  const windowOptions = overrides.windowOptions || {};
  const maxEdge = overrides.maxEdge || MAX_EDGE;
  let window;
  let ready;
  let sourceId = '';
  let starting = null;
  let startingId = '';
  let generation = 0;
  let supported = true;

  function destroyWindow() {
    generation++;
    const old = window;
    window = undefined; ready = undefined; sourceId = ''; starting = null; startingId = '';
    if (old && !old.isDestroyed()) old.destroy();
  }

  function ensureWindow() {
    if (window && !window.isDestroyed()) return window;
    const captureSession = sessionApi.fromPartition('preview-capture');
    if (!captureSession.__officeCaptureAllowed) {

      captureSession.setPermissionRequestHandler((wc, permission, callback) => {
        callback(!overrides.denyMedia && permission === 'media' && wc === window?.webContents);
      });
      captureSession.__officeCaptureAllowed = true;
    }
    const created = new BrowserWindow({
      show: false,
      width: 320, height: 200,
      webPreferences: {
        session: captureSession,
        preload: overrides.preload || path.join(__dirname, 'preview-capture-preload.cjs'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
        backgroundThrottling: false,
      },
      ...windowOptions,
    });
    window = created;
    created.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    created.webContents.on('will-navigate', (event) => event.preventDefault());
    created.on('closed', () => { if (window === created) { window = undefined; ready = undefined; sourceId = ''; } });
    ready = created.loadFile(path.join(__dirname, 'preview-capture.html'))
      .then(() => created.webContents)
      .catch(() => undefined);
    return window;
  }

  async function call(channel, payload) {
    const contents = await ready;
    if (!contents || contents.isDestroyed()) throw Error("Preview capture window unavailable");
    return contents.executeJavaScript(
      `window.previewCapture.${channel}(${JSON.stringify(payload ?? null)})`, true);
  }

  return {

    async start(id) {
      if (!supported) throw Error("Continuous capture is unavailable on this device");
      if (!id) throw Error("No display available");
      if (sourceId === id && !starting) return true;
      if (starting && startingId === id) return starting;
      if (starting) destroyWindow();
      const current = ensureWindow(), request = generation;
      const attempt = (async () => {
        if (sourceId && sourceId !== id) await call('stop').catch(() => false);
        if (generation !== request || window !== current) return false;
        const ok = await call('start', { sourceId: id, maxEdge, frameRate: FRAME_RATE, quality: JPEG_QUALITY });
        if (generation !== request || window !== current) return false;
        if (!ok) { supported = false; throw Error("Unable to start continuous capture"); }
        sourceId = id;
        return true;
      })();
      const tracked = attempt.catch(error => { if (generation !== request || window !== current) return false; throw error; })
        .finally(() => { if (starting === tracked) { starting = null; startingId = ''; } });
      starting = tracked; startingId = id;
      return tracked;
    },

    async frame() {
      if (!sourceId) return null;
      const request = generation;
      try {
        const image = await call('frame');
        return generation === request ? image : null;
      } catch {
        if (generation !== request) return null;

        sourceId = '';
        throw Error("Preview capture interrupted");
      }
    },
    async stop() {
      const existed = Boolean(window && !window.isDestroyed());
      // Destroying the hidden page ends its media stream and frees its renderer.
      destroyWindow();
      return existed;
    },
    close() {
      destroyWindow();
    },
    isSupported: () => supported,
    attachedTo: () => sourceId,
    window: () => window,
  };
}

module.exports = { createPreviewCapture, MAX_EDGE, FRAME_RATE, JPEG_QUALITY };
