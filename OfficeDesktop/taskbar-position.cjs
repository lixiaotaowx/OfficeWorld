// 任务栏头像条贴在哪儿。
//
// Windows 不提供"任务栏图标区到哪里结束、托盘从哪里开始"的接口，所以位置只能这样算：
// 用显示器 bounds 与 workArea 的差判断任务栏在哪条边、多厚，再从那条边的右端留一个
// 偏移量（默认贴在托盘左边，用户拖过之后记住拖出来的 dx）。任务栏自动隐藏时 workArea
// 等于 bounds —— 那时必须跟着藏，否则鼠标永远碰不到底边，任务栏就再也弹不出来。
//
// 窗口默认比"头像条"本身高，因为悬停卡片要画在头像条上方（透明区域）；没有人悬停时
// 用 `expanded: false` 把窗口收成"就是头像条本身"——小窗现在始终接收鼠标事件（见
// dock-window.cjs 里为什么不用 setIgnoreMouseEvents），多出来的透明区不能一直盖着任务栏。
// 两种情况下窗口右边缘都与头像条右边缘对齐、下边缘都与头像条下边缘对齐，所以卡片始终在
// 窗口内部、不会被裁掉，卡片开合也不会让头像条跳动。
//
// 全是纯函数：不碰 Electron，方便把四条边、自动隐藏、多屏、DPI 都做成单测。
const EDGE_TOP = 'top', EDGE_BOTTOM = 'bottom', EDGE_LEFT = 'left', EDGE_RIGHT = 'right';

/** 托盘 + 时钟那一块的**估算**宽度（DIP）：真实值由 tray-area.cjs 量出来（Win32 的
 *  `TrayNotifyWnd`），量不到才用这个数。实测这台机器托盘 256px，所以 220 本来就会压进去。 */
const TRAY_RESERVE = 220;
/** 贴屏幕最左侧时留的空隙（DIP）。 */
const LEFT_GAP = 8;
/** 头像条本身的高度范围（真实值取自任务栏厚度，实测这台 40 DIP）。 */
const STRIP_HEIGHT = 40;
const MIN_STRIP_HEIGHT = 28;
const MAX_STRIP_HEIGHT = 64;
/** 窗口比头像条多出来的高度：给悬停卡片留的地方（卡片约 183 高）。 */
const CARD_SPACE = 210;
/** 「有人来看我了」的舞台：一个 380 高的大角色站在条子上，比卡片高得多。 */
const STAGE_SPACE = 390;
/** 只是鼠标停在头像上（`peek`）：人物小一倍，窗口也只留一半地方（用户 2026-09-20）。 */
const PEEK_SPACE = 200;
/** 悬停卡片需要的最小宽度：窗口不能比它窄，否则卡片会被窗口边界裁掉。 */
const CARD_WIDTH = 340;
/** 舞台的宽度（角色 300 宽 + 两边留一点）。 */
const STAGE_WIDTH = 320;
/** peek 舞台的宽度（160 的画布 + 两边留一点）。 */
const PEEK_WIDTH = 168;
/** 页面报上来的舞台高度夹在这个范围里（挡脏数据：太小会被裁、太大挡住半个屏幕）。 */
const MIN_STAGE_PX = 120;
const MAX_STAGE_PX = 700;

/** 任务栏在哪条边、多厚、是不是自动隐藏了。 */
function taskbarRect(display) {
  const bounds = display?.bounds;
  const work = display?.workArea || bounds;
  if (!bounds) return { edge: EDGE_BOTTOM, thickness: 48, hidden: true, bounds: null, workArea: null };
  const hidden = work.x === bounds.x && work.y === bounds.y &&
    work.width === bounds.width && work.height === bounds.height;
  let edge = EDGE_BOTTOM;
  if (work.y > bounds.y) edge = EDGE_TOP;
  else if (work.x > bounds.x) edge = EDGE_LEFT;
  else if (work.width < bounds.width && work.x === bounds.x) edge = EDGE_RIGHT;
  const thickness = edge === EDGE_TOP || edge === EDGE_BOTTOM
    ? bounds.height - work.height : bounds.width - work.width;
  return { edge, thickness: Math.max(0, thickness), hidden, bounds, workArea: work };
}

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

