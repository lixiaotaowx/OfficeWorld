// 任务栏头像条：无边框、紧贴任务栏；与任务栏同层，前台全屏时避让。
//
// 它只负责"显示 + 遥控"：不连 socket、不碰媒体，状态与预览帧都由主窗口经主进程中转。
// 位置用 taskbar-position.cjs 算；任务栏自动隐藏、换边、换屏、改 DPI 都会重新贴回去。
//
// 鼠标：现由 dock-pointer 在主进程读屏幕指针，仅在页面上报的控件区域接收输入。
// 装饰人物与透明背景穿透；不依赖 forward。下面保留旧方案的实测原因：原来让窗口一直
// 穿透、靠 Electron 的 `{ forward: true }` 把 mousemove 转给页面，再由页面判断指针是否落在
// 头像条上来切换穿透（用户 2026-09-17 的做法）。2026-09-18 实测这套在这台机器上**根本不
// 工作**：ignore+forward 状态下页面收不到任何 mousemove（0 条），于是页面永远判不出"指针
// 上来了"，悬停卡片与点击全都不响应；把穿透关掉后同样的鼠标轨迹立刻收到 40 条 mousemove、
// 卡片也画出来了（Build/dock-hover-watch.mjs 是对应的探针）。这类透明窗上的 forward 本来
// 就不稳（electron#40213），所以改成不依赖它：
//   · 预留透明卡片空间，悬停开合不重设窗口尺寸，避免 Windows 合成旧画面时闪动；
//   · dock-pointer 按可见控件的命中区域接收输入，空白和装饰照常穿透。
const path = require('node:path');
const { createDockPointer } = require('./dock-pointer.cjs');
const { createDockZOrder } = require('./dock-z-order.cjs');
const { dockBounds, dockAnchor, taskbarRect, STRIP_HEIGHT, CARD_SPACE } = require('./taskbar-position.cjs');

const FOLLOW_MS = 1500;
/**
 * 「任务栏不在了」要连着读到几次才真的把条子收起来（每次 `FOLLOW_MS` 一下）。
 * 一次就藏会让息屏/全屏/量托盘抖动时条子忽闪忽现（用户 2026-09-20 报的闪烁）。
 */
const HIDE_AFTER_MISSES = 3;
/** 页面没加载出来时的重试节奏（开机自启时网络往往还没起来）。 */
const LOAD_RETRY_MS = [2000, 5000, 10000, 30000];

// 展开时窗口比头像条高：多出来的透明部分是给悬停卡片的（窗口下边缘与头像条下边缘对齐）。
// 宽度只是"页面量出真实条宽之前"的临时值，建窗后很快就由页面报上来的宽度接管。
const SIZE = { width: 120, height: STRIP_HEIGHT + CARD_SPACE };
// 一个头像占的宽度（32px 图标 + 2px 间距），加上拖动把手与两端留白。
// 必须和 dock.css 里算出来的一样，否则窗口右边缘对不上条子右边缘（实测差过 30px）。
const AVATAR_SIZE = 32;
const AVATAR_GAP = 2;
const GRIP_WIDTH = 15;
const STRIP_PADDING = 8;
const MIN_WIDTH = 120;
const MAX_WIDTH = 560;

