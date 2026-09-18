// 任务栏头像条那个小窗（用户 2026-09-17：「贴 Windows 任务栏、永远置顶、无边框，
// 紧贴右侧托盘左边」）。
//
// 它只负责"显示 + 遥控"：不连 socket、不碰媒体，状态与预览帧都由主窗口经主进程中转。
// 位置用 taskbar-position.cjs 算；任务栏自动隐藏、换边、换屏、改 DPI 都会重新贴回去。
const path = require('node:path');
const { dockBounds, STRIP_HEIGHT, CARD_SPACE } = require('./taskbar-position.cjs');

const FOLLOW_MS = 2500;
// 窗口比头像条高：多出来的透明部分是给悬停卡片的（窗口下边缘与头像条下边缘对齐）。
const SIZE = { width: 460, height: STRIP_HEIGHT + CARD_SPACE };
// 一个头像占的宽度（34px 图标 + 4px 间距），加上两端的把手与留白。
const AVATAR_SLOT = 38;
const STRIP_PADDING = 34;
const MIN_WIDTH = 140;
const MAX_WIDTH = 560;

/** 有几个头像就把窗口做多宽：贴在任务栏上，别白白盖住别人的图标。 */
function widthFor(count) {
  const people = Math.max(0, Math.min(16, Number(count) || 0));
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, STRIP_PADDING + people * AVATAR_SLOT));
}

