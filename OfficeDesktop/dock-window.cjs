const { loadFresh } = require('./page-refresh.cjs');


const path = require('node:path');
const { createDockPointer } = require('./dock-pointer.cjs');
const { createDockZOrder } = require('./dock-z-order.cjs');
const { createDockSurface } = require('./dock-surface.cjs');
const { dockBounds, dockAnchor, taskbarRect, STRIP_HEIGHT, CARD_SPACE } = require('./taskbar-position.cjs');

const FOLLOW_MS = 1500;

const HIDE_AFTER_MISSES = 3;

const LOAD_RETRY_MS = [2000, 5000, 10000, 30000];

const SIZE = { width: 120, height: STRIP_HEIGHT + CARD_SPACE };

const AVATAR_SIZE = 32;
const AVATAR_GAP = 2;
const GRIP_WIDTH = 15;
const STRIP_PADDING = 8;
const MIN_WIDTH = 120;
const MAX_WIDTH = 560;

function widthFor(count) {
  const people = Math.max(0, Math.min(16, Number(count) || 0));
  const content = people ? people * AVATAR_SIZE + (people - 1) * AVATAR_GAP + GRIP_WIDTH + STRIP_PADDING : 0;
  return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, content));
}

function createDockWindow(dependencies = {}) {
  const electron = dependencies.electron || require('electron');
  const BrowserWindow = dependencies.BrowserWindow || electron.BrowserWindow;
  const screenApi = dependencies.screen || electron.screen;
  const pointer = createDockPointer({ screen: screenApi, getWindow: () => window });
  const sessionApi = dependencies.session || electron.session;
  const preload = dependencies.preload || path.join(__dirname, 'desktop-dock-preload.cjs');
  const url = dependencies.url || '';

  const tray = dependencies.tray;

  const theme = dependencies.theme;

  const retryMs = dependencies.loadRetryMs || LOAD_RETRY_MS;

  const followMs = dependencies.followMs || FOLLOW_MS;
  let size = dependencies.size || SIZE;
  const store = dependencies.store || { read: () => ({}), write: () => {} };
  const position = dependencies.dockBounds || dockBounds;

  const forced = dependencies.anchor
    || (['left', 'tray'].includes(process.env.officeworld_DOCK_ANCHOR) ? process.env.officeworld_DOCK_ANCHOR : '')
    || (process.argv.includes('--dock-left') ? 'left'
      : process.argv.includes('--dock-tray') ? 'tray' : '');
  const anchor = forced || dockAnchor((dependencies.os || require('node:os')).release());
  let window;
  let follow;
  let moveTimer;
  let loadTimer;
  let loadAttempt = 0;

  let pageVisible = true;
  let manual = true;
  let lastRequested = '';
  let edge = 'bottom';
  let popup = 'left';
  let stripHeight = STRIP_HEIGHT;
  let expanded = false;
  let stage = false;
  let cardPx = 0;
  // the open card can be wider than the strip (the enlarged chat); the window grows to fit it
  let cardWidth = 0;
  let stagePx = 0;
  let hiddenStreak = 0;
  let peek = false;

  let reportedWidth = 0;

  let trayReserve = null;

  const systemHidden = dependencies.systemHidden || (() => false);

  let destroyed = false;

  let lastDecision = '';

  const canFollow = () => !destroyed && pageVisible && manual && window && !window.isDestroyed();
  const zOrder = dependencies.zOrder || createDockZOrder({ allowed: canFollow, pinned: () => expanded || stage, repair: () => place() });

  const surface = dependencies.surface || createDockSurface();

  const display = () => {
    try { return screenApi.getPrimaryDisplay(); } catch { return null; }
  };

  async function measureTray(force = false) {
    if (!tray?.measure) return null;
    try {

      const bar = taskbarRect(display());
      const next = await tray.measure(display(), { force, taskbarDip: bar?.thickness || stripHeight });
      const changed = JSON.stringify(next) !== JSON.stringify(trayReserve);
      trayReserve = next || null;
      if (changed) {
        place();
        store.measure?.({ at: new Date().toISOString(), display: display()?.bounds,
          scaleFactor: display()?.scaleFactor, taskbarDip: bar?.thickness || stripHeight,
          raw: tray.raw?.() || null, reserve: trayReserve });
      }
    } catch {
      trayReserve = null;
    }
    return trayReserve;
  }

  const widthOf = () => reportedWidth || size.width;

  function layout(overrides = {}) {
    const saved = store.read() || {};
    return position({

      display: display(), width: widthOf(), expanded: true, stage, peek, stagePx, cardPx, anchor,
      ...(cardWidth > 0 ? { minWidth: Math.min(cardWidth, display()?.workArea?.width || display()?.bounds?.width || 720) } : {}),

      rightOffset: saved.rightOffset ?? trayReserve?.rightOffset,
      trayLeft: trayReserve?.trayLeft,
      ...(trayReserve?.leftGap ? { leftGap: trayReserve.leftGap } : {}),
      dx: saved.dx || 0, dy: saved.dy || 0,
      ...overrides,
    });
  }

  function raise() {
    if (!window || window.isDestroyed()) return;
    if (zOrder.sync(window)) return;

    window.setAlwaysOnTop(expanded || stage);
  }

  function note(why, box, extra = {}) {
    if (why === lastDecision) return;
    lastDecision = why;
    try {
      store.decide?.({ at: new Date().toISOString(), why, pageVisible, manual, hiddenStreak,
        ...extra, strip: box?.strip || null, screen: display()?.bounds || null });
    } catch {  }
  }

  function place() {
    if (!window || window.isDestroyed()) return null;

    let box = layout();
    // When the taskbar auto-hides, retain a usable position for an open panel.
    if (box.hidden && (expanded || stage)) {
      const screen = display(), b = screen?.bounds, thickness = stripHeight || STRIP_HEIGHT;
      if (b && b.height > thickness) box = layout({ display: { ...screen,
        workArea: { ...b, height: b.height - thickness } } });
    }
    edge = box.edge || 'bottom';
    stripHeight = box.strip?.height || STRIP_HEIGHT;

    popup = box.popup === 'right' ? 'right' : 'left';

    if (box.hidden) hiddenStreak += 1;
    else hiddenStreak = 0;
    const taskbarGone = box.hidden && hiddenStreak >= HIDE_AFTER_MISSES;

    const system = systemHidden() === true && !expanded && !stage;
    const fullscreen = !expanded && !stage && zOrder.blocked?.(window) === true;
    const hideReason = taskbarGone ? 'taskbar' : !pageVisible ? 'page'
      : system ? 'system' : !manual ? 'manual' : fullscreen ? 'fullscreen' : '';
    note(hideReason || 'shown', box, { taskbarGone, system, fullscreen });
    if (hideReason) {
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
    pointer.fallback([{ x: box.strip.x - box.x, y: box.strip.y - box.y,
      width: box.strip.width, height: box.strip.height }, ...(expanded ? [{
      x: 0, y: edge === 'top' ? stripHeight : Math.max(0, box.height - stripHeight - CARD_SPACE),
      width: box.width, height: CARD_SPACE,
    }] : [])]);
    raise();
    // The window is where it belongs; make sure what it draws is there too.
    if (surface.check(window) === 'rebuild') rebuild();
    return box;
  }

  // Replace the window with a fresh one; the page asks for its state again when it loads.
  function rebuild() {
    const old = window;
    window = undefined;
    surface.reset();
    if (old && !old.isDestroyed()) old.destroy();
    ensure();
  }

  function remember() {
    if (!window || window.isDestroyed()) return null;
    const saved = store.read() || {};

    const base = layout({ dx: 0, dy: 0 });
    if (base.hidden) return null;
    const current = window.getBounds();
    const next = { dx: Math.round(current.x - base.x), dy: Math.round(current.y - base.y),
      rightOffset: saved.rightOffset };
    store.write(next);
    return next;
  }

  function ensure() {
    // Idle close may release the Dock to stay inside the process budget; the
    // next main-window open revives this same instance with its saved layout.
    destroyed = false;
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

      movable: true,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      skipTaskbar: true,

      focusable: true,
      acceptFirstMouse: true,
      webPreferences: {

        session: sessionApi.fromPartition('persist:office-world'),
        preload,
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        backgroundThrottling: false,
      },
    });

    window.setAlwaysOnTop(false);
    window.setVisibleOnAllWorkspaces?.(true, { visibleOnFullScreen: false });
    pointer.start();
    zOrder.start();

    for (const event of ['show', 'restore', 'focus', 'blur']) {
      window.on(event, () => { if (window?.isVisible()) raise(); });
    }

    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', (event, target) => {
      if (target !== url) event.preventDefault();
    });
    const created = window;
    window.on('closed', () => { if (window === created) window = undefined; });

    window.on('moved', () => {
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = setTimeout(() => { moveTimer = undefined; remember(); }, 300);
    });

    const retryLoad = () => {
      if (!window || window.isDestroyed()) return;
      const delay = retryMs[Math.min(loadAttempt, retryMs.length - 1)];
      loadAttempt += 1;
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        loadTimer = undefined;
        if (window && !window.isDestroyed()) void loadFresh(window, url).catch(() => {});
      }, delay);
      loadTimer.unref?.();
    };
    window.webContents.on('did-finish-load', () => { loadAttempt = 0; });
    window.webContents.on('did-fail-load', (_event, code, _description, _target, mainFrame) => {

      if (mainFrame !== false && code !== -3) retryLoad();
    });

    window.webContents.on('render-process-gone', () => { loadAttempt = 0; retryLoad(); });
    window.webContents.once('did-finish-load', () => { void measureTray(true); place(); });
    void loadFresh(window, url).catch(() => retryLoad());

    void measureTray(true);
    if (follow) clearInterval(follow);

    let ticks = 0;
    follow = setInterval(() => {

      if (destroyed) return;
      if (!window || window.isDestroyed()) { ensure(); return; }
      place();
      if (++ticks % Math.max(1, Math.round(20000 / followMs)) === 0) void measureTray(true);
    }, followMs);

    follow.unref?.();
    return window;
  }

  return {
    ensure,
    place,

    setVisible(next, reason = '') {
      pageVisible = next !== false;
      lastRequested = reason;
      return place();
    },

    setEnabled(next) {
      manual = next !== false;
      return place();
    },
    enabled: () => manual,
    isVisible: () => Boolean(window && !window.isDestroyed() && window.isVisible()),

    remember,
    moveBy() { return remember(); },

    resize(count) {
      const next = widthFor(count);
      if (next !== size.width) {
        size = { ...size, width: next };
        place();
      }
      return next;
    },

    width: () => widthOf(),

    applyLayout(input = {}) {
      if (Array.isArray(input.hitRegions)) pointer.update(input.hitRegions);
      const nextCardPx = Math.max(0, Math.min(700, Math.round(Number(input.cardPx) || 0)));
      const nextExpanded = input.expanded === true;
      const nextStage = input.stage === true;

      const nextPeek = nextStage && input.stageMode === 'peek';

      const nextStagePx = nextStage ? Math.max(0, Math.min(900, Math.round(Number(input.stagePx) || 0))) : 0;
      const nextWidth = Math.max(0, Math.round(Number(input.width) || 0));
      const nextCardWidth = Math.max(0, Math.min(4096, Math.round(Number(input.cardWidth) || 0)));
      const widthChanged = nextWidth > 0 && nextWidth !== reportedWidth;
      if (nextWidth > 0) reportedWidth = Math.min(MAX_WIDTH, nextWidth);
      if (nextExpanded === expanded && nextStage === stage && nextPeek === peek &&
          nextStagePx === stagePx && nextCardPx === cardPx && nextCardWidth === cardWidth && !widthChanged) {
        return { expanded, stage, peek, stagePx, width: widthOf() };
      }
      cardPx = nextCardPx;
      cardWidth = nextCardWidth;
      expanded = nextExpanded;
      stage = nextStage;
      peek = nextPeek;
      stagePx = nextStagePx;
      place();
      return { expanded, stage, peek, stagePx, width: widthOf() };
    },
    expanded: () => expanded,

    stage: () => stage,

    peek: () => peek,

    tray: () => trayReserve,

    refreshTray: force => measureTray(force !== false),

    send(channel, payload) {
      if (!window || window.isDestroyed()) return false;
      window.webContents.send(channel, payload);
      return true;
    },
    bounds: () => (window && !window.isDestroyed() ? window.getBounds() : null),
    reason: () => lastRequested,

    why: () => lastDecision,
    ownership: () => ({ attached: false, ...zOrder.diagnostics(), ...surface.diagnostics() }),

    systemHidden: () => systemHidden() === true,

    edge: () => edge,

    stripHeight: () => stripHeight,
    destroy() {
      pointer.stop();
      destroyed = true;
      zOrder.stop();
      if (follow) clearInterval(follow);
      follow = undefined;
      if (moveTimer) clearTimeout(moveTimer);
      moveTimer = undefined;
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = undefined;
      if (window && !window.isDestroyed()) window.destroy();
      window = undefined;
    },

    popup: () => popup,

    theme: () => theme?.current?.() || null,
    window: () => window,
  };
}

module.exports = { createDockWindow, widthFor, SIZE, FOLLOW_MS };
