const { app, BrowserWindow, Menu, ipcMain, shell, dialog, session, screen, nativeImage, desktopCapturer } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { OFFICE_URL, trusted } = require('./policy.cjs');
const { configurePermissions } = require('./permissions.cjs');
const { installDesktopBridge } = require('./desktop-bridge.cjs');
const { reconnect } = require('./reconnect.cjs');
const { loadFresh, refreshBusy, createReopenRefresh } = require('./page-refresh.cjs');
const { installTray } = require('./tray.cjs');
const { installChrome } = require('./chrome.cjs');
const { createCommsHost } = require('./comms-host.cjs');
const { closeBlockers, createMediaFlag } = require('./close-guard.cjs');

const { hidesDock } = require('./fullscreen.cjs');
const { applyWindowIcon } = require('./window-icon.cjs');
const { APP_ID } = require('./shortcut-icons.cjs');
const { createAnnotationLayer } = require('./annotation-overlay.cjs');
const { createPreviewGlow } = require('./preview-glow.cjs');
const { createShareBorder } = require('./share-border.cjs');
const { createDisplayStore } = require('./display-store.cjs');
const { createPreviewCapture } = require('./preview-capture.cjs');
const { createNativePreviewCapture } = require('./native-preview-capture.cjs');
const { createAutoStart, AUTOSTART_ARG } = require('./autostart.cjs');
const { createDockWindow } = require('./dock-window.cjs');
const { createTrayArea } = require('./tray-area.cjs');
const { createTaskbarTheme } = require('./taskbar-theme.cjs');
const { installDockBridge } = require('./dock-bridge.cjs');
const { createFileTransfer } = require('./file-transfer.cjs');
const { observeMainVisibility } = require('./main-visibility.cjs');
const { createLeanSwap } = require('./lean-swap.cjs');
const { attachTaskbarVisibility } = require('./window-taskbar.cjs');
const { adoptLegacyProfile } = require('./legacy-profile.cjs');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const iconPath = path.join(__dirname, 'assets', 'icon.ico');
app.setName('iruler dream');
const smoke = process.argv.includes('--office-smoke-test');
const isolatedAcceptance = process.argv.includes('--office-isolated-acceptance') ||
  process.env.OFFICE_PERFORMANCE_FIXTURE === 'synthetic-preview';