/**
 * 头像条贴在任务栏的哪一端（用户 2026-09-18：「Windows11 系统的话就把头像简单放在屏幕
 * 最左侧，Windows10 保持当下状态」）。
 *
 * Windows 11（build ≥ 22000）默认把图标**居中**，任务栏最左边是空的，所以条子放最左侧既
 * 不挡图标也不挡托盘；Windows 10 图标靠左、右边是托盘，继续按现在这样贴托盘左边。
 * `release` 是 `os.release()`，形如 `10.0.22631`（第三个数字是 build）。
 */
function dockAnchor(release) {
  const build = Number(String(release ?? '').split('.')[2]);
  return Number.isFinite(build) && build >= 22000 ? 'left' : 'tray';
}

/**
 * 头像条（以及承载它的窗口）应该放在哪里。`hidden: true` 表示"任务栏自己藏起来了，
 * 我们也别显示"。`dx/dy` 是用户拖动记下来的偏移；`rightOffset` 是离任务栏右端的距离。
 * `expanded !== false` 时窗口给悬停卡片留出让空间（更高、至少和卡片一样宽）；
 * 收起时窗口就是头像条本身那么大，一个像素都不多占任务栏。
 * 返回的 `x/y/width/height` 是**窗口**的位置；`strip` 是头像条在屏幕上的位置。
 */
