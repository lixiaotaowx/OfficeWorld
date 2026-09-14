const { ipcMain, desktopCapturer, screen, safeStorage, app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { trusted } = require('./policy.cjs');

function installDesktopBridge(getWindow, dependencies = {}) {
  const annotationLayer = dependencies.annotationLayer;
  const displays = dependencies.displays;
  const credentials = path.join(app.getPath('userData'), 'login.enc');
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
    return true;
  });
  handle('office:preview-frame', () => {
    if (pending) return pending;
    pending = sources().then(({ chosen }) => {
      if (!chosen || chosen.thumbnail.isEmpty()) throw Error('暂时无法读取屏幕');
      const size = chosen.thumbnail.getSize(), scale = Math.min(1, 480 / Math.max(size.width, size.height));
      const thumb = chosen.thumbnail.resize({ width: Math.max(1, Math.round(size.width * scale)), height: Math.max(1, Math.round(size.height * scale)) });
      return 'data:image/jpeg;base64,' + thumb.toJPEG(55).toString('base64');
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
  handle('office:login-clear', () => { fs.rmSync(credentials, { force: true }); return true; });
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
}
module.exports = { installDesktopBridge };
