// Read-only Win32 desktop observations. Use physical pixels for both DWM frames
// and monitor rectangles; Electron's DIP bounds must not enter this comparison.
const SHELL_CLASSES = new Set(['Shell_TrayWnd', 'Shell_SecondaryTrayWnd', 'Progman', 'WorkerW']);

function coversMonitor(frame, monitor) {
  if (!frame || !monitor) return false;
  const values = [frame, monitor].flatMap(r => [r.left, r.top, r.right, r.bottom]);
  if (!values.every(Number.isFinite) || monitor.right <= monitor.left || monitor.bottom <= monitor.top) return false;
  return frame.left <= monitor.left + 1 && frame.top <= monitor.top + 1 &&
    frame.right >= monitor.right - 1 && frame.bottom >= monitor.bottom - 1;
}

function foregroundFullscreen(native, dock) {
  const foreground = native.foreground();
  if (!foreground || BigInt(foreground) === BigInt(dock) || !native.visible(foreground) ||
      native.minimized(foreground) || native.cloaked(foreground) || SHELL_CLASSES.has(native.className(foreground))) return false;
  // The dock is anchored to the primary taskbar. A video on a different monitor
  // must not hide it; use that taskbar even before the dock's first placement.
  const taskbar = native.find('Shell_TrayWnd', null);
  const monitor = native.monitorRect(taskbar || dock);
  return coversMonitor(native.frame(foreground), monitor);
}

function loadDesktopState(k, user32) {
  const rect = k.struct('DockDesktopRect', { left: 'int32_t', top: 'int32_t', right: 'int32_t', bottom: 'int32_t' });
  const info = k.struct('DockMonitorInfo', { cbSize: 'uint32_t', monitor: rect, work: rect, flags: 'uint32_t' });
  const monitorFromWindow = user32.func('uintptr_t __stdcall MonitorFromWindow(uintptr_t,uint32_t)');
  const getMonitorInfo = user32.func('int32_t __stdcall GetMonitorInfoW(uintptr_t,_Inout_ DockMonitorInfo *)');
  const getWindowRect = user32.func('int32_t __stdcall GetWindowRect(uintptr_t,_Out_ DockDesktopRect *)');
  const getClassName = user32.func('int __stdcall GetClassNameW(uintptr_t,void *,int)');
  const dwm = k.load('dwmapi.dll');
  const getAttribute = dwm.func('int32_t __stdcall DwmGetWindowAttribute(uintptr_t,uint32_t,void *,uint32_t)');
  return {
    foreground: user32.func('uintptr_t __stdcall GetForegroundWindow()'),
    minimized: user32.func('int32_t __stdcall IsIconic(uintptr_t)'),
    className(hwnd) {
      const buffer = Buffer.alloc(512);
      const count = getClassName(hwnd, buffer, 256);
      return buffer.toString('utf16le', 0, count * 2);
    },
    cloaked(hwnd) {
      const buffer = Buffer.alloc(4);
      return getAttribute(hwnd, 14, buffer, 4) === 0 && buffer.readUInt32LE() !== 0;
    },
    frame(hwnd) {
      const buffer = Buffer.alloc(16);
      if (getAttribute(hwnd, 9, buffer, 16) === 0) return {
        left: buffer.readInt32LE(0), top: buffer.readInt32LE(4),
        right: buffer.readInt32LE(8), bottom: buffer.readInt32LE(12),
      };
      const result = {};
      return getWindowRect(hwnd, result) ? result : null;
    },
    monitorRect(hwnd) {
      const result = { cbSize: k.sizeof(info) };
      const monitor = monitorFromWindow(hwnd, 2);
      return monitor && getMonitorInfo(monitor, result) ? result.monitor : null;
    },
  };
}

module.exports = { loadDesktopState, foregroundFullscreen, coversMonitor };
