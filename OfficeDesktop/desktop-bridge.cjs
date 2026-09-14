const { ipcMain, desktopCapturer, screen, safeStorage, app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { trusted } = require('./policy.cjs');

function installDesktopBridge(getWindow) {
  const credentials = path.join(app.getPath('userData'), 'login.enc');
  const displayFile = path.join(app.getPath('userData'), 'preview-display.json');
  let selected = '', pending;
  try { selected = JSON.parse(fs.readFileSync(displayFile, 'utf8')).id || ''; } catch {}
  const allow = event => {
    const window = getWindow();
    if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame ||
        !trusted(event.senderFrame.url)) throw Error('Untrusted desktop request');
  };
  async function sources() {
    const displays = screen.getAllDisplays();
    const primary = String(screen.getPrimaryDisplay().id);
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 480, height: 480 } });
    const chosen = sources.find(s => (s.display_id || s.id) === selected) || sources.find(s => s.display_id === primary) || sources[0];
    return { sources, chosen, list: sources.map((s, index) => {
      const display = displays.find(d => String(d.id) === s.display_id);
      return { id: s.display_id || s.id, name: `屏幕 ${index + 1}${s.display_id === primary ? '（主屏幕）' : ''}`,
        width: display?.size.width, height: display?.size.height, selected: s === chosen };
    }) };
  }
  const handle = (name, fn) => ipcMain.handle(name, (event, ...args) => { allow(event); return fn(...args); });
  handle('office:displays', async () => (await sources()).list);
  handle('office:display-select', async id => {
    const { sources: rows } = await sources();
    const source = rows.find(s => (s.display_id || s.id) === id);
    if (!source) throw Error('屏幕已断开，请重新选择');
    selected = source.display_id || source.id;
    fs.writeFileSync(displayFile, JSON.stringify({ id: selected }));
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
}
module.exports = { installDesktopBridge };
