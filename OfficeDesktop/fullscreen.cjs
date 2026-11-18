

const PAGE_CLASSES = (on, maximized) =>
  `document.documentElement.classList.toggle('officeworld-fullscreen', ${on});` +
  `document.documentElement.classList.toggle('officeworld-maximized', ${maximized});`;

const REQUESTED = new WeakSet();

const WAS_MAXIMIZED = new WeakSet();

function applyFullscreenState(window, on) {
  if (!window || window.isDestroyed?.() || window.webContents?.isDestroyed?.()) return false;

  const maximized = on === true || window.isMaximized?.() === true;
  void window.webContents.executeJavaScript(PAGE_CLASSES(on === true, maximized), true).catch(() => {});
  window.webContents.send('office:fullscreen-changed', on === true);
  return on === true;
}

function setWindowFullscreen(window, on) {
  if (!window || typeof window.setFullScreen !== 'function') return false;
  const wanted = on === true;

  if (!wanted && !REQUESTED.has(window) && window.isFullScreen?.() !== true) {
    applyFullscreenState(window, false);
    return false;
  }
  if (wanted) {
    REQUESTED.add(window);

    if (window.isMaximized?.() === true) WAS_MAXIMIZED.add(window);
    else WAS_MAXIMIZED.delete(window);
  } else {
    REQUESTED.delete(window);
  }
  window.setFullScreen(wanted);
  if (!wanted && WAS_MAXIMIZED.has(window)) {
    WAS_MAXIMIZED.delete(window);

    try { window.maximize?.(); } catch {  }
  }
  applyFullscreenState(window, wanted);
  return wanted;
}

function isWindowFullscreen(window) {
  if (!window || window.isDestroyed?.()) return false;
  return REQUESTED.has(window) || window.isFullScreen?.() === true;
}

function hidesDock(window) {
  if (!window || window.isDestroyed?.()) return false;
  // Electron can retain maximized/fullscreen flags after hide() or minimize().
  // Only a window actually on screen may suppress the taskbar avatars.
  if (window.isVisible?.() === false || window.isMinimized?.() === true) return false;
  return isWindowFullscreen(window) || window.isMaximized?.() === true;
}

module.exports = { applyFullscreenState, setWindowFullscreen, isWindowFullscreen, hidesDock };
