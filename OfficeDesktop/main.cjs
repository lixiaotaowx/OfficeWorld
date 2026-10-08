const { app, BrowserWindow, Menu, shell, dialog, session, screen } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { OFFICE_URL, trusted } = require('./policy.cjs');
const { configurePermissions } = require('./permissions.cjs');
const { installDesktopBridge } = require('./desktop-bridge.cjs');
const { reconnect } = require('./reconnect.cjs');
const { installTray } = require('./tray.cjs');
const { installChrome } = require('./chrome.cjs');
// 「这个窗口算不算整屏」：不能只看 isFullScreen()（这个无边框透明窗口上它不可靠，
// 2026-09-22 真机实测过），要连"我们自己请求过整屏"那份记录一起算。
const { isWindowFullscreen } = require('./fullscreen.cjs');
const { applyWindowIcon } = require('./window-icon.cjs');
const { createAnnotationLayer } = require('./annotation-overlay.cjs');
const { createPreviewGlow } = require('./preview-glow.cjs');
const { createDisplayStore } = require('./display-store.cjs');
const { createPreviewCapture } = require('./preview-capture.cjs');
const { createAutoStart, AUTOSTART_ARG } = require('./autostart.cjs');
const { createDockWindow } = require('./dock-window.cjs');
const { createTrayArea } = require('./tray-area.cjs');
const { createTaskbarTheme } = require('./taskbar-theme.cjs');
const { installDockBridge } = require('./dock-bridge.cjs');
const { createFileTransfer } = require('./file-transfer.cjs');

// Requested short notification tone must also play while hidden in the tray.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const iconPath = path.join(__dirname, 'assets', 'icon.ico');
// Deliberately NO custom AppUserModelId here. Windows resolves a taskbar button's icon
// THROUGH the app user model id, so claiming an id that no Start-Menu shortcut is
// registered under makes the taskbar fall back to the generic application icon — even
// though the window icon is correct (verified with WM_GETICON: ICON_BIG 32x32 gold).
// That is why the installer (a plain exe, no AUMID) showed the right icon while the app
// did not. Falling back to the executable's own identity keeps the icon AND toasts
// working, because that identity always resolves.

// Keep the established profile through the display-name change.
const profilePath = app.getPath('userData');
app.setName('iruler dream');
app.setPath('userData', profilePath);
let mainWindow;
let mainTray;
let dockWindow;
/** 会话结束（关机/注销）只处理一次。 */
let quitOnSessionEnd = false;
const smoke = process.argv.includes('--office-smoke-test');
// Windows starts the login item with this flag: connect quietly and stay in the tray
// rather than throwing a window in front of whatever the person is doing at sign-in.
const launchHidden = process.argv.includes(AUTOSTART_ARG);
const autoStart = createAutoStart({ app });
// Smoke runs use an isolated profile and never grant capture permissions.
if (smoke) app.setPath('userData', path.join(app.getPath('temp'), 'office-world-smoke'));
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show(); mainWindow.focus();
  });
  app.whenReady().then(() => {
    // An installed copy comes up with the machine without being asked; a portable
    // build reports unsupported and this is a no-op.
    if (!smoke) autoStart.ensure();
    createWindow();
  });
}

