// Read the cursor from Electron's screen API, not forwarded DOM mousemove: on
// Windows transparent windows ignore+forward can stop delivering those events.
function cleanHitRegions(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 80).filter(row => row &&
    ['x', 'y', 'width', 'height'].every(key => Number.isFinite(row[key])) &&
    row.width > 0 && row.height > 0).map(row => ({
    x: Math.max(0, Math.min(4096, row.x)), y: Math.max(0, Math.min(4096, row.y)),
    width: Math.min(4096, row.width), height: Math.min(4096, row.height),
  }));
}

function createDockPointer({ screen, getWindow }) {
  let regions = [];
  let timer;
  let previousWindow;
  let ignored;
  let measured = false;
  function sync() {
    const window = getWindow();
    if (!window || window.isDestroyed() || !screen.getCursorScreenPoint) return;
    if (window !== previousWindow) { previousWindow = window; ignored = undefined; }
    const point = screen.getCursorScreenPoint();
    const box = window.getBounds();
    const x = point.x - box.x, y = point.y - box.y;
    const next = !regions.some(r => x >= r.x && y >= r.y &&
      x < r.x + r.width && y < r.y + r.height);
    if (next !== ignored) {
      window.setIgnoreMouseEvents(next);
      ignored = next;
    }
  }
  return {
    update(value) { measured = true; regions = cleanHitRegions(value); sync(); },
    fallback(value) { if (!measured) { regions = cleanHitRegions(value); sync(); } },
    start() {
      if (timer || !screen.getCursorScreenPoint) return;
      sync();
      timer = setInterval(sync, 16);
      timer.unref?.();
    },
    stop() { clearInterval(timer); timer = undefined; regions = []; },
    sync,
  };
}
module.exports = { createDockPointer, cleanHitRegions };
