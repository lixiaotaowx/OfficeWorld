// Persistent low-rate screen capture for the workstation preview.
//
// Measuring the old path showed the cost is not the JPEG (0.8ms) but
// `desktopCapturer.getSources()`, which re-captures every display and took ~552ms
// - every three seconds, in the main process. This keeps one small capture stream
// alive instead and only reads the newest frame, which costs a few milliseconds.
//
// The visible behaviour is unchanged: the selected display, a low-resolution JPEG
// at a slow interval, no picker, no self-preview window, no video transport.
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
  let ready;              // resolves once the hidden page can accept a source id
  let sourceId = '';      // the display the stream is currently attached to
  let starting = null;    // in-flight start, so concurrent frames share one
  let supported = true;   // false once the stream API proves unusable

  function ensureWindow() {
    if (window && !window.isDestroyed()) return window;
    const captureSession = sessionApi.fromPartition('preview-capture');
    if (!captureSession.__officeCaptureAllowed) {
      // Only this hidden page may ask for a capture stream; nothing else uses this
      // partition, and the public site never reaches it.
      captureSession.setPermissionRequestHandler((wc, permission, callback) => {
        callback(permission === 'media' && wc === window?.webContents);
      });
      captureSession.__officeCaptureAllowed = true;
    }
    window = new BrowserWindow({
      show: false,
      width: 320, height: 200,
      webPreferences: {
        session: captureSession,
        preload: path.join(__dirname, 'preview-capture-preload.cjs'),
        contextIsolation: true, nodeIntegration: false, sandbox: true,
        backgroundThrottling: false,
      },
      ...windowOptions,
    });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event) => event.preventDefault());
    window.on('closed', () => { window = undefined; ready = undefined; sourceId = ''; });
    ready = window.loadFile(path.join(__dirname, 'preview-capture.html'))
      .then(() => window.webContents)
      .catch(() => undefined);
    return window;
  }

  async function call(channel, payload) {
    const contents = await ready;
    if (!contents || contents.isDestroyed()) throw Error('预览采集窗口不可用');
    return contents.executeJavaScript(
      `window.previewCapture.${channel}(${JSON.stringify(payload ?? null)})`, true);
  }

  return {
    /** Attach the stream to one display; a different id restarts it. */
    async start(id) {
      if (!supported) throw Error('这台设备的常驻采集不可用');
      if (!id) throw Error('没有可用的显示器');
      if (sourceId === id && !starting) return true;
      ensureWindow();
      starting = (async () => {
        if (sourceId && sourceId !== id) await call('stop').catch(() => false);
        const ok = await call('start', { sourceId: id, maxEdge, frameRate: FRAME_RATE, quality: JPEG_QUALITY });
        if (!ok) { supported = false; throw Error('常驻采集启动失败'); }
        sourceId = id;
        return true;
      })().finally(() => { starting = null; });
      return starting;
    },
    /** Newest frame as a JPEG data URL, or null when nothing is attached yet. */
    async frame() {
      if (!sourceId) return null;
      try {
        return await call('frame');
      } catch {
        // The hidden page or its stream died: drop the id so the caller re-attaches.
        sourceId = '';
        throw Error('预览采集中断');
      }
    },
    async stop() {
      sourceId = '';
      if (!window || window.isDestroyed()) return false;
      await call('stop').catch(() => false);
      return true;
    },
    close() {
      sourceId = '';
      if (window && !window.isDestroyed()) window.destroy();
      window = undefined;
      ready = undefined;
    },
    isSupported: () => supported,
    attachedTo: () => sourceId,
    window: () => window,
  };
}

module.exports = { createPreviewCapture, MAX_EDGE, FRAME_RATE, JPEG_QUALITY };
