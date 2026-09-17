const { ipcMain, desktopCapturer, screen, safeStorage, app, Notification, powerMonitor } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { createUpdater } = require('./update.cjs');
const { trusted } = require('./policy.cjs');
const { setWindowFullscreen } = require('./fullscreen.cjs');

function installDesktopBridge(getWindow, dependencies = {}) {
  const annotationLayer = dependencies.annotationLayer;
  const displays = dependencies.displays;
  const previewCapture = dependencies.previewCapture;
  const credentials = path.join(app.getPath('userData'), 'login.enc');
  /** Preview edge and JPEG quality; the stream is configured with these once. */
  const PREVIEW_MAX_EDGE = 300;
  const PREVIEW_QUALITY = 55;
  let pending;
  const allow = event => {
    const window = getWindow();
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame ||
        !trusted(event.senderFrame.url)) throw Error('Untrusted desktop request');
  };
  async function sources() {
    const rows = await displays.list(desktopCapturer, screen);
    const chosen = rows.find((row) => row.selected) ||
      rows.find((row) => row.id === String(screen.getPrimaryDisplay().id)) || rows[0];
    return { sources: rows.map((row) => row.source), chosen: chosen?.source,
      list: rows.map(({ source: _source, ...rest }) => rest) };
  }
  const handle = (name, fn) => ipcMain.handle(name, (event, ...args) => { allow(event); return fn(...args); });
  handle('office:displays', async () => (await sources()).list);
  handle('office:display-select', async id => {
    const rows = await displays.list(desktopCapturer, screen);
    const source = rows.find((row) => row.id === id);
    if (!source) throw Error('屏幕已断开，请重新选择');
    displays.select(source.id);
    // The preview follows the selection, so drop the running stream; the next frame
    // re-attaches it to the newly chosen display.
    await previewCapture?.stop().catch(() => {});
    return true;
  });
  handle('office:preview-active', active => {
    // The page reports whether anybody could receive its preview; when nobody can,
    // the capture stream is released instead of quietly running forever.
    if (active === false) void previewCapture?.stop().catch(() => {});
    return Boolean(previewCapture?.attachedTo());
  });
  handle('office:preview-frame', async () => {
    // Preferred path: one long-lived small capture stream, so a frame costs a few
    // milliseconds instead of re-capturing every display (~552ms measured).
    if (previewCapture?.isSupported()) {
      try {
        if (!previewCapture.attachedTo()) {
          const { chosen } = await sources();
          if (!chosen) throw Error('暂时无法读取屏幕');
          await previewCapture.start(chosen.id);
        }
        const image = await previewCapture.frame();
        if (image) return image;
      } catch { /* fall through to the legacy path so previews never stop working */ }
    }
    if (pending) return pending;
    pending = sources().then(({ chosen }) => {
      if (!chosen || chosen.thumbnail.isEmpty()) throw Error('暂时无法读取屏幕');
      const size = chosen.thumbnail.getSize();
      const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(size.width, size.height));
      const thumb = chosen.thumbnail.resize({ width: Math.max(1, Math.round(size.width * scale)),
        height: Math.max(1, Math.round(size.height * scale)) });
      return 'data:image/jpeg;base64,' + thumb.toJPEG(PREVIEW_QUALITY).toString('base64');
    }).finally(() => { pending = undefined; });
    return pending;
  });
  handle('office:login-save', value => {
    if (!value || typeof value.name !== 'string' || typeof value.password !== 'string' ||
        value.name.length > 24 || !value.password.length || value.password.length > 16) throw Error('Invalid login');
    if (!safeStorage.isEncryptionAvailable()) return false;
    fs.writeFileSync(credentials, safeStorage.encryptString(JSON.stringify(value)));
    return true;
  });
  handle('office:login-read', () => {
    try { return JSON.parse(safeStorage.decryptString(fs.readFileSync(credentials))); } catch { return null; }
  });
  handle('office:focus', () => {
    const window = getWindow();
    if (window.isMinimized()) window.restore();
    window.show(); window.focus(); return true;
  });
  // Incoming call / voice / meeting alerts. A renderer HTML5 Notification is not
  // dependable once the window is hidden in the tray, so the alert is raised from
  // the main process: a native toast, plus a real window raise and taskbar flash
  // for the ring-type events. Ordinary chat only gets the toast and a flash.
  const attention = () => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show(); window.moveTop(); window.focus();
    window.flashFrame(true);
    // A short top-most pulse is what actually lifts the window above a maximized
    // or fullscreen app on Windows; it is released again so stacking stays normal.
    window.setAlwaysOnTop(true);
    setTimeout(() => { if (!window.isDestroyed()) window.setAlwaysOnTop(false); }, 1200);
  };
  handle('office:alert', payload => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return false;
    const text = value => (typeof value === 'string' ? value : '');
    const title = text(payload?.title).slice(0, 80);
    const body = text(payload?.body).slice(0, 220);
    const section = text(payload?.section).slice(0, 32);
    const urgent = payload?.urgent === true;
    if (Notification.isSupported()) {
      const toast = new Notification({ title: title || 'iruler dream', body, silent: true });
      toast.on('click', () => {
        const current = getWindow();
        if (current && !current.isDestroyed()) current.webContents.send('office:alert-open', section);
        attention();
      });
      toast.show();
    }
    if (urgent) attention();
    else if (window.isVisible() && !window.isFocused()) window.flashFrame(true);
    return true;
  });
  handle('office:login-clear', () => { fs.rmSync(credentials, { force: true }); return true; });
  // 在座 / 离桌: how long ago the user touched the mouse or keyboard **anywhere in
  // Windows**, not just in this window. Working in Word or on another screen still
  // counts as sitting at the desk (user, 2026-09-15), which the page cannot see on
  // its own. `state` is 'active' | 'idle' | 'locked' | 'unknown'.
  handle('office:system-idle', () => {
    try {
      return { seconds: powerMonitor.getSystemIdleTime(), state: powerMonitor.getSystemIdleState(1) };
    } catch {
      return null; // No power monitor on this platform: the page falls back to its own input watch.
    }
  });
  // Native full screen. The DOM Fullscreen API is a no-op inside this window
  // (frameless + transparent), and its enter/leave events do not fire either, so the
  // requested state is applied and reported here rather than awaited from the window.
  handle('office:fullscreen', value => setWindowFullscreen(getWindow(), value === true));
  // Annotation layer over the shared display. "attach" only succeeds for a
  // display share; a window share has no place on the desktop to draw on.
  handle('office:annotation-layer', enabled => {
    if (!annotationLayer) return { ok: false, reason: 'unsupported' };
    if (enabled === false) { annotationLayer.close(); return { ok: true }; }
    if (!annotationLayer.displayId()) return { ok: false, reason: 'window-share' };
    annotationLayer.open(annotationLayer.displayId());
    return { ok: true };
  });
  handle('office:annotation-push', message => {
    if (!annotationLayer || !annotationLayer.isOpen()) return false;
    if (!message || typeof message !== 'object') return false;
    if (!['annotate', 'undo'].includes(message.type)) return false;
    return annotationLayer.push(message);
  });
  handle('office:annotation-clear', () => {
    if (!annotationLayer || !annotationLayer.isOpen()) return false;
    return annotationLayer.push({ type: 'clear' });
  });
  // In-app update (user, 2026-09-17). The page asks for its own version, downloads the
  // installer the site published (progress goes back over IPC), then starts it and quits.
  const updater = createUpdater({
    // The bridge already holds this window's Electron `app`; handing it over keeps the
    // update folder, the version and the quit in one place.
    app,
    onProgress: payload => {
      const window = getWindow();
      if (window && !window.isDestroyed()) window.webContents.send('office:update-progress', payload);
    },
  });
  handle('office:app-version', () => app.getVersion());
  handle('office:update-download', (url, sha256) => updater.download(url, sha256));
  handle('office:update-reveal', file => updater.reveal(file));
  handle('office:update-install', file => updater.install(file));
}
module.exports = { installDesktopBridge };
