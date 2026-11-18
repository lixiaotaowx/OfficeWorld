'use strict';
const { refreshBusy, PAGE_STATE } = require('./page-refresh.cjs');

// A hall page that has shown the 3D hall keeps well over 100 MB after the scene
// is discarded: decoders, model buffers and the allocator's own reserve are not
// script data and never go back to the system. Once the window has stayed closed
// and nothing is in progress, swap() replaces that page with a fresh one that
// only feeds the taskbar avatars; it loads the hall again when it is shown.
const HALL_ASLEEP = '!window.__hall';

function createLeanSwap({ getWindow, heavy, busy, dockState, dockWindow, swap,
  delay = 7000, retry = 5000, schedule = setTimeout, cancel = clearTimeout }) {
  let timer, running = false, disposed = false;
  const hidden = () => {
    const window = getWindow();
    return Boolean(window && !window.isDestroyed() && !window.isVisible() && heavy());
  };
  const idle = () => {
    const state = dockState();
    return !busy() && !refreshBusy(state) && !state.chat?.open;
  };
  const again = () => { cancel(timer); timer = schedule(check, retry); timer?.unref?.(); };
  async function check() {
    if (disposed || running || !hidden()) return;
    running = true;
    let done = false;
    try {
      if (!idle()) return;
      const main = getWindow().webContents;
      if (main.isLoading?.()) return;
      // The hall discards its own scene only when nothing is being played or built.
      if (!await main.executeJavaScript(HALL_ASLEEP)) return;
      const dock = dockWindow?.();
      const pages = [main, ...(dock && !dock.isDestroyed() ? [dock.webContents] : [])];
      for (const page of pages) if ((await page.executeJavaScript(PAGE_STATE)).editing) return;
      if (disposed || !hidden() || !idle()) return;
      swap();
      done = true;
    } catch { /* The page is loading or closing: try again later. */ }
    finally {
      running = false;
      if (!done && !disposed && hidden()) again();
    }
  }
  return {
    arm() { if (disposed) return; cancel(timer); timer = schedule(check, delay); timer?.unref?.(); },
    disarm() { cancel(timer); },
    dispose() { disposed = true; cancel(timer); },
  };
}
module.exports = { createLeanSwap };
