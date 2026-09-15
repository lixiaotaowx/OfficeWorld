// Whole-screen mode for the desktop window.
//
// The window is frameless and transparent, and in that configuration Electron does
// not reliably emit `enter-full-screen` / `leave-full-screen`: the window resizes,
// but nothing observes it. So whoever changes the state also applies the page
// classes and tells the renderer, instead of waiting for an event that may not come.
//
// LEAVING IS NOT A NO-OP. Chromium answers `setFullScreen(false)` by restoring the
// window's saved placement, so firing it at a window that was never put into whole
// screen shrinks that window to a stale placement. That is why a plain call made the
// app window smaller on hang-up (user, 2026-09-15: "挂断后为啥软件还变小了"): the
// call Unmounted the shared-screen stage, and its cleanup asked to leave full screen
// whether or not it had ever entered it. This module therefore refuses a leave for a
// window it never took, so every caller — the renderer, F11, a page reload — shares
// one guard instead of each having to know the shell's state.
const PAGE_CLASSES = (on, maximized) =>
  `document.documentElement.classList.toggle('iruler-fullscreen', ${on});` +
  `document.documentElement.classList.toggle('iruler-maximized', ${maximized});`;

/** Windows this module has put into whole-screen mode, so it may take them back out. */
const REQUESTED = new WeakSet();

/** Paint the shell state for the current full-screen value. Idempotent. */
function applyFullscreenState(window, on) {
  if (!window || window.isDestroyed?.() || window.webContents?.isDestroyed?.()) return false;
  // Leaving whole-screen mode hands the window back in whatever state it really is:
  // assuming "not maximised" would round the corners of a maximised window.
  const maximized = on === true || window.isMaximized?.() === true;
  void window.webContents.executeJavaScript(PAGE_CLASSES(on === true, maximized), true).catch(() => {});
  window.webContents.send('office:fullscreen-changed', on === true);
  return on === true;
}

/**
 * Enter or leave whole-screen mode and report the requested state back.
 * @returns whether the window is meant to be in whole-screen mode now.
 */
function setWindowFullscreen(window, on) {
  if (!window || typeof window.setFullScreen !== 'function') return false;
  const wanted = on === true;
  // Nothing to leave: this module never put the window there and the window does not
  // report itself full screen, so calling setFullScreen(false) would only resize it.
  if (!wanted && !REQUESTED.has(window) && window.isFullScreen?.() !== true) {
    applyFullscreenState(window, false);
    return false;
  }
  if (wanted) REQUESTED.add(window); else REQUESTED.delete(window);
  window.setFullScreen(wanted);
  applyFullscreenState(window, wanted);
  return wanted;
}

module.exports = { applyFullscreenState, setWindowFullscreen };