const profileArg = process.argv.find(value => value.startsWith('--user-data-dir='));
const requestedProfile = profileArg?.slice('--user-data-dir='.length).replace(/^['"]|['"]$/g, '');
if (isolatedAcceptance && requestedProfile) app.setPath('userData', path.resolve(requestedProfile));
let profilePath = app.getPath('userData');
// The product rename moved Chromium's profile folder; carry the old remembered login over
// before the profile is opened. Test and fixture runs use throwaway profiles.
const throwawayProfile = smoke || isolatedAcceptance || process.env.OFFICE_PERFORMANCE_FIXTURE === 'synthetic-preview';
if (!throwawayProfile) {
  const adopted = adoptLegacyProfile({ appData: app.getPath('appData'), profilePath });
  if (adopted.migrated) console.log('Adopted the previous profile login:', adopted.copied.join(', '));
}
if (process.platform === 'win32' && app.isPackaged) app.setAppUserModelId(APP_ID);
app.setPath('userData', profilePath);

const hostMode = process.env.OFFICE_COMMS_HOST !== '0';
const fixtureRequested = process.env.OFFICE_PERFORMANCE_FIXTURE === 'synthetic-preview';
const fixtureUrl = new URL(OFFICE_URL);
if (fixtureRequested && (app.isPackaged || fixtureUrl.protocol !== 'http:' || fixtureUrl.hostname !== '127.0.0.1' || !process.env.OFFICE_PERFORMANCE_TOOLS)) {
  throw Error('Synthetic performance fixture requires an unpackaged local client');
}
if (isolatedAcceptance && (app.isPackaged || fixtureUrl.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(fixtureUrl.hostname))) {
  throw Error('Isolated acceptance requires an unpackaged local OFFICE_URL');
}
const fixtureTools = fixtureRequested ? process.env.OFFICE_PERFORMANCE_TOOLS : '';
if (fixtureRequested) desktopCapturer.getSources = async () => { throw Error('Real screen capture is disabled in the performance fixture'); };
const launchHidden = process.argv.includes(AUTOSTART_ARG);
const autoStart = createAutoStart({ app });

let initialized = false;
let mainWindow;
let mainTray;
let dockWindow;
let dockBridge;
let reopenRefresh;
let leanSwap;
// Whether the main page has loaded the 3D hall since it was created.
let mainHeavy = false;
let commsHost;
let officeSession;
let annotationLayer;
let previewGlow;
let shareBorder;
let displays;
let previewCapture;
let fileTransfer;
let quitOnSessionEnd = false;
let savedBounds;
let savedMaximized = false;
let endSession;
const mainMedia = createMediaFlag();
mainMedia.none();

function mainUrl(lean = false) {
  const url = new URL(OFFICE_URL);
  if (hostMode) url.searchParams.set('officeCommsHost', '1');
  // A lean page feeds the taskbar avatars and loads the hall only once it is shown.
  if (lean) url.searchParams.set('officeLean', '1');
  return url.href;
}

function mainWindowAlive() {
  return Boolean(mainWindow && !mainWindow.isDestroyed());
}

/** Every reason the main window has to stay alive right now; empty means idle. */
function mainBlockers() {
  return closeBlockers({
    hostEnabled: hostMode,
    health: commsHost?.health?.(),
    snapshot: commsHost?.snapshot?.(),
    forced: commsHost?.forcedBusy?.() === true,
    mediaActive: mainMedia.active(),
    handles: fileTransfer?.openHandles?.(),
  });
}

function isBusy() {
  return mainBlockers().length > 0;
}

function saveWindowState(window) {
  try {
    if (window.isDestroyed()) return;
    savedBounds = window.getBounds();
    savedMaximized = window.isMaximized();
  } catch { /* closing */ }
}

if (smoke) app.setPath('userData', path.join(app.getPath('temp'), 'office-world-smoke'));
profilePath = app.getPath('userData');
function traceIsolatedStartup(stage) {
  if (!isolatedAcceptance) return;
  try { fs.appendFileSync(path.join(profilePath, 'startup-events.log'), `${Date.now()} ${process.pid} ${stage}\n`); }
  catch { /* diagnostic only */ }
}
traceIsolatedStartup(`loaded debug-port=${app.commandLine.getSwitchValue('remote-debugging-port')}`);
function startApplication() {
  traceIsolatedStartup('instance-ready');
  app.on('second-instance', () => {
    if (!initialized) return;
    const window = mainWindow && !mainWindow.isDestroyed() ? mainWindow : createMainWindow({ show: true });
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.show(); window.focus();
    reopenRefresh?.request();
  });
  app.whenReady().then(() => {
    traceIsolatedStartup('app-ready');
    if (!smoke && app.isPackaged) autoStart.ensure();
    initialize();
    traceIsolatedStartup('initialized');
    createMainWindow();
    traceIsolatedStartup(`main-created debug-port=${app.commandLine.getSwitchValue('remote-debugging-port')}`);
  });
}
if (app.requestSingleInstanceLock()) {
  traceIsolatedStartup('lock-acquired');
  startApplication();
} else {
  traceIsolatedStartup('lock-denied');
  app.quit();
}

function initialize() {
  if (initialized) return;
  initialized = true;
  officeSession = session.fromPartition(smoke || isolatedAcceptance ? 'office-smoke' : 'persist:office-world');
  commsHost = createCommsHost({
    session: officeSession,
    enabled: hostMode,
    getMainWindow: () => mainWindow,
    getDock: () => dockWindow?.window(),
  });
  commsHost.ensure();
  ipcMain.on('office:media-active', (event, value) => {
    if (mainWindowAlive() && event.sender === mainWindow.webContents &&
        event.senderFrame === mainWindow.webContents.mainFrame) mainMedia.report(value === true);
  });
  app.once('before-quit', () => { try { commsHost?.destroy(); } catch {  } });

  annotationLayer = createAnnotationLayer();
  previewGlow = createPreviewGlow();
  shareBorder = createShareBorder(fixtureRequested ? { BrowserWindow: class extends BrowserWindow { showInactive() {} } } : {});
  screen.on?.('display-added', () => previewGlow.sync());
  screen.on?.('display-removed', () => previewGlow.sync());
  screen.on?.('display-metrics-changed', () => previewGlow.sync());
  displays = createDisplayStore(path.join(profilePath, 'preview-display.json'));
  previewCapture = fixtureRequested
    ? createPreviewCapture({ preload: path.join(fixtureTools, 'performance-preview-preload.cjs'), denyMedia: true })
    : createNativePreviewCapture();
  const fixtureCapturer = fixtureRequested ? require(path.join(fixtureTools, 'performance-preview.cjs')).createSyntheticCapturer(screen, nativeImage) : undefined;
  if (smoke || isolatedAcceptance) {
    officeSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    officeSession.setPermissionCheckHandler(() => false);
    officeSession.setDisplayMediaRequestHandler((_request, callback) => callback({}));
  } else configurePermissions(officeSession, () => mainWindow, {
    displays,
    getHost: () => commsHost?.window(),
    onDisplayChosen: (displayId) => {
      shareBorder.captured(displayId);
      if (displayId) annotationLayer.target(displayId);
      else annotationLayer.target('');
    },
  });
  fileTransfer = createFileTransfer({ app, getWindow: () => mainWindow });

  if (!smoke) {
    try {
      mainTray = installTray(() => mainWindow, iconPath, {
        createWindow: () => createMainWindow({ show: true }),
        onShow: () => reopenRefresh?.request(),
        autoStart,
        glow: { flash: () => previewGlow.flash() },
        dock: { enabled: () => dockWindow?.enabled() !== false, set: value => dockWindow?.setEnabled(value) },
      });
    } catch (error) {
      dialog.showErrorBox("System tray unavailable", `Closing the window will exit the app.\n${error.message}`);
    }
  }

  installDesktopBridge(() => mainWindow,
    { annotationLayer, previewGlow, shareBorder, displays, previewCapture, desktopCapturer: fixtureCapturer,
      previewPowerMonitor: fixtureRequested ? { getSystemIdleTime: () => 0 } : undefined,
      fileTransfer, getDock: () => dockWindow?.window(), getHost: () => commsHost?.window() });

  if (!smoke) {
    const dockFile = path.join(profilePath, 'dock.json');
    const trayFile = path.join(profilePath, 'dock-tray.json');
    const whyFile = path.join(profilePath, 'dock-why.json');
    const dockStore = {
      read: () => { try { return JSON.parse(fs.readFileSync(dockFile, 'utf8')); } catch { return {}; } },
      write: value => { try { fs.writeFileSync(dockFile, JSON.stringify(value)); } catch {  } },
      measure: value => { try { fs.writeFileSync(trayFile, JSON.stringify(value, null, 2)); } catch {  } },
      decide: value => { try { fs.writeFileSync(whyFile, JSON.stringify(value, null, 2)); } catch {  } },
    };
    dockWindow = createDockWindow({ url: new URL('dock.html', OFFICE_URL).href, store: dockStore,
      tray: createTrayArea(), theme: createTaskbarTheme(), systemHidden: () => hidesDock(mainWindow) });
    dockBridge = installDockBridge({ dock: dockWindow, getWindow: () => mainWindow,
      getHost: () => commsHost?.window() });
    reopenRefresh = createReopenRefresh({
      pages: () => [{ window: mainWindow, url: mainUrl() },
        { window: dockWindow?.window(), url: new URL('dock.html', OFFICE_URL).href }],
      busy: isBusy,
      fetch: (url, options) => officeSession.fetch(url, options),
    });
    leanSwap = createLeanSwap({
      getWindow: () => mainWindow,
      heavy: () => mainHeavy,
      busy: isBusy,
      dockState: () => dockBridge.state(),
      dockWindow: () => dockWindow?.window(),
      swap: () => {
        const old = mainWindow;
        saveWindowState(old);
        old.destroy();
        createMainWindow({ show: false });
      },
    });
    dockWindow.ensure();
  }

  endSession = () => {
    if (quitOnSessionEnd) return;
    quitOnSessionEnd = true;
    try { dockWindow?.destroy(); } catch {  }
    try { previewGlow.destroy(); } catch {  }
    try { annotationLayer.close?.(); } catch {  }
    try { shareBorder?.destroy(); } catch {  }
    try { commsHost?.destroy(); } catch {  }
    app.exit(0);
  };
  app.on('session-end', endSession);

  app.on('before-quit', () => {
    try { reopenRefresh?.dispose(); } catch {  }
    try { leanSwap?.dispose(); } catch {  }
    try { dockWindow?.destroy(); } catch {  }
    try { previewCapture.stop?.(); } catch {  }
    try { previewGlow.destroy(); } catch {  }
    try { fileTransfer?.reset(); } catch {  }
    try { shareBorder?.destroy(); } catch {  }
  });
  app.on('window-all-closed', () => app.quit());
  Menu.setApplicationMenu(null);
}

function createMainWindow(settings = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (settings.show !== false) { mainWindow.show(); mainWindow.focus(); }
    return mainWindow;
  }
  const shown = settings.show === undefined ? (!smoke && !launchHidden) : settings.show !== false;
  // A window that starts hidden has no hall to draw yet.
  const lean = !shown && !smoke && Boolean(mainTray);
  const address = mainUrl(lean);
  mainHeavy = !lean;
  const window = new BrowserWindow({
    ...(savedBounds || { width: 1440, height: 940 }),
    minWidth: 800, minHeight: 640,
    title: 'iruler dream', transparent: true, backgroundColor: '#00000000',
    show: shown, skipTaskbar: !shown,
    icon: iconPath, frame: false,
    webPreferences: { session: officeSession, nodeIntegration: false, contextIsolation: true, sandbox: true,
      backgroundThrottling: false, preload: path.join(__dirname, 'desktop-preload.cjs') },
  });
  mainWindow = window;
  mainMedia.unknown();
  if (!smoke && dockWindow) {
    dockWindow.ensure();
  }
  const contents = window.webContents;
  observeMainVisibility(window);
  contents.on('did-start-navigation', (_event, _url, isInPlace, isMainFrame) => {
    if (isMainFrame && !isInPlace) { fileTransfer.reset(); shareBorder.reset(); mainMedia.unknown(); }
  });
  contents.on('render-process-gone', () => { shareBorder.reset(); mainMedia.unknown(); });
  window.on('close', () => saveWindowState(window));
  window.on('closed', () => {
    shareBorder?.reset();
    if (mainWindow === window) { mainWindow = undefined; mainMedia.none(); }
    if (!mainTray) app.quit();
  });
  if (!smoke) window.on('session-end', () => endSession?.());
  applyWindowIcon(window, iconPath);
  installChrome(window);
  window.on('focus', () => { if (!window.isDestroyed()) window.flashFrame(false); });
  contents.setWindowOpenHandler(({ url }) => {
    if (trusted(url)) void contents.loadURL(url);
    else if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-redirect', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-attach-webview', event => event.preventDefault());
  if (!smoke) {
    attachTaskbarVisibility(window, { hiddenAtStart: !shown });
    for (const event of ['enter-full-screen', 'leave-full-screen', 'maximize', 'unmaximize',
      'minimize', 'restore', 'show', 'hide']) window.on(event, () => dockWindow?.place());
    mainTray?.attach(window);
    if (savedMaximized && window.isVisible()) window.maximize();
    else if (savedMaximized) window.once('show', () => { if (!window.isDestroyed()) window.maximize(); });
    window.on('show', () => { if (mainWindow === window) { mainHeavy = true; leanSwap?.disarm(); } });
    window.on('hide', () => { if (mainWindow === window) leanSwap?.arm(); });
  }
  if (smoke) {
    const report = data => {
      fs.writeFileSync(path.join(app.getPath('temp'), 'office-world-smoke.json'), JSON.stringify(data, null, 2));
      app.exit(data.ok ? 0 : 1);
    };
    contents.once('did-finish-load', () => report({ ok: trusted(contents.getURL()), url: contents.getURL(), title: contents.getTitle(), electron: process.versions.electron, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } }));
    contents.once('did-fail-load', (_event, code, description) => report({ ok: false, code, description }));
    setTimeout(() => report({ ok: false, error: 'Load timeout' }), 45000).unref();
  } else reconnect(window, address);
  void loadFresh(window, address).catch(() => {});
  return window;
}
