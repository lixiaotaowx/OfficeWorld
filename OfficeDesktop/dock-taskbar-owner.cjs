// A top-level owned window stays above its owner in Windows' z-order. Keep the
// dock owned by Shell_TrayWnd, not embedded as a clipped WS_CHILD: its preview
// cards must still extend outside the taskbar. No Explorer styles are changed.
function loadNative() {
  const user32 = require('koffi').load('user32.dll');
  return {
    find: user32.func('uintptr_t __stdcall FindWindowW(str16, str16)'),
    owner: user32.func('uintptr_t __stdcall GetWindow(uintptr_t, uint32_t)'),
    setOwner: user32.func('intptr_t __stdcall SetWindowLongPtrW(uintptr_t, int, intptr_t)'),
    valid: user32.func('bool __stdcall IsWindow(uintptr_t)'),
  };
}

function windowHandle(window) {
  const bytes = window.getNativeWindowHandle();
  return bytes.length === 8 ? bytes.readBigUInt64LE() : BigInt(bytes.readUInt32LE());
}

function createTaskbarOwner({ platform = process.platform, load = loadNative } = {}) {
  let native;
  let attached = false;
  let error = '';
  return {
    sync(window) {
      attached = false;
      if (platform !== 'win32' || !window?.getNativeWindowHandle || window.isDestroyed()) return false;
      try {
        native ??= load();
        const hwnd = windowHandle(window);
        const taskbar = native.find('Shell_TrayWnd', null);
        if (!taskbar || !native.valid(taskbar)) { error = 'taskbar-unavailable'; return false; }
        if (BigInt(native.owner(hwnd, 4)) !== BigInt(taskbar)) {
          // GWLP_HWNDPARENT sets the OWNER of a top-level window. Zero return
          // may be success (previous owner was null), so verify with GetWindow.
          native.setOwner(hwnd, -8, taskbar);
        }
        attached = BigInt(native.owner(hwnd, 4)) === BigInt(taskbar);
        error = attached ? '' : 'owner-not-applied';
      } catch (cause) { error = String(cause?.message || cause); }
      return attached;
    },
    attached: () => attached,
    error: () => error,
  };
}

module.exports = { createTaskbarOwner, windowHandle };
