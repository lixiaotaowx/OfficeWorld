// Taskbar clicks can reorder topmost windows without focusing our non-focusable
// dock. Repair that ordering promptly while the pointer is over the taskbar,
// including the short activation animation after the pointer leaves it.
const INTERVAL_MS = 80;
const SETTLE_MS = 800;

function overTaskbar(point, display) {
  const bounds = display?.bounds;
  const work = display?.workArea;
  if (!point || !bounds || !work) return false;
  const inside = rect => point.x >= rect.x && point.y >= rect.y &&
    point.x < rect.x + rect.width && point.y < rect.y + rect.height;
  return inside(bounds) && !inside(work);
}

function createTaskbarGuard({ screen, allowed, raise, now = Date.now,
  setInterval: schedule = setInterval, clearInterval: cancel = clearInterval }) {
  let timer;
  let until = 0;
  function tick() {
    // Never reveal a dock hidden by sharing, full screen, sign-out or its switch.
    if (!allowed()) { until = 0; return; }
    try {
      const time = now();
      if (overTaskbar(screen.getCursorScreenPoint(), screen.getPrimaryDisplay())) {
        until = time + SETTLE_MS;
      }
      if (until > time) raise();
    } catch { /* Screen unavailable during sleep/display changes; slow follow remains. */ }
  }
  return {
    start() {
      if (timer !== undefined) return;
      timer = schedule(tick, INTERVAL_MS);
      timer.unref?.();
    },
    stop() {
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      until = 0;
    },
  };
}

module.exports = { createTaskbarGuard, overTaskbar, INTERVAL_MS, SETTLE_MS };
