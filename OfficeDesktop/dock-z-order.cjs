

const { loadDesktopState, foregroundFullscreen } = require('./dock-desktop-state.cjs');
let cachedNative;
function windowHandle(window) {
  const bytes = window.getNativeWindowHandle();
  return bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE());
}

function intersects(a, b) {
  return Boolean(a && b && a.right > a.left && a.bottom > a.top && b.right > b.left && b.bottom > b.top &&
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
}

function canCover(native, candidate, bounds) {
  return Boolean(candidate && (Number(native.style(candidate, -20)) & 8) && native.visible(candidate) &&
    !native.minimized(candidate) && !native.cloaked(candidate) && intersects(native.frame(candidate), bounds));
}

function coveredByTopmost(native, hwnd) {
  const bounds = native.frame(hwnd);
  for (let current = native.getWindow(hwnd, 3), count = 0; current && count < 2048; current = native.getWindow(current, 3), count++) {
    if (!(Number(native.style(current, -20)) & 8)) break;
    if (canCover(native, current, bounds)) return true;
  }
  return false;
}

function loadNative() {
  if (cachedNative) return cachedNative;
  const k = require('koffi');
  const u = k.load('user32.dll');
  const callbackType = k.proto('void __stdcall DockOrderEvent(uintptr_t, uint32_t, uintptr_t, int32_t, int32_t, uint32_t, uint32_t)');
  const hook = u.func('uintptr_t __stdcall SetWinEventHook(uint32_t,uint32_t,uintptr_t,void *,uint32_t,uint32_t,uint32_t)');
  const unhook = u.func('int32_t __stdcall UnhookWinEvent(uintptr_t)');
  cachedNative = {
    ...loadDesktopState(k, u),
    find: u.func('uintptr_t __stdcall FindWindowW(str16,str16)'),
    getWindow: u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)'),
    style: u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)'),
    visible: u.func('int32_t __stdcall IsWindowVisible(uintptr_t)'),
    setOwner: u.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t,int,intptr_t)'),
    position: u.func('int32_t __stdcall SetWindowPos(uintptr_t,intptr_t,int,int,int,int,uint32_t)'),
    watch(notify) {

      const callback = k.register((_hook, event, hwnd, object) => {
        if (event === 3 || object === 0) notify(event, hwnd);
      }, k.pointer(callbackType));
      const hooks = [[3, 3], [0x8000, 0x8004], [0x800b, 0x800b]]
        .map(([min, max]) => hook(min, max, 0, callback, 0, 0, 0));
      const stop = () => { for (const h of hooks) if (h) unhook(h); k.unregister(callback); };
      if (hooks.some(h => !h)) { stop(); throw Error('window-event-hook-failed'); }
      return stop;
    },
  };
  return cachedNative;
}

function createDockZOrder({ platform = process.platform, load = loadNative,
  allowed = () => false, pinned = () => false, repair = () => {} } = {}) {
  let native, stopWatching, queued, watchdog, currentWindow, error = '', watching = false;
  let repairs = 0;
  let fullscreen = false;
  function start() {
    if (platform !== 'win32' || watching) return;
    try {
      native ??= load();
      stopWatching = native.watch((event = 3, hwnd = 0) => {
        try {
          if (!watching || !allowed() || queued) return;
          if (event !== 3) {
            const own = currentWindow && !currentWindow.isDestroyed() ? windowHandle(currentWindow) : 0;
            const taskbar = native.find('Shell_TrayWnd', null);
            const foreground = native.foreground();
            if (BigInt(hwnd) !== BigInt(own) && BigInt(hwnd) !== BigInt(taskbar) &&
                BigInt(hwnd) !== BigInt(foreground) &&
                (!pinned() || !own || !canCover(native, hwnd, native.frame(own)))) return;
          }
          queued = setTimeout(() => { queued = undefined; if (allowed()) repair(); }, 0);
        } catch (cause) { error = String(cause.message || cause); }
      });
      watching = true;
    } catch (cause) { error = String(cause.message || cause); }
  }
  const controller = {
    start,
    blocked(window) {
      currentWindow = window;
      if (pinned()) { fullscreen = false; return false; }
      if (platform !== 'win32' || !window?.getNativeWindowHandle || window.isDestroyed()) return false;
      try {
        native ??= load();
        fullscreen = foregroundFullscreen(native, windowHandle(window));
      } catch (cause) { error = String(cause.message || cause); }
      return fullscreen;
    },
    sync(window) {
      currentWindow = window;
      if (platform !== 'win32' || !window?.getNativeWindowHandle || window.isDestroyed()) return false;
      try {
        native ??= load();
        const hwnd = windowHandle(window);

        if (controller.blocked(window)) { if (window.isVisible?.()) window.hide(); return true; }
        const taskbar = native.find('Shell_TrayWnd', null);

        if (taskbar && BigInt(native.getWindow(hwnd, 4)) === BigInt(taskbar)) {
          native.setOwner(hwnd, -8, 0);
        }
        const dockTopmost = (Number(native.style(hwnd, -20)) & 8) !== 0;
        const position = after => {

          if (!native.position(hwnd, after, 0, 0, 0, 0, 0x213)) throw Error('taskbar-order-failed');
          repairs++;
        };
        if (pinned()) {
          if (!dockTopmost || coveredByTopmost(native, hwnd)) position(-1);
          error = '';
          return true;
        }
        if (!taskbar) return false;
        const taskbarTopmost = (Number(native.style(taskbar, -20)) & 8) !== 0;
        if (dockTopmost !== taskbarTopmost) position(taskbarTopmost ? -1 : -2);
        const previous = native.getWindow(taskbar, 3);
        if (BigInt(previous) !== BigInt(hwnd)) {

          const after = previous && (taskbarTopmost || !(Number(native.style(previous, -20)) & 8))
            ? previous : taskbarTopmost ? -1 : 0;
          position(after);
        }
        error = '';
        return true;
      } catch (cause) { error = String(cause.message || cause); return false; }
    },
    watching: () => watching,
    diagnostics: () => ({ mode: pinned() ? 'panel-topmost' : 'taskbar-peer', watching, fullscreen, repairs, error }),
    stop() {
      if (queued) clearTimeout(queued);
      queued = undefined;
      if (watchdog) clearInterval(watchdog);
      watchdog = undefined; currentWindow = undefined;
      stopWatching?.(); stopWatching = undefined; watching = false;
    },
  };
  const begin = controller.start;
  controller.start = () => {
    begin();
    if (platform !== 'win32' || watchdog) return;

    watchdog = setInterval(() => {
      if (!allowed() || !currentWindow || currentWindow.isDestroyed()) return;
      try {
        const wasFullscreen = fullscreen;
        const blocked = controller.blocked(currentWindow);
        if (wasFullscreen !== blocked || (!blocked && !native?.visible?.(windowHandle(currentWindow)))) repair();
        else if (!blocked) controller.sync(currentWindow);
      } catch { /* The normal 1.5s follow path also recovers native failures. */ }
    }, 250);
    watchdog.unref?.();
  };
  return controller;
}

module.exports = { createDockZOrder, windowHandle, loadNative };
