// Whole-screen mode for the desktop window.
//
// The window is frameless and transparent, and in that configuration Electron does
// not reliably emit `enter-full-screen` / `leave-full-screen`: the window resizes,
// but nothing observes it. So whoever changes the state also applies the page
// classes and tells the renderer, instead of waiting for an event that may not come.
const PAGE_CLASSES = (on) =>
  `document.documentElement.classList.toggle('iruler-fullscreen', ${on});` +
  `document.documentElement.classList.toggle('iruler-maximized', ${on});`;

/** Paint the shell state for the current full-screen value. Idempotent. */
function applyFullscreenState(window, on) {
  if (!window || window.isDestroyed?.() || window.webContents?.isDestroyed?.()) return false;
  void window.webContents.executeJavaScript(PAGE_CLASSES(on), true).catch(() => {});
  window.webContents.send('office:fullscreen-changed', on === true);
  return on === true;
}

/** Enter or leave whole-screen mode and report the requested state back. */
function setWindowFullscreen(window, on) {
  if (!window || typeof window.setFullScreen !== 'function') return false;
  window.setFullScreen(on === true);
  applyFullscreenState(window, on);
  return on === true;
}

module.exports = { applyFullscreenState, setWindowFullscreen };
