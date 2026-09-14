const { app, BrowserWindow, Menu, shell, dialog, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { OFFICE_URL, trusted } = require('./policy.cjs');
const { configurePermissions } = require('./permissions.cjs');
const { installDesktopBridge } = require('./desktop-bridge.cjs');
const { reconnect } = require('./reconnect.cjs');
const { installTray } = require('./tray.cjs');
const { installChrome } = require('./chrome.cjs');
const { applyWindowIcon } = require('./window-icon.cjs');

// Requested short notification tone must also play while hidden in the tray.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const iconPath = path.join(__dirname, 'assets', 'icon.ico');
if (process.platform === 'win32') app.setAppUserModelId('com.officeworld.desktop');

// Keep the established profile through the display-name change.
const profilePath = app.getPath('userData');
app.setName('iruler dream');
app.setPath('userData', profilePath);
let mainWindow;
let mainTray;
const smoke = process.argv.includes('--office-smoke-test');
// Smoke runs use an isolated profile and never grant capture permissions.
if (smoke) app.setPath('userData', path.join(app.getPath('temp'), 'office-world-smoke'));
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show(); mainWindow.focus();
  });
  app.whenReady().then(createWindow);
}

function createWindow() {
  const officeSession = session.fromPartition(smoke ? 'office-smoke' : 'persist:office-world');
  if (smoke) officeSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  else configurePermissions(officeSession, () => mainWindow);
  mainWindow = new BrowserWindow({
    width: 1440, height: 940, minWidth: 800, minHeight: 640,
    title: 'iruler dream', backgroundColor: '#222824', show: !smoke, icon: iconPath,
    frame: false,
    webPreferences: { session: officeSession, nodeIntegration: false, contextIsolation: true, sandbox: true,
      preload: path.join(__dirname, 'desktop-preload.cjs') },
  });
  const contents = mainWindow.webContents;
  applyWindowIcon(mainWindow, iconPath);
  installChrome(mainWindow);
  if (!smoke) {
    try { mainTray = installTray(mainWindow, iconPath); }
    catch (error) {
      // Keep normal close-to-exit behavior if Windows cannot create the tray.
      dialog.showErrorBox('托盘不可用', `关闭窗口将退出应用。\n${error.message}`);
    }
  }
  if (!smoke) installDesktopBridge(() => mainWindow);
  contents.setWindowOpenHandler(({ url }) => {
    if (trusted(url)) void contents.loadURL(url);
    else if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-redirect', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-attach-webview', event => event.preventDefault());
  mainWindow.on('closed', () => { mainWindow = undefined; });
  Menu.setApplicationMenu(null);
  if (smoke) {
    const report = data => {
      fs.writeFileSync(path.join(app.getPath('temp'), 'office-world-smoke.json'), JSON.stringify(data, null, 2));
      app.exit(data.ok ? 0 : 1);
    };
    contents.once('did-finish-load', () => report({ ok: trusted(contents.getURL()), url: contents.getURL(), title: contents.getTitle(), electron: process.versions.electron, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } }));
    contents.once('did-fail-load', (_event, code, description) => report({ ok: false, code, description }));
    setTimeout(() => report({ ok: false, error: 'Load timeout' }), 45000).unref();
  } else reconnect(mainWindow);
  void mainWindow.loadURL(OFFICE_URL).catch(() => {});
}

app.on('window-all-closed', () => app.quit());
