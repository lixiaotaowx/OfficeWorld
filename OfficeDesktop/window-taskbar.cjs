'use strict';

/**
 * Windows can keep a taskbar button for a window that is created hidden (the
 * lean page made after the hall closes) or hidden after being shown, unless
 * skipTaskbar is set. A hall that was closed must leave no taskbar button
 * behind; the Dock strip and the tray icon are the only visible remainders.
 */

function applyTaskbarVisibility(window, visible) {
  if (!window || window.isDestroyed?.() || typeof window.setSkipTaskbar !== 'function') return;
  window.setSkipTaskbar(!visible);
}

/** Keep skipTaskbar in step with show/hide; hiddenAtStart matches a lean window. */
function attachTaskbarVisibility(window, { hiddenAtStart = false } = {}) {
  applyTaskbarVisibility(window, !hiddenAtStart);
  const show = () => applyTaskbarVisibility(window, true);
  const hide = () => applyTaskbarVisibility(window, false);
  window.on('show', show);
  window.on('hide', hide);
  return () => {
    window.removeListener?.('show', show);
    window.removeListener?.('hide', hide);
  };
}

module.exports = { attachTaskbarVisibility, applyTaskbarVisibility };
