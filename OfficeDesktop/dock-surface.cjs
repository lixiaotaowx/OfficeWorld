// The strip is drawn on a child surface that the graphics process owns. Windows
// can leave that surface somewhere else on the screen while the strip window
// itself is in place: the page is alive, but nothing is drawn where the person
// looks. This checks the surface on every follow tick, puts it back, and asks
// for a fresh window when putting it back does not hold.
const SURFACE_CLASS = 'Intermediate D3D Window';
let cachedNative;

function windowHandle(window) {
  const bytes = window.getNativeWindowHandle();
  return bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE());
}

function loadNative() {
  if (cachedNative) return cachedNative;
  const k = require('koffi');
  const u = k.load('user32.dll');
  k.struct('DockSurfaceRect', { left: 'int32_t', top: 'int32_t', right: 'int32_t', bottom: 'int32_t' });
  const getWindowRect = u.func('int32_t __stdcall GetWindowRect(uintptr_t,_Out_ DockSurfaceRect *)');
  const getClassName = u.func('int __stdcall GetClassNameW(uintptr_t,void *,int)');
  cachedNative = {
    getWindow: u.func('uintptr_t __stdcall GetWindow(uintptr_t,uint32_t)'),
    position: u.func('int32_t __stdcall SetWindowPos(uintptr_t,intptr_t,int,int,int,int,uint32_t)'),
    rect(hwnd) { const result = {}; return getWindowRect(hwnd, result) ? result : null; },
    className(hwnd) {
      const buffer = Buffer.alloc(512);
      return buffer.toString('utf16le', 0, getClassName(hwnd, buffer, 256) * 2);
    },
  };
  return cachedNative;
}

const same = (a, b) => a.left === b.left && a.top === b.top && a.right === b.right && a.bottom === b.bottom;

function createDockSurface({ platform = process.platform, load = loadNative, rebuildAfter = 3 } = {}) {
  let native, misses = 0, moved = 0, rebuilt = 0, error = '';
  return {
    // 'ok': drawn in place; 'moved': it was elsewhere and has been put back;
    // 'rebuild': putting it back did not hold, the window must be replaced.
    check(window) {
      if (platform !== 'win32' || !window?.getNativeWindowHandle || window.isDestroyed()) return 'ok';
      try {
        native ??= load();
        const hwnd = windowHandle(window);
        const outer = native.rect(hwnd);
        if (!outer) return 'ok';
        let surface;
        // 5 = first child, 2 = next sibling
        for (let child = native.getWindow(hwnd, 5), count = 0; child && count < 64; child = native.getWindow(child, 2), count++) {
          if (native.className(child) === SURFACE_CLASS) { surface = child; break; }
        }
        const inner = surface && native.rect(surface);
        if (!inner || same(inner, outer)) { misses = 0; error = ''; return 'ok'; }
        misses += 1;
        if (misses > rebuildAfter) { misses = 0; rebuilt += 1; return 'rebuild'; }
        // 0x14: keep the stacking order, do not activate
        native.position(surface, 0, 0, 0, outer.right - outer.left, outer.bottom - outer.top, 0x14);
        moved += 1;
        return 'moved';
      } catch (cause) { error = String(cause.message || cause); return 'ok'; }
    },
    reset() { misses = 0; },
    diagnostics: () => ({ surfaceMoved: moved, surfaceRebuilt: rebuilt, surfaceError: error }),
  };
}

module.exports = { createDockSurface, SURFACE_CLASS };
