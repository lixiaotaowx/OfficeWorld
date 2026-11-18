const { ipcMain, desktopCapturer: nativeDesktopCapturer, screen, safeStorage, app, Notification, powerMonitor, net, shell, dialog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { createUpdater } = require('./update.cjs');
const { createUpdateFallback } = require('./update-fallback.cjs');
const { createPreviewIdleGate } = require('./preview-idle.cjs');
const { trusted, trustedHost, OFFICE_URL } = require('./policy.cjs');
const { setWindowFullscreen } = require('./fullscreen.cjs');
const { grantDockCapture } = require('./dock-capture-intent.cjs');
const { mainWindowVisible } = require('./main-visibility.cjs');

function installDesktopBridge(getWindow, dependencies = {}) {
  const desktopCapturer = dependencies.desktopCapturer || nativeDesktopCapturer;
  const annotationLayer = dependencies.annotationLayer;
  const previewGlow = dependencies.previewGlow;
  const shareBorder = dependencies.shareBorder;
  const displays = dependencies.displays;
  const previewCapture = dependencies.previewCapture;
  const fileTransfer = dependencies.fileTransfer;
  const getHost = dependencies.getHost || (() => undefined);
  const credentials = path.join(app.getPath('userData'), 'login.enc');

  const PREVIEW_MAX_EDGE = 300;
  const PREVIEW_QUALITY = 55;
  let pending;
  let displayGeneration = 0;
  let captureDisplayId = "";
  let previewDisplayId = "";
  const senderIs = (event, target) => Boolean(target) && !target.isDestroyed?.() &&
    event.sender === target.webContents && event.senderFrame === target.webContents.mainFrame;
  // Process identity, not "the only window": main, host and dock are separate
  // renderers with separate channel allowlists.
  const identify = event => {
    const frame = event.senderFrame;
    if (!frame || typeof frame.url !== 'string') return null;
    if (senderIs(event, getWindow()) && trusted(frame.url)) return 'main';
    if (senderIs(event, getHost()) && trustedHost(frame.url)) return 'host';
    if (senderIs(event, dependencies.getDock?.()) && trusted(frame.url)) return 'dock';
    return null;
  };
  async function sources() {
    const rows = await displays.list(desktopCapturer, screen);
    const chosen = displays.choose(rows, screen);
    return { sources: rows.map((row) => row.source), chosen: chosen?.source,
      list: rows.map(({ source: _source, ...rest }) => rest) };
  }
  // Media/capture stays in the main window. The host may read the saved login
  // and report system idle, but it cannot take previews, annotation or capture.
  const HOST_CHANNELS = new Set([
    'office:login-read', 'office:login-clear', 'office:system-idle',
  ]);
  const handle = (name, fn, allowed) => ipcMain.handle(name, (event, ...args) => {
    const kind = identify(event);
    const kinds = allowed || ((HOST_CHANNELS.has(name) || name.startsWith('office:file-'))
      ? ['main', 'host'] : ['main']);
    if (!kind || !kinds.includes(kind)) throw Error('Untrusted desktop request');
    return fn(...args);
  });
  handle('office:main-visible', () => mainWindowVisible(getWindow()));
  // Only these two display controls are shared with the trusted avatar window.
  const displayHandle = (name, fn) => ipcMain.handle(name, (event, ...args) => {
    const kind = identify(event);
    if (kind !== 'main' && kind !== 'dock') throw Error('Untrusted desktop request');
    return fn(kind === 'dock', ...args);
  });
  handle('office:captured-display', () => shareBorder?.source() || '');
  handle('office:sharing-displays', ids => shareBorder?.show(ids) ?? false);
  displayHandle('office:displays', async () => {
    const rows = await displays.list(desktopCapturer, screen);
    return rows.map(({ source, ...rest }) => {
      let thumbnail = '';
      try { if (!source.thumbnail.isEmpty()) thumbnail = source.thumbnail.toDataURL(); } catch { /* Keep unavailable displays selectable. */ }
      return { ...rest, thumbnail };
    });
  });
  displayHandle('office:display-select', async (fromDock, id) => {
    const rows = await displays.list(desktopCapturer, screen);
    const source = rows.find((row) => row.id === id);
    if (!source) throw Error("The display was disconnected. Select another display.");
    displays.select(source.id);
    shareBorder?.preview?.('');
    displayGeneration++;
    pending = undefined;
    captureDisplayId = "";

    await previewCapture?.stop().catch(() => {});
    if (fromDock) {
      const window = getWindow();
      if (window && !window.isDestroyed()) {
        grantDockCapture(window.webContents);
        window.webContents.send('office:display-changed');
      }
    }
    return true;
  });

  const idleGate = createPreviewIdleGate({
    powerMonitor: dependencies.previewPowerMonitor || powerMonitor,
    onChange: paused => { if (paused) { shareBorder?.preview?.(''); void previewCapture?.stop().catch(() => {}); } },
  });
  handle('office:preview-active', active => {

    if (active === false) { displayGeneration++; pending = undefined; shareBorder?.preview?.(''); idleGate.check(); void previewCapture?.stop().catch(() => {}); }
    return Boolean(previewCapture?.attachedTo());
  });
  handle('office:preview-state', () => ({
    paused: idleGate.paused(),
    idleSeconds: Math.round(idleGate.idleSeconds()),
    awayAfter: idleGate.awaySeconds,
    attached: Boolean(previewCapture?.attachedTo()),
  }));
  handle('office:preview-frame', async () => {

    if (idleGate.check()) return null;

    const generation = displayGeneration;
    try {
      let selected = displays.id();
      if (selected && !screen.getAllDisplays().some(d => (String(d.id) === selected || String(Number(d.id) >>> 0) === selected))) {
        // Resolve rebooted/legacy display identifiers before declaring the saved monitor disconnected.
        const rows = await displays.list(desktopCapturer, screen);
        selected = displays.id();
        if (!displays.choose(rows, screen)) {
          shareBorder?.preview?.('');
          await previewCapture?.stop().catch(() => {});
          throw Error('设置的屏幕未连接，请连接该屏幕或在设置中重新选择');
        }
      }
      if (previewCapture?.isSupported()) {
        try {
          if (!previewCapture.attachedTo() || captureDisplayId !== selected) {
            const { chosen } = await sources();
            if (!chosen) throw Error("The display is temporarily unavailable.");
            await previewCapture.start(chosen.id);
            captureDisplayId = selected;
            previewDisplayId = chosen.display_id;
          }
          const image = await previewCapture.frame();
          if (generation !== displayGeneration) throw Error('屏幕选择已改变');
          if (image) { shareBorder?.preview?.(previewDisplayId); return image; }
        } catch { /* fall through to the legacy path so previews never stop working */ }
      }
      if (generation !== displayGeneration) throw Error('屏幕选择已改变');
      if (pending) return pending;
      pending = sources().then(({ chosen }) => {
        if (generation !== displayGeneration) throw Error('屏幕选择已改变');
        if (!chosen || chosen.thumbnail.isEmpty()) throw Error("The display is temporarily unavailable.");
        const size = chosen.thumbnail.getSize();
        const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(size.width, size.height));
        const thumb = chosen.thumbnail.resize({ width: Math.max(1, Math.round(size.width * scale)),
          height: Math.max(1, Math.round(size.height * scale)) });
        const image = 'data:image/jpeg;base64,' + thumb.toJPEG(PREVIEW_QUALITY).toString('base64');
        shareBorder?.preview?.(chosen.display_id);
        return image;
      }).finally(() => { if (generation === displayGeneration) pending = undefined; });
      return await pending;
    } catch (error) {
      if (generation === displayGeneration) shareBorder?.preview?.('');
      throw error;
    }
  });
  handle('office:login-save', value => {
    if (!value || typeof value.name !== 'string' || typeof value.password !== 'string' ||
        value.name.length > 24 || !value.password.length || value.password.length > 16) throw Error('Invalid login');
    if (!safeStorage.isEncryptionAvailable()) return false;
    fs.writeFileSync(credentials, safeStorage.encryptString(JSON.stringify(value)));
    const host = getHost();
    if (host && !host.isDestroyed?.()) host.webContents.send('office:host-auth-refresh');
    return true;
  });
  handle('office:login-read', () => {
    try { return JSON.parse(safeStorage.decryptString(fs.readFileSync(credentials))); } catch { return null; }
  });
  handle('office:focus', () => {
    const window = getWindow();
    if (window.isMinimized()) window.restore();
    window.show(); window.moveTop(); window.focus(); return true;
  });

  const attention = () => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return;
    if (window.isMinimized()) window.restore();
    window.show(); window.moveTop(); window.focus();
    window.flashFrame(true);

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

  handle('office:system-idle', () => {
    try {
      return { seconds: powerMonitor.getSystemIdleTime(), state: powerMonitor.getSystemIdleState(1) };
    } catch {
      return null;
    }
  });

  handle('office:fullscreen', value => setWindowFullscreen(getWindow(), value === true));

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

    if (!['annotate', 'undo', 'clear'].includes(message.type)) return false;
    return annotationLayer.push(message);
  });

  handle('office:preview-glow', payload => {
    if (!previewGlow) return false;
    if (payload?.sharing === true || payload?.on === false) { previewGlow.hide(); return false; }

    return previewGlow.flash({ fade: payload?.fade, tone: payload?.tone === 'call' ? 'call' : 'watch' }) > 0;
  });
  handle('office:annotation-clear', () => {
    if (!annotationLayer || !annotationLayer.isOpen()) return false;
    return annotationLayer.push({ type: 'clear' });
  });

  const updater = createUpdater({
    electron: { app, net, shell },

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
  // The page reports each successful manifest check. When it stops doing so (a broken
  // web release, a page that never loads) the app checks and prompts on its own.
  const updateFallback = (dependencies.createUpdateFallback || createUpdateFallback)({
    app, net, dialog, updater, officeUrl: OFFICE_URL, trusted, getWindow,
    log: message => console.warn(message),
    startDelayMs: dependencies.updateFallbackDelayMs,
  });
  handle('office:update-checked', () => { updateFallback.pageChecked(); return true; });
  updateFallback.start();

  if (fileTransfer) {
    handle('office:file-settings', () => fileTransfer.settings());
    handle('office:file-choose-folder', () => fileTransfer.chooseFolder());
    handle('office:file-open-folder', folder => fileTransfer.openFolder(folder));
    handle('office:file-send-open', target => fileTransfer.openSend(target));
    handle('office:file-send-read', (id, offset, length) => fileTransfer.readSend(id, offset, length));
    handle('office:file-send-close', id => fileTransfer.closeSend(id));
    handle('office:file-receive-open', input => fileTransfer.openReceive(input));
    handle('office:file-receive-write', (id, bytes) => fileTransfer.writeReceive(id, bytes));
    handle('office:file-receive-end', id => fileTransfer.endReceive(id));
    handle('office:file-receive-cancel', id => fileTransfer.cancelReceive(id));

    handle('office:file-progress', value => fileTransfer.progress(value));
    handle('office:file-open', target => fileTransfer.openPath(target));
    handle('office:file-reveal', target => fileTransfer.revealPath(target));
  }
}
module.exports = { installDesktopBridge };