function dockBounds(input) {
  const { display } = input;
  const stripWidth = input.width;
  // 默认仍然是"留出卡片空间"（没人悬停时调用方会显式传 expanded: false 收起来）。
  const expanded = input.expanded !== false;
  // 「有人来看我了」的舞台比卡片高得多：`stage: true` 时窗口长到放得下那个大角色。
  const stage = input.stage === true;
  // `peek` 是"鼠标只是停在头像上"：同一套取景下人物小一倍，窗口也跟着只留一半地方，
  // 免得白白挡住任务栏上方一大片（用户 2026-09-20）。
  const peek = stage && input.peek === true;
  const minWidth = input.minWidth
    ?? (input.cardPx > 0 ? CARD_WIDTH : stage ? (peek ? PEEK_WIDTH : STAGE_WIDTH) : expanded ? CARD_WIDTH : 0);
  // 展开时窗口至少和卡片一样宽（否则卡片会被窗口边界裁掉），收起时不用。
  const width = Math.max(stripWidth, minWidth);
  const rightOffset = input.rightOffset ?? TRAY_RESERVE;
  const dx = input.dx || 0, dy = input.dy || 0;
  const bar = taskbarRect(display);
  // 头像条的高度就取任务栏的厚度（实测这台是 40 DIP）——比任务栏高或矮都会显得"不合身"。
  const stripHeight = input.stripHeight ?? clamp(bar.thickness || STRIP_HEIGHT, MIN_STRIP_HEIGHT, MAX_STRIP_HEIGHT);
  // 舞台要多高由**页面**报（`stagePx`）：人物画布 + 来电气泡（用户 2026-09-21 加了接听按钮）
  // 会一起变高，写死在主进程里气泡就会被窗口边界裁掉。没报（或报得离谱地小）就退回老常量。
  const stagePx = stage && input.stagePx >= MIN_STAGE_PX
    ? clamp(Math.round(input.stagePx), MIN_STAGE_PX, MAX_STAGE_PX) : 0;
  const cardSpace = expanded ? Math.max(CARD_SPACE, Math.min(700, Number(input.cardPx) || 0)) : 0;
  const height = input.height
    ?? (stage ? stripHeight + Math.max(Number(input.cardPx) || 0, stagePx || (peek ? PEEK_SPACE : STAGE_SPACE))
      : expanded ? stripHeight + cardSpace : stripHeight);
  if (!bar.bounds || bar.hidden || bar.thickness <= 0) {
    return { hidden: true, edge: bar.edge, popup: 'left', x: 0, y: 0, width, height,
      strip: { x: 0, y: 0, width: stripWidth, height: stripHeight } };
  }
  const { bounds } = bar;
  // 竖着的任务栏里，头像条也竖着排：放在靠下的位置（离底边同样的偏移量）。
  const vertical = bar.edge === EDGE_LEFT || bar.edge === EDGE_RIGHT;
  // Windows 11 把条子放在屏幕最左侧（见 dockAnchor），Windows 10 仍是贴托盘左边。
  const atLeft = input.anchor === 'left' && !vertical;
  const along = (size, offset, extra) => {
    if (!vertical) {
      return clamp(bounds.x + bounds.width - offset - size + extra,
        bounds.x, bounds.x + bounds.width - size);
    }
    return clamp(bounds.y + bounds.height - offset - size + extra,
      bounds.y, bounds.y + bounds.height - size);
  };
  const acrossStart = bar.edge === EDGE_BOTTOM ? bounds.y + bounds.height - bar.thickness
    : bar.edge === EDGE_TOP ? bounds.y
      : bar.edge === EDGE_LEFT ? bounds.x : bounds.x + bounds.width - bar.thickness;
  // 头像条在任务栏里竖直居中（横着的任务栏），或者贴着内边居中（竖着的任务栏）。
  const across = (size, extra) => clamp(
    acrossStart + Math.max(0, Math.round((bar.thickness - size) / 2)) + extra,
    acrossStart, acrossStart + Math.max(0, bar.thickness - size));

  const stripX = vertical ? across(stripWidth, dx)
    : atLeft ? clamp(bounds.x + (input.leftGap ?? LEFT_GAP) + dx,
        bounds.x, Math.max(bounds.x, bounds.x + bounds.width - stripWidth))
      : along(stripWidth, rightOffset, dx);
  const stripY = vertical ? along(stripHeight, rightOffset, dy) : across(stripHeight, dy);
  // 托盘左边缘（DIP，绝对坐标，由调用方量出来）：**不许压过去**——就算用户把条子往右拖、
  // 或者估算值偏小，也要在这里夹住（用户 2026-09-18 报障：条子盖在输入法那堆按钮上了）。
  // 放在屏幕最左侧时（Win11）根本不会碰到托盘，这条夹紧就不适用。
  const trayLeft = Number.isFinite(input.trayLeft) ? input.trayLeft : null;
  const stripXFinal = atLeft || trayLeft == null || vertical
    ? stripX
    : Math.min(stripX, trayLeft - (input.trayGap ?? 8) - stripWidth);
  // 悬停卡片/舞台画在头像条的哪一侧（用户 2026-09-20：「小窗口出现的方向多变一下」）。
  //
  // Windows 11 把条子放在屏幕最左端，左边根本没有地方画卡片；老样子"窗口往左长"会被屏幕
  // 左边缘夹住，于是窗口右边缘不再和头像条对齐，页面里靠右对齐的头像条就被顶到别处去了——
  // 用户看到的就是「出现大窗口时头像会自适应位移」。所以这一侧要挑**有地方的那边**，
  // 挑定之后窗口就是往那一边长的，头像条本身一个像素都不动。
  //
  // 用 `CARD_WIDTH` 当参考宽度（而不是当前状态的 minWidth）：卡片、舞台、peek 三种状态的
  // 判断必须一致，否则状态一变条子就会左右横跳。
  const needWidth = input.popupWidth ?? CARD_WIDTH;
  const roomLeft = stripXFinal - bounds.x;
  const roomRight = bounds.x + bounds.width - (stripXFinal + stripWidth);
  const popup = vertical ? 'left' : roomLeft >= needWidth || roomLeft >= roomRight ? 'left' : 'right';
  // 往哪边长的窗口对齐方式：往左长 → 右边缘与头像条右边缘对齐；往右长 → 左边缘对齐。
  // 页面那边按同一个 `popup` 把头像条钉在窗口的对应边上（dock.css 的 .dock.popup-right）。
  const windowX = popup === 'right' ? stripXFinal : stripXFinal + stripWidth - width;
  const windowY = bar.edge === EDGE_TOP ? stripY : stripY + stripHeight - height;
  const minY = bounds.y, maxY = bounds.y + bounds.height - height;
  return {
    hidden: false, edge: bar.edge, popup,
    x: Math.round(clamp(windowX, bounds.x, bounds.x + bounds.width - width)),
    y: Math.round(clamp(windowY, minY, Math.max(minY, maxY))),
    width, height,
    strip: { x: Math.round(stripXFinal), y: Math.round(stripY), width: stripWidth, height: stripHeight },
    thickness: bar.thickness,
  };
}

module.exports = { taskbarRect, dockBounds, dockAnchor, TRAY_RESERVE, LEFT_GAP, STRIP_HEIGHT,
  MIN_STRIP_HEIGHT, MAX_STRIP_HEIGHT, CARD_SPACE, CARD_WIDTH, STAGE_SPACE, STAGE_WIDTH,
  PEEK_SPACE, PEEK_WIDTH, MIN_STAGE_PX, MAX_STAGE_PX,
  EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT };
