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

/**
 * 这个窗口进整屏之前是不是**最大化**的。退出整屏时要还原成它。
 *
 * `setFullScreen(false)` 会让 Windows 恢复窗口"上一次的摆放"，对无边框透明窗口来说那一位
 * 常常是"普通大小"——于是一个最大化着看视频的人，退出后就得到一个缩小过的窗口。
 */
const WAS_MAXIMIZED = new WeakSet();

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
  if (wanted) {
    REQUESTED.add(window);
    // 记住进来之前是不是最大化（见 WAS_MAXIMIZED）。
    if (window.isMaximized?.() === true) WAS_MAXIMIZED.add(window);
    else WAS_MAXIMIZED.delete(window);
  } else {
    REQUESTED.delete(window);
  }
  window.setFullScreen(wanted);
  if (!wanted && WAS_MAXIMIZED.has(window)) {
    WAS_MAXIMIZED.delete(window);
    // 回到"最大化着看"的那一屏，而不是被恢复成一个小窗口（用户 2026-10-14 的通用逻辑：
    // 最大化看视频 → 退出后还在最大化）。
    try { window.maximize?.(); } catch { /* 平台不支持就按系统恢复的来 */ }
  }
  applyFullscreenState(window, wanted);
  return wanted;
}

/**
 * 这个窗口现在算不算"整屏"。
 *
 * **不能只看 `window.isFullScreen()`**：2026-09-22 真机实测（`Build/dock-why-check.mjs`）——
 * 页面调 `officeDesktop.setFullscreen(true)` 之后，页面上的 `iruler-fullscreen` 类加上了、
 * 窗口也确实铺满了屏幕，但 `isFullScreen()` 仍然返回 **false**（无边框 + 透明窗口上它不可靠，
 * 和上面那句"事件也不会来"是同一个毛病）。所以自己请求过的状态（`REQUESTED`）也算数：
 * 我们要么是在自己这边进的整屏，要么是外面（F11/系统）真的把它变成整屏了。
 *
 * 头像条"整屏时藏起来"就靠这个判断（`main.cjs` 的 `systemHidden`）。
 */
function isWindowFullscreen(window) {
  if (!window || window.isDestroyed?.()) return false;
  return REQUESTED.has(window) || window.isFullScreen?.() === true;
}

/**
 * 现在要不要把任务栏头像条藏起来。
 *
 * 两种场合（用户 2026-10-14：「当状态栏小窗口出现视频共享画面时，点击最大化，这个小窗口
 * 会消失；当最小化时，这个小窗口就会出现。这就是这种常见的逻辑」）：
 *   * **整屏**（`isWindowFullscreen`）—— 条子本来就该让位；
 *   * **最大化** —— 这一条以前漏了：在软件窗口里最大化看共享画面时，窗口只是"最大化"、
 *     并没进原生整屏，所以旧判断返回 false，条子照旧挂在画面右下角上。
 *
 * **最小化不算**：窗口缩下去的时候屏幕上没有画面要遮，条子应该正常出现（用户那句话的另一半）。
 * 千万别改成"只要不是普通大小就藏"——最小化也会被算进去，条子会跟着窗口一起消失。
 */
function hidesDock(window) {
  if (!window || window.isDestroyed?.()) return false;
  return isWindowFullscreen(window) || window.isMaximized?.() === true;
}

module.exports = { applyFullscreenState, setWindowFullscreen, isWindowFullscreen, hidesDock };