function createWindow() {
  const officeSession = session.fromPartition(smoke ? 'office-smoke' : 'persist:office-world');
  // The layer that draws other people's annotations over the shared display.
  const annotationLayer = createAnnotationLayer();
  // 「有人来看我了」：所有屏幕四周闪一圈绿光（用户 2026-09-18）。
  const previewGlow = createPreviewGlow();
  screen.on?.('display-added', () => previewGlow.sync());
  screen.on?.('display-removed', () => previewGlow.sync());
  screen.on?.('display-metrics-changed', () => previewGlow.sync());
  // Preview and screen sharing both follow this one display selection.
  const displays = createDisplayStore(path.join(profilePath, 'preview-display.json'));
  // One long-lived small capture stream for the workstation preview.
  const previewCapture = createPreviewCapture();
  if (smoke) officeSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  else configurePermissions(officeSession, () => mainWindow, {
    displays,
    // A display share can be covered; a window share cannot (empty id).
    onDisplayChosen: (displayId) => {
      if (displayId) annotationLayer.target(displayId);
      else annotationLayer.target('');
    },
  });
  mainWindow = new BrowserWindow({
    width: 1440, height: 940, minWidth: 800, minHeight: 640,
    title: 'iruler dream', transparent: true, backgroundColor: '#00000000', show: !smoke && !launchHidden, icon: iconPath,
    frame: false,
    webPreferences: { session: officeSession, nodeIntegration: false, contextIsolation: true, sandbox: true,
      // A tray-hidden window must keep its socket, timers and audio live: call,
      // voice and meeting alerts arrive while the renderer is not visible.
      backgroundThrottling: false,
      preload: path.join(__dirname, 'desktop-preload.cjs') },
  });
  const contents = mainWindow.webContents;
  // 文件直传：接收文件夹、发送读盘、接收写盘、系统进度条（用户 2026-09-22）。
  // 主窗口、头像条两边都用同一个实例，句柄只有这一份。
  const fileTransfer = createFileTransfer({ app, getWindow: () => mainWindow });
  // 页面一重载，它手里的发送句柄就没有主人了：直接收掉，别把 fd 留到关机。
  contents.on('did-start-navigation', (_event, _url, isInPlace, isMainFrame) => {
    if (isMainFrame && !isInPlace) fileTransfer.reset();
  });
  applyWindowIcon(mainWindow, iconPath);
  installChrome(mainWindow);
  if (!smoke) {
    try { mainTray = installTray(mainWindow, iconPath, { autoStart,
      glow: { flash: () => previewGlow.flash() },
      dock: { enabled: () => dockWindow?.enabled() !== false, set: value => dockWindow?.setEnabled(value) } }); }
    catch (error) {
      // Keep normal close-to-exit behavior if Windows cannot create the tray. A
      // login-item launch would otherwise leave a running app with no way in.
      if (launchHidden) mainWindow.show();
      dialog.showErrorBox('托盘不可用', `关闭窗口将退出应用。\n${error.message}`);
    }
  }
  if (!smoke) installDesktopBridge(() => mainWindow, { annotationLayer, previewGlow, displays, previewCapture, fileTransfer });
  // 任务栏头像条：贴任务栏的小挂件，只显示 + 遥控，状态由主窗口推过来。
  if (!smoke) {
    const dockFile = path.join(profilePath, 'dock.json');
    const trayFile = path.join(profilePath, 'dock-tray.json');
    // 诊断：每次"为什么显示 / 为什么藏"变化时落一行。用户报「头像 ui 有时候会消失找不到」时，
    // 看一眼这个文件就知道是共享屏幕、整屏、任务栏读数还是托盘开关把它收走的。
    const whyFile = path.join(profilePath, 'dock-why.json');
    const dockStore = {
      read: () => { try { return JSON.parse(fs.readFileSync(dockFile, 'utf8')); } catch { return {}; } },
      write: value => { try { fs.writeFileSync(dockFile, JSON.stringify(value)); } catch { /* 位置记不住不影响用 */ } },
      // 诊断：把每次量到的托盘原始数据落盘。哪台机器位置不对，看一眼这个文件就够定位了。
      measure: value => { try { fs.writeFileSync(trayFile, JSON.stringify(value, null, 2)); } catch { /* 诊断文件写不了不影响用 */ } },
      decide: value => { try { fs.writeFileSync(whyFile, JSON.stringify(value, null, 2)); } catch { /* 诊断文件写不了不影响用 */ } },
    };
    dockWindow = createDockWindow({ url: new URL('dock.html', OFFICE_URL).href, store: dockStore,
      // 真的去量任务栏托盘在哪，头像条贴在它左边（用户 2026-09-18：另一台电脑上盖住输入法了）。
      tray: createTrayArea(),
      // 头像条外面那圈框要跟着任务栏的颜色适配（用户 2026-09-20）。
      theme: createTaskbarTheme(),
      // 整屏时把条子藏起来：**每次现算**，不靠 enter/leave 事件（`fullscreen.cjs` 开头就写着
      // 这个无边框透明窗口"事件不可靠"，2026-09-22 真机实测连 `isFullScreen()` 都返回 false，
      // 所以用 `isWindowFullscreen()` = 自己请求过 || 系统说整屏）。事件漏一次也不会永久藏着
      //（用户 2026-09-22「头像这个 ui 有时候会消失找不到」）。
      systemHidden: () => isWindowFullscreen(mainWindow) });
    installDockBridge({ dock: dockWindow, getWindow: () => mainWindow });
    dockWindow.ensure();
    // 整屏进出就立刻贴一次（藏/显示由上面那个现算的 getter 决定，这里只负责及时，不写状态）。
    mainWindow.on('enter-full-screen', () => dockWindow?.place());
    mainWindow.on('leave-full-screen', () => dockWindow?.place());
    app.on('before-quit', () => {
      dockWindow?.destroy();
      // 退出前把常驻采集停掉：它会替我们向 Windows 申请"屏幕常亮"，留着只会拖慢关机。
      try { previewCapture.stop?.(); } catch { /* 可能没在采 */ }
      try { previewGlow.destroy(); } catch { /* 已经没了 */ }
      try { fileTransfer.reset(); } catch { /* 没在传 */ }
    });
    // Windows 关机/注销/重启：**不要在退出流程里逗留**（用户 2026-09-20：「不要阻止关机」）。
    // 会话真的结束时（`session-end`；`query-session-end` 只是询问，不能拦）立刻把窗口都收掉
    // 退出。托盘那条"关窗口 = 收进托盘"的拦截由 tray.cjs 的 quitting 标记放行，这里只保证
    // 不拖时间：留着隐藏窗口 + 常驻采集流的话，Windows 会等我们，注销/关机就慢了。
    const endSession = () => {
      if (quitOnSessionEnd) return;
      quitOnSessionEnd = true;
      try { dockWindow?.destroy(); } catch { /* 已经没了 */ }
      try { previewGlow.destroy(); } catch { /* 已经没了 */ }
      try { previewCapture.stop?.(); } catch { /* 可能没在采 */ }
      try { annotationLayer.close?.(); } catch { /* 可能没开 */ }
      app.exit(0);
    };
    app.on('session-end', endSession);
    mainWindow.on('session-end', endSession);
  }
  contents.setWindowOpenHandler(({ url }) => {
    if (trusted(url)) void contents.loadURL(url);
    else if (/^https?:/.test(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-redirect', (event, url) => { if (!trusted(url)) event.preventDefault(); });
  contents.on('will-attach-webview', event => event.preventDefault());
  // The taskbar flash is only a prompt; it ends the moment the window is focused.
  mainWindow.on('focus', () => { mainWindow?.flashFrame(false); });
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
