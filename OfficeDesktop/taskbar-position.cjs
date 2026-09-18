// 任务栏头像条贴在哪儿。
//
// Windows 不提供"任务栏图标区到哪里结束、托盘从哪里开始"的接口，所以位置只能这样算：
// 用显示器 bounds 与 workArea 的差判断任务栏在哪条边、多厚，再从那条边的右端留一个
// 偏移量（默认贴在托盘左边，用户拖过之后记住拖出来的 dx）。任务栏自动隐藏时 workArea
// 等于 bounds —— 那时必须跟着藏，否则鼠标永远碰不到底边，任务栏就再也弹不出来。
//
// 注意：窗口比"头像条"本身高，因为悬停卡片要画在头像条上方（透明区域）。窗口下边缘与
// 头像条下边缘对齐，所以卡片始终在窗口内部，不会被裁掉。
//
// 全是纯函数：不碰 Electron，方便把四条边、自动隐藏、多屏、DPI 都做成单测。
const EDGE_TOP = 'top', EDGE_BOTTOM = 'bottom', EDGE_LEFT = 'left', EDGE_RIGHT = 'right';

/** 托盘 + 时钟那一块的默认宽度（DIP）。Windows 不告诉我们真实值，所以可拖动修正。 */
const TRAY_RESERVE = 220;
/** 头像条本身的高度（和任务栏图标差不多高）。 */
const STRIP_HEIGHT = 44;
/** 窗口比头像条多出来的高度：给悬停卡片留的地方（卡片约 183 高）。 */
const CARD_SPACE = 210;
/** 悬停卡片需要的最小宽度：窗口不能比它窄，否则卡片会被窗口边界裁掉。 */
const CARD_WIDTH = 340;

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
 * 头像条（以及承载它的窗口）应该放在哪里。`hidden: true` 表示"任务栏自己藏起来了，
 * 我们也别显示"。`dx/dy` 是用户拖动记下来的偏移；`rightOffset` 是离任务栏右端的距离。
 * 返回的 `x/y/width/height` 是**窗口**的位置；`strip` 是头像条在窗口里的位置。
 */
function dockBounds(input) {
  const { display } = input;
  const stripWidth = input.width;
  const stripHeight = input.stripHeight ?? STRIP_HEIGHT;
  // 窗口至少和卡片一样宽（否则卡片会被窗口边界裁掉），头像条靠右贴住托盘那一侧。
  const width = Math.max(stripWidth, input.minWidth ?? CARD_WIDTH);
  const height = input.height ?? STRIP_HEIGHT + CARD_SPACE;
  const rightOffset = input.rightOffset ?? TRAY_RESERVE;
  const dx = input.dx || 0, dy = input.dy || 0;
  const bar = taskbarRect(display);
  if (!bar.bounds || bar.hidden || bar.thickness <= 0) {
    return { hidden: true, edge: bar.edge, x: 0, y: 0, width, height,
      strip: { x: 0, y: 0, width: stripWidth, height: stripHeight } };
  }
  const { bounds } = bar;
  // 竖着的任务栏里，头像条也竖着排：放在靠下的位置（离底边同样的偏移量）。
  const vertical = bar.edge === EDGE_LEFT || bar.edge === EDGE_RIGHT;
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

  const stripX = vertical ? across(stripWidth, dx) : along(stripWidth, rightOffset, dx);
  const stripY = vertical ? along(stripHeight, rightOffset, dy) : across(stripHeight, dy);
  // 窗口右边缘与头像条右边缘对齐（所以窗口是往左长出来的），下边缘与头像条下边缘对齐，
  // 卡片画在头像条上方；任务栏在屏幕上方时窗口向下展开、卡片朝下。
  const windowX = stripX + stripWidth - width;
  const windowY = bar.edge === EDGE_TOP ? stripY : stripY + stripHeight - height;
  const minY = bounds.y, maxY = bounds.y + bounds.height - height;
  return {
    hidden: false, edge: bar.edge,
    x: Math.round(clamp(windowX, bounds.x, bounds.x + bounds.width - width)),
    y: Math.round(clamp(windowY, minY, Math.max(minY, maxY))),
    width, height,
    strip: { x: Math.round(stripX), y: Math.round(stripY), width: stripWidth, height: stripHeight },
    thickness: bar.thickness,
  };
}

module.exports = { taskbarRect, dockBounds, TRAY_RESERVE, STRIP_HEIGHT, CARD_SPACE, CARD_WIDTH,
  EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT };
