// The dock is an independent top-level window. Explorer must never own it:
// owner hide/minimize/demotion affects owned windows, even while our UI says shown.
function windowHandle(window) {
  const bytes = window.getNativeWindowHandle();
  return bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE());
}

function loadNative() {
  const k = require('koffi');
  const u = k.load('user32.dll');
  const callbackType = k.proto('void __stdcall DockOrderEvent(uintptr_t, uint32_t, uintptr_t, int32_t, int32_t, uint32_t, uint32_t)');
  const hook = u.func('uintptr_t __stdcall SetWinEventHook(uint32_t,uint32_t,uintptr_t,void *,uint32_t,uint32_t,uint32_t)');
  const unhook = u.func('bool __stdcall UnhookWinEvent(uintptr_t)');
  return {
    find: u.func('uintptr_t __stdcall FindWindowW(str16,str16)'),
    getWindow: u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)'),
    style: u.func('intptr_t __stdcall GetWindowLongPtrW(uintptr_t,int)'),
    visible: u.func('bool __stdcall IsWindowVisible(uintptr_t)'),
    setOwner: u.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t,int,intptr_t)'),
    position: u.func('bool __stdcall SetWindowPos(uintptr_t,intptr_t,int,int,int,int,uint32_t)'),
    watch(notify) {
      // Out-of-context events arrive on Electron's UI thread; no DLL injection.
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
}

function createDockZOrder({ platform = process.platform, load = loadNative,
  allowed = () => false, repair = () => {} } = {}) {
  let native, stopWatching, queued, watchdog, currentWindow, error = '', watching = false;
  let repairs = 0;
  function start() {
    if (platform !== 'win32' || watching) return;
    try {
      native ??= load();
      stopWatching = native.watch((event = 3, hwnd = 0) => {
        if (!allowed() || queued) return;
        if (event !== 3) {
          const own = currentWindow && !currentWindow.isDestroyed() ? windowHandle(currentWindow) : 0;
          const taskbar = native.find('Shell_TrayWnd', null);
          if (BigInt(hwnd) !== BigInt(own) && BigInt(hwnd) !== BigInt(taskbar)) return;
        }
        // Leave the native callback before calling Electron; coalesce event bursts.
        queued = setTimeout(() => { queued = undefined; if (allowed()) repair(); }, 0);
      });
      watching = true;
    } catch (cause) { error = String(cause.message || cause); }
  }
  const controller = {
    start,
    sync(window) {
      currentWindow = window;
      if (platform !== 'win32' || !window?.getNativeWindowHandle || window.isDestroyed()) return false;
      try {
        native ??= load();
        const hwnd = windowHandle(window);
        const taskbar = native.find('Shell_TrayWnd', null);
        // Also undo a legacy attachment if this controller is introduced in place.
        if (taskbar && BigInt(native.getWindow(hwnd, 4)) === BigInt(taskbar)) {
          native.setOwner(hwnd, -8, 0);
        }
        let needsRepair = (Number(native.style(hwnd, -20)) & 8) === 0;
        // GW_HWNDPREV enumerates windows above us, independent of cursor position.
        for (let h = native.getWindow(hwnd, 3), count = 0; h && count < 2048;
          h = native.getWindow(h, 3), count++) {
          if (taskbar && BigInt(h) === BigInt(taskbar)) { needsRepair = true; break; }
        }
        if (needsRepair) {
          // NOMOVE | NOSIZE | NOACTIVATE | NOOWNERZORDER. Never show hidden windows.
          if (!native.position(hwnd, -1, 0, 0, 0, 0, 0x213)) throw Error('topmost-repair-failed');
          repairs++;
        }
        error = '';
        return true;
      } catch (cause) { error = String(cause.message || cause); return false; }
    },
    watching: () => watching,
    diagnostics: () => ({ mode: 'independent', watching, repairs, error }),
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
    // Some SetWindowPos style changes emit no WinEvent. Read-only when healthy;
    // this watchdog never depends on the mouse visiting the taskbar.
    watchdog = setInterval(() => {
      if (!allowed() || !currentWindow || currentWindow.isDestroyed()) return;
      try {
        if (!native?.visible?.(windowHandle(currentWindow))) repair();
        else controller.sync(currentWindow);
      } catch { /* The normal 1.5s follow path also recovers native failures. */ }
    }, 250);
    watchdog.unref?.();
  };
  return controller;
}

module.exports = { createDockZOrder, windowHandle };
