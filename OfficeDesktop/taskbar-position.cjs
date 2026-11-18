

const EDGE_TOP = 'top', EDGE_BOTTOM = 'bottom', EDGE_LEFT = 'left', EDGE_RIGHT = 'right';

const TRAY_RESERVE = 220;

const LEFT_GAP = 8;

const STRIP_HEIGHT = 40;
const MIN_STRIP_HEIGHT = 28;
const MAX_STRIP_HEIGHT = 64;

const CARD_SPACE = 210;

const STAGE_SPACE = 390;

const PEEK_SPACE = 200;

const CARD_WIDTH = 340;

const STAGE_WIDTH = 320;

const PEEK_WIDTH = 168;

const MIN_STAGE_PX = 120;
const MAX_STAGE_PX = 700;

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

function dockAnchor(release) {
  const build = Number(String(release ?? '').split('.')[2]);
  return Number.isFinite(build) && build >= 22000 ? 'left' : 'tray';
}

function dockBounds(input) {
  const { display } = input;
  const stripWidth = input.width;

  const expanded = input.expanded !== false;

  const stage = input.stage === true;

  const peek = stage && input.peek === true;
  const minWidth = input.minWidth
    ?? (input.cardPx > 0 ? CARD_WIDTH : stage ? (peek ? PEEK_WIDTH : STAGE_WIDTH) : expanded ? CARD_WIDTH : 0);

  const width = Math.max(stripWidth, minWidth);
  const rightOffset = input.rightOffset ?? TRAY_RESERVE;
  const dx = input.dx || 0, dy = input.dy || 0;
  const bar = taskbarRect(display);

  const stripHeight = input.stripHeight ?? clamp(bar.thickness || STRIP_HEIGHT, MIN_STRIP_HEIGHT, MAX_STRIP_HEIGHT);

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

  const vertical = bar.edge === EDGE_LEFT || bar.edge === EDGE_RIGHT;

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

  const across = (size, extra) => clamp(
    acrossStart + Math.max(0, Math.round((bar.thickness - size) / 2)) + extra,
    acrossStart, acrossStart + Math.max(0, bar.thickness - size));

  const stripX = vertical ? across(stripWidth, dx)
    : atLeft ? clamp(bounds.x + (input.leftGap ?? LEFT_GAP) + dx,
        bounds.x, Math.max(bounds.x, bounds.x + bounds.width - stripWidth))
      : along(stripWidth, rightOffset, dx);
  const stripY = vertical ? along(stripHeight, rightOffset, dy) : across(stripHeight, dy);

  const trayLeft = Number.isFinite(input.trayLeft) ? input.trayLeft : null;
  const stripXFinal = atLeft || trayLeft == null || vertical
    ? stripX
    : Math.min(stripX, trayLeft - (input.trayGap ?? 8) - stripWidth);

  const needWidth = input.popupWidth ?? CARD_WIDTH;
  const roomLeft = stripXFinal - bounds.x;
  const roomRight = bounds.x + bounds.width - (stripXFinal + stripWidth);
  const popup = vertical ? 'left' : roomLeft >= needWidth || roomLeft >= roomRight ? 'left' : 'right';

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