/** 有几个头像条子就有多宽：贴在任务栏上，别白白盖住别人的图标。 */
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
  // 量任务栏托盘（Win32 的 TrayNotifyWnd）：头像条要贴在它左边，不许盖住输入法等那堆按钮。
  const tray = dependencies.tray;
  // 任务栏现在的颜色（明暗 + 强调色）：头像条外面那圈框据此适配。
  const theme = dependencies.theme;
  // 页面加载失败的重试节奏（测试里可以调快）。
  const retryMs = dependencies.loadRetryMs || LOAD_RETRY_MS;
  // 「每隔一会儿重新贴一次」的节奏（测试里可以调快，好验"窗口被销毁后自己建回来"）。
  const followMs = dependencies.followMs || FOLLOW_MS;
  let size = dependencies.size || SIZE;
  const store = dependencies.store || { read: () => ({}), write: () => {} };
  const position = dependencies.dockBounds || dockBounds;
  // Windows 11 把条子放在屏幕最左侧，Windows 10 继续贴托盘左边（用户 2026-09-18）。
  // 进程启动时定一次就够：系统版本不会中途变。
  // 想在 Win10 机器上预览 Win11 的样子（或反过来）用 `--dock-left` / `--dock-tray` 启动，
  // 或者设 `IRULER_DOCK_ANCHOR=left|tray`——只改摆放，不动别的行为。
  const forced = dependencies.anchor
    || (['left', 'tray'].includes(process.env.IRULER_DOCK_ANCHOR) ? process.env.IRULER_DOCK_ANCHOR : '')
    || (process.argv.includes('--dock-left') ? 'left'
      : process.argv.includes('--dock-tray') ? 'tray' : '');
  const anchor = forced || dockAnchor((dependencies.os || require('node:os')).release());
  let window;
  let follow;
  let moveTimer;
  let loadTimer;                 // 页面加载失败后的重试定时器
  let loadAttempt = 0;           // 连续失败了几次（决定下次等多久）
  // 页面的要求：显示（默认）还是藏（共享屏幕、没登录时页面会说藏）。
  // **它只是"要不要显示"的三个理由之一**，见 place() 里那段注释。
  let pageVisible = true;
  let manual = true;       // 用户从托盘里关掉它（关掉就一直不显示，直到再打开）
  let lastRequested = '';
  let edge = 'bottom';     // 任务栏在哪条边：页面据此决定卡片朝上还是朝下画
  let popup = 'left';      // 卡片/舞台画在头像条左边还是右边（Win11 条子在最左，只能往右画）
  let stripHeight = STRIP_HEIGHT;  // 头像条高度 = 任务栏厚度（页面据此定头像大小）
  let expanded = false;    // 悬停卡片是否显示；原生窗口始终预留基础卡片空间
  let stage = false;       // 「有人来看我了」的舞台亮着：窗口再长高一大截，放得下那个大角色
  let cardPx = 0;
  let stagePx = 0;         // 舞台要多高（页面报的，含来电气泡）；0 = 用老常量
  let hiddenStreak = 0;    // 「任务栏不在了」连续读到几次（见 HIDE_AFTER_MISSES）
  let peek = false;        // 只是鼠标停在头像上：人物小一倍，窗口也只留一半地方
  // 窗口宽度要**正好等于**头像条：宽一个像素都会盖住任务栏上别人的图标。真实宽度只有页面
  // 量得准（头像数、有没有"暂无人在线"那句话、条子高度都会影响），所以以页面报的为准，
  // 页面还没报之前用"按人数估"的值兜底。
  let reportedWidth = 0;
  // 量到的托盘信息（DIP）：rightOffset 是"离屏幕右端多远"，trayLeft 用来夹住不让压过去。
  let trayReserve = null;
  /**
   * 主进程自己的隐藏理由（整屏）：**每次 `place()` 现算**，不依赖 Electron 的事件。
   *
   * 用户 2026-09-22 报「头像这个 ui 有时候会消失找不到」。以前"页面要求"和"整屏要求"写的是
   * **同一个 `visible` 标志**（最后一个写的赢），而整屏那一路靠 `enter-full-screen` /
   * `leave-full-screen` 两个事件——事件漏一次（窗口先进托盘再退全屏、Electron 没发 leave……）
   * 条子就再也不回来了。现在整屏这一路改成"现算"：事件漏不漏都不影响，整屏一结束，下一个
   * 1.5 秒的 tick 自己就把它放回来。三个理由（页面 / 整屏 / 托盘开关）互不覆盖。
   */
  const systemHidden = dependencies.systemHidden || (() => false);
  // 主动 destroy（退出、关机）之后不再自己建回来；**异常**销毁要能自愈（见 follow 那个 tick）。
  let destroyed = false;
  // 上一次"为什么显示 / 为什么藏"的结论：只在变化时落盘，给下次排查留证据（见 note()）。
  let lastDecision = '';
  // Keep watching while temporarily hidden, so leaving another app's fullscreen
  // restores the dock even when no new page state or taskbar mouse event arrives.
  const canFollow = () => !destroyed && pageVisible && manual && window && !window.isDestroyed();
  const zOrder = dependencies.zOrder || createDockZOrder({ allowed: canFollow, repair: () => place() });

  const display = () => {
    try { return screenApi.getPrimaryDisplay(); } catch { return null; }
  };

  /** 问一次托盘在哪，量到就重新贴一遍（失败就继续用估算值，绝不因此报错）。 */
  async function measureTray(force = false) {
    if (!tray?.measure) return null;
    try {
      // 任务栏在 DIP 下的厚度：托盘探测靠它自校准"拿到的坐标是不是已经被缩放过了"。
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

  /**
   * 当前该贴的窗口位置（跟着任务栏走）。
   *
   * 展开与收起只差窗口大小：两种情况下窗口右边缘、下边缘都与头像条对齐，所以头像条本身
   * 稳稳待在任务栏里，卡片开了不会把条子顶跑。
   */
  function layout(overrides = {}) {
    const saved = store.read() || {};
    return position({
      // Keep the transparent preview viewport allocated while idle. Resizing a
      // Windows layered window on hover briefly presents its old backing buffer
      // at the new bounds, making the bottom-anchored avatar strip flash upward.
      // dock-pointer still accepts input only over the reported visible controls.
      display: display(), width: widthOf(), expanded: true, stage, peek, stagePx, cardPx, anchor,
      // 托盘宽度以量到的为准；量不到就退回估算值（TRAY_RESERVE）。
      rightOffset: saved.rightOffset ?? trayReserve?.rightOffset,
      trayLeft: trayReserve?.trayLeft,
      dx: saved.dx || 0, dy: saved.dy || 0,
      ...overrides,
    });
  }

  /** Stay next to Explorer in z-order, without jumping over other topmost UI. */
  function raise() {
    if (!window || window.isDestroyed()) return;
    if (zOrder.sync(window)) return;
    // Native observation unavailable: prefer being covered over obscuring video.
    window.setAlwaysOnTop(false);
  }

  /**
   * 记一次"这次为什么显示 / 为什么藏"。
   *
   * 用户 2026-09-22 报「头像这个 ui 有时候会消失找不到」——藏起来这件事以前是**完全静默**的，
   * 事后没人知道是共享屏幕、整屏、任务栏读数、还是托盘开关把它收走的。现在每次结论变化就写
   * 一行（由 main.cjs 落到 `dock-why.json`），只在**变化**时写，不会刷盘。
   */
  function note(why, box, extra = {}) {
    if (why === lastDecision) return;
    lastDecision = why;
    try {
      store.decide?.({ at: new Date().toISOString(), why, pageVisible, manual, hiddenStreak,
        ...extra, strip: box?.strip || null, screen: display()?.bounds || null });
    } catch { /* 诊断写不了不影响用 */ }
  }

  /** 按当前任务栏位置贴上去；任务栏**真的**藏起来了我们也藏。高度跟着任务栏厚度走。 */
  function place() {
    if (!window || window.isDestroyed()) return null;
    // 不传 height/stripHeight：由几何模块按任务栏厚度算（实测 40 DIP），这样"合身"。
    const box = layout();
    edge = box.edge || 'bottom';
    stripHeight = box.strip?.height || STRIP_HEIGHT;
    // 卡片/舞台画在哪一侧（页面据此把头像条钉在窗口对应的边上，免得条子被顶走）。
    popup = box.popup === 'right' ? 'right' : 'left';
    // 「任务栏藏起来了 / 这次量不到」要**连续几次**才算数：息屏、切分辨率、全屏应用、
    // 量托盘的 PowerShell 抖一下，都会让某一次读数是"没有任务栏"。一次就藏会让条子
    // 忽闪忽现（用户 2026-09-20：「有时候头像会消失闪烁」）。真藏起来了也最多多留两三秒，
    // 条子在托盘那侧、底边别处照样能把任务栏碰出来。
    if (box.hidden) hiddenStreak += 1;
    else hiddenStreak = 0;
    const taskbarGone = box.hidden && hiddenStreak >= HIDE_AFTER_MISSES;
    // **三个理由各自独立**（2026-09-22 查"头像消失找不到"时改的）：页面说（共享屏幕/没登录）、
    // 主进程说（整屏，现算）、用户说（托盘开关）。任何一个说藏就藏，但它们互不覆盖——
    // 以前共用一个标志时，最后写的那一路会把别的理由顶掉（比如整屏结束后那条事件没来，
    // 页面又一直没再推状态，条子就永远藏着）。
    const system = systemHidden() === true;
    const fullscreen = zOrder.blocked?.(window) === true;
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
    return box;
  }

  /** 用户把窗口拖到别处了：记下它相对"默认贴法"的偏移，下次还贴那儿。 */
  function remember() {
    if (!window || window.isDestroyed()) return null;
    const saved = store.read() || {};
    // 基准要用**当前的**展开状态算，否则展开时拖一下会记出一个卡片高度的假偏移。
    const base = layout({ dx: 0, dy: 0 });
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
      // showInactive + native NOACTIVATE positioning keep hover passive.
      // Do not use focusable:false: Windows then returns MA_NOACTIVATEANDEAT
      // for WM_MOUSEACTIVATE and discards the real button press.
      focusable: true,
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
    // The taskbar peer controller chooses the native band after measuring Explorer.
    window.setAlwaysOnTop(false);
    window.setVisibleOnAllWorkspaces?.(true, { visibleOnFullScreen: false });
    pointer.start();
    zOrder.start();
    // 系统重排窗口后重新对齐任务栏层级；全屏时保持隐藏。
    for (const event of ['show', 'restore', 'focus', 'blur']) {
      window.on(event, () => { if (window?.isVisible()) raise(); });
    }
    // 窗口按内容调整大小；鼠标仅由 dock-pointer 在真实控件处打开，不拦截装饰人物。
    // 基础预览空间提前预留，悬停时不再缩放原生窗口；空白由 dock-pointer 穿透。
    // 不依赖 setIgnoreMouseEvents + forward：见文件开头的实测记录。
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
    // 页面加载失败要自己重试：开机自启时网络常常还没起来，那一次 `loadURL` 会失败
    // —— 窗口是透明的，用户看到的就是"头像没出来"（用户 2026-09-20 报的其中一种）。
    const retryLoad = () => {
      if (!window || window.isDestroyed()) return;
      const delay = retryMs[Math.min(loadAttempt, retryMs.length - 1)];
      loadAttempt += 1;
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        loadTimer = undefined;
        if (window && !window.isDestroyed()) void window.loadURL(url).catch(() => {});
      }, delay);
      loadTimer.unref?.();
    };
    window.webContents.on('did-finish-load', () => { loadAttempt = 0; });
    window.webContents.on('did-fail-load', (_event, code, _description, _target, mainFrame) => {
      // -3 是我们自己打断的（换地址、重试），不算失败。
      if (mainFrame !== false && code !== -3) retryLoad();
    });
    // 渲染进程崩了（驱动/GPU 抖动）：窗口会变成一片空白，重新加载一次就好。
    window.webContents.on('render-process-gone', () => { loadAttempt = 0; retryLoad(); });
    window.webContents.once('did-finish-load', () => { void measureTray(true); place(); });
    void window.loadURL(url).catch(() => retryLoad());
    // 先按估算值贴一次（不等 PowerShell），量到托盘之后再贴一次。
    void measureTray(true);
    if (follow) clearInterval(follow);
    // 每 followMs 贴一次；托盘宽度（藏着几个图标、输入法状态）偶尔会变，所以每隔一会儿重量。
    let ticks = 0;
    follow = setInterval(() => {
      // 窗口没了（异常销毁、驱动/合成器抽风把窗口收掉）就**自己建回来**：以前只在启动时
      // `ensure()` 一次，窗口一旦被销毁，条子从此永久消失、只能重启客户端
      //（用户 2026-09-22「头像这个 ui 有时候会消失找不到」）。
      if (destroyed) return;
      if (!window || window.isDestroyed()) { ensure(); return; }
      place();
      if (++ticks % Math.max(1, Math.round(20000 / followMs)) === 0) void measureTray(true);
    }, followMs);
    // 这个定时器不该拖住进程退出（也方便单测里直接跑完）。
    follow.unref?.();
    return window;
  }

  return {
    ensure,
    place,
    /**
     * 页面要求显示/隐藏（共享屏幕、没登录时说藏）。**只管"页面那一路"**：整屏与托盘开关
     * 各自独立，谁也顶不掉谁（见 place()）。
     */
    setVisible(next, reason = '') {
      pageVisible = next !== false;
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
    /** 按人数估个宽度（页面量出真实宽度之前的兜底）。返回估出来的宽度。 */
    resize(count) {
      const next = widthFor(count);
      if (next !== size.width) {
        size = { ...size, width: next };
        place();
      }
      return next;
    },
    /** 窗口宽度 = 页面量出来的头像条宽度（页面还没报就是估算值）。 */
    width: () => widthOf(),
    /**
     * 页面报版面：卡片开没开、条子实际多宽。
     *
     * 基础预览开合保持窗口尺寸不变。更大的共享 / 会议内容仍按实测高度分配；
     * 透明空白是否穿透由可见控件的 hitRegions 决定，不靠缩窗。
     */
    applyLayout(input = {}) {
      if (Array.isArray(input.hitRegions)) pointer.update(input.hitRegions);
      const nextCardPx = Math.max(0, Math.min(700, Math.round(Number(input.cardPx) || 0)));
      const nextExpanded = input.expanded === true;
      const nextStage = input.stage === true;
      // `peek` 是"鼠标只是停在头像上"：人物小一倍，窗口也只留一半地方（用户 2026-09-20）。
      const nextPeek = nextStage && input.stageMode === 'peek';
      // 舞台多高由页面报：来电气泡（谁是来电 + 接听按钮）会让它更高（用户 2026-09-21）。
      const nextStagePx = nextStage ? Math.max(0, Math.min(900, Math.round(Number(input.stagePx) || 0))) : 0;
      const nextWidth = Math.max(0, Math.round(Number(input.width) || 0));
      const widthChanged = nextWidth > 0 && nextWidth !== reportedWidth;
      if (nextWidth > 0) reportedWidth = Math.min(MAX_WIDTH, nextWidth);
      if (nextExpanded === expanded && nextStage === stage && nextPeek === peek &&
          nextStagePx === stagePx && nextCardPx === cardPx && !widthChanged) {
        return { expanded, stage, peek, stagePx, width: widthOf() };
      }
      cardPx = nextCardPx;
      expanded = nextExpanded;
      stage = nextStage;
      peek = nextPeek;
      stagePx = nextStagePx;
      place();
      return { expanded, stage, peek, stagePx, width: widthOf() };
    },
    expanded: () => expanded,
    /** 「有人来看我了」的舞台是不是亮着（窗口现在比卡片还高一截）。 */
    stage: () => stage,
    /** 舞台是不是"只是看一眼"那一档（窗口只留一半地方）。 */
    peek: () => peek,
    /** 量到的托盘信息（DIP）；没量到就是 null（此时用估算值）。 */
    tray: () => trayReserve,
    /** 手动重新量一次（换屏、任务栏变化时用）。 */
    refreshTray: force => measureTray(force !== false),
    /** 主进程把主窗口推来的状态转发给小窗。 */
    send(channel, payload) {
      if (!window || window.isDestroyed()) return false;
      window.webContents.send(channel, payload);
      return true;
    },
    bounds: () => (window && !window.isDestroyed() ? window.getBounds() : null),
    reason: () => lastRequested,
    /** 现在为什么显示/为什么藏（`shown` / `taskbar` / `page` / `system` / `manual` / `fullscreen`）。 */
    why: () => lastDecision,
    ownership: () => ({ attached: false, ...zOrder.diagnostics() }),
    /** 整屏那一路现在是什么状态（排查用；判断本身每次 place() 现算）。 */
    systemHidden: () => systemHidden() === true,
    /** 任务栏在哪条边（bottom/top/left/right），页面用来自动翻卡片方向。 */
    edge: () => edge,
    /** 头像条高度（= 任务栏厚度）：页面据此把头像和条子做成一样高。 */
    stripHeight: () => stripHeight,
    destroy() {
      pointer.stop();
      destroyed = true;          // 主动收掉（退出、关机）之后 tick 不再自己建回来
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
    /** 头像条在窗口的哪一侧留出卡片/舞台（`left` = 卡片画在条子左边，老样子）。 */
    popup: () => popup,
    /** 任务栏现在的颜色：页面据此给头像条外面那圈框配色（读不到就返回空对象）。 */
    theme: () => theme?.current?.() || null,
    window: () => window,
  };
}

module.exports = { createDockWindow, widthFor, SIZE, FOLLOW_MS };