function createDockWindow(dependencies = {}) {
  const electron = dependencies.electron || require('electron');
  const BrowserWindow = dependencies.BrowserWindow || electron.BrowserWindow;
  const screenApi = dependencies.screen || electron.screen;
  const sessionApi = dependencies.session || electron.session;
  const preload = dependencies.preload || path.join(__dirname, 'desktop-dock-preload.cjs');
  const url = dependencies.url || '';
  let size = dependencies.size || SIZE;
  const store = dependencies.store || { read: () => ({}), write: () => {} };
  const position = dependencies.dockBounds || dockBounds;
  let window;
  let follow;
  let moveTimer;
  let visible = true;      // 应用层要求显示（共享屏幕/全屏时会要求隐藏）
  let manual = true;       // 用户从托盘里关掉它（关掉就一直不显示，直到再打开）
  let lastRequested = '';
  let edge = 'bottom';     // 任务栏在哪条边：页面据此决定卡片朝上还是朝下画
  let interactive = false; // 指针是不是在头像条/卡片上：是的话窗口才接管点击

  const display = () => {
    try { return screenApi.getPrimaryDisplay(); } catch { return null; }
  };

  /** 按当前任务栏位置贴上去；任务栏藏起来时我们也藏。 */
  function place() {
    if (!window || window.isDestroyed()) return null;
    const saved = store.read() || {};
    const box = position({ display: display(), width: size.width, height: size.height,
      dx: saved.dx || 0, dy: saved.dy || 0, rightOffset: saved.rightOffset });
    edge = box.edge || 'bottom';
    if (box.hidden || !visible || !manual) {
      if (window.isVisible()) window.hide();
      return box;
    }
    const bounds = { x: box.x, y: box.y, width: box.width, height: box.height };
    const current = window.getBounds();
    if (current.x !== bounds.x || current.y !== bounds.y ||
        current.width !== bounds.width || current.height !== bounds.height) {
      window.setBounds(bounds);
    }
    if (!window.isVisible()) window.showInactive();
    return box;
  }

  /** 用户把窗口拖到别处了：记下它相对"默认贴法"的偏移，下次还贴那儿。 */
  function remember() {
    if (!window || window.isDestroyed()) return null;
    const saved = store.read() || {};
    const base = position({ display: display(), width: size.width, height: size.height,
      dx: 0, dy: 0, rightOffset: saved.rightOffset });
    if (base.hidden) return null;
    const current = window.getBounds();
    const next = { dx: Math.round(current.x - base.x), dy: Math.round(current.y - base.y),
      rightOffset: saved.rightOffset };
    store.write(next);
    return next;
  }

  function ensure() {
    if (window && !window.isDestroyed()) return window;
    if (!url) return undefined;
    window = new BrowserWindow({
      ...size,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      // 允许拖动（拖动区在页面里用 -webkit-app-region: drag 指定），好让用户躲开托盘。
      movable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,
      // 点它不要抢走办公室窗口的焦点：它只是个挂件。
      focusable: false,
      acceptFirstMouse: true,
      webPreferences: {
        // 和主窗口同一个会话，证书例外/缓存一致；页面本身仍是我们的站点。
        session: sessionApi.fromPartition('persist:office-world'),
        preload,
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    });
    // 任务栏本身是最顶层，同级（screen-saver）才压得住它。
    window.setAlwaysOnTop(true, 'screen-saver');
    window.setVisibleOnAllWorkspaces?.(true, { visibleOnFullScreen: false });
    // 窗口比头像条大（卡片空间、以及为了放下卡片而变宽的透明区）：默认让鼠标穿透，
    // 只有指针真的在头像条/卡片上时页面才要求接管点击——否则会盖住任务栏上别人的图标。
    window.setIgnoreMouseEvents(true, { forward: true });
    interactive = false;
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event, target) => {
      if (target !== url) event.preventDefault();
    });
    window.on('closed', () => { window = undefined; });
    // 拖动结束（Windows 上会发 moved）后把新位置记下来，稍等一下免得拖一次写十遍。
    window.on('moved', () => {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => { moveTimer = undefined; remember(); }, 300);
    });
    window.webContents.once('did-finish-load', () => place());
    void window.loadURL(url);
    if (follow) clearInterval(follow);
    follow = setInterval(() => place(), FOLLOW_MS);
    // 这个定时器不该拖住进程退出（也方便单测里直接跑完）。
    follow.unref?.();
    return window;
  }

  return {
    ensure,
    place,
    /** 应用层要求显示/隐藏（共享屏幕、全屏时隐藏）。 */
    setVisible(next, reason = '') {
      visible = next !== false;
      lastRequested = reason;
      return place();
    },
    /** 托盘里的"显示任务栏头像条"开关：关掉就一直不显示。 */
    setEnabled(next) {
      manual = next !== false;
      return place();
    },
    enabled: () => manual,
    isVisible: () => Boolean(window && !window.isDestroyed() && window.isVisible()),
    /** 拖动之后记住偏移（页面拖完通知，或者窗口自己发 moved）。 */
    remember,
    moveBy() { return remember(); },
    /** 按人数把宽度调好：人少就别盖住任务栏上别人的图标。返回新的宽度。 */
    resize(count) {
      const next = widthFor(count);
      if (next !== size.width) {
        size = { ...size, width: next };
        place();
      }
      return next;
    },
    width: () => size.width,
    /** 页面报告指针是否在头像条/卡片上：在就接管点击，不在就穿透给任务栏。 */
    setInteractive(next) {
      interactive = next === true;
      if (window && !window.isDestroyed()) {
        window.setIgnoreMouseEvents(!interactive, { forward: true });
      }
      return interactive;
    },
    interactive: () => interactive,
    /** 主进程把主窗口推来的状态转发给小窗。 */
    send(channel, payload) {
      if (!window || window.isDestroyed()) return false;
      window.webContents.send(channel, payload);
      return true;
    },
    bounds: () => (window && !window.isDestroyed() ? window.getBounds() : null),
    reason: () => lastRequested,
    /** 任务栏在哪条边（bottom/top/left/right），页面用来自动翻卡片方向。 */
    edge: () => edge,
    destroy() {
      if (follow) clearInterval(follow);
      follow = undefined;
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = undefined;
      if (window && !window.isDestroyed()) window.destroy();
      window = undefined;
    },
    window: () => window,
  };
}

module.exports = { createDockWindow, widthFor, SIZE, FOLLOW_MS };
