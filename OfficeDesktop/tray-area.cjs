// 任务栏右侧那一堆（时钟、输入法指示器、状态图标、隐藏图标箭头）到底从哪儿开始。
//
// 用户 2026-09-18 报障：另一台电脑上头像条「直接盖在了输入法等那一堆按钮上了」。
// 原因是"托盘宽度"在我们这里是写死的 220 DIP（Windows 不提供这个数字），而他那台机器
// 的托盘更宽（输入法 + 一堆图标）。**实测这台机器托盘就 256px**，也就是说写死的 220 本来
// 就已经压进去 36px，只是这台机器的 dock.json 里恰好有一次往左拖的 -123px 才没露出来。
//
// 现在的做法：真的去量。Win32 里任务栏是 `Shell_TrayWnd`，托盘区是它的子窗口
// `TrayNotifyWnd`，量到这个窗口的矩形（物理像素）换算成 DIP，头像条就贴在它左边留 `GAP`。
// 量不到（找不到窗口 / 不是 Windows / 脚本被挡）就退回 `TRAY_RESERVE` 的估算值。
//
// 用 PowerShell + Add-Type 走一次 P/Invoke：只跑一条命令、结果缓存几十秒，代价可以忽略。
const { execFile } = require('node:child_process');

/** 头像条右边缘与托盘左边缘之间留的空隙（DIP）。 */
const TRAY_GAP = 8;
/** 量到之后缓存多久（毫秒）。 */
const TRAY_CACHE_MS = 30000;
/** 单次探测的超时。 */
const TRAY_TIMEOUT_MS = 4000;

const TRAY_SCRIPT = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class IrulerTray {
  [DllImport("user32.dll", SetLastError=true)] public static extern IntPtr FindWindow(string cls, string win);
  [DllImport("user32.dll", SetLastError=true)] public static extern IntPtr FindWindowEx(IntPtr parent, IntPtr after, string cls, string win);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  public static string R(IntPtr h) {
    if (h == IntPtr.Zero) return "null";
    RECT r; GetWindowRect(h, out r);
    return "{\\"left\\":" + r.Left + ",\\"top\\":" + r.Top + ",\\"right\\":" + r.Right + ",\\"bottom\\":" + r.Bottom + "}";
  }
  public static string Find() {
    // **必须先声明 DPI 感知**：否则 Windows 会把坐标"虚拟化"（已经除以缩放比例），
    // 我们再除一次就偏小一大截——2026-09-18 那台 150% 缩放的机器上头像条因此跑到了屏幕中间。
    bool aware = SetProcessDPIAware();
    IntPtr bar = FindWindow("Shell_TrayWnd", null);
    if (bar == IntPtr.Zero) return "{\\"ok\\":false,\\"why\\":\\"no-taskbar\\"}";
    IntPtr tray = FindWindowEx(bar, IntPtr.Zero, "TrayNotifyWnd", null);
    if (tray == IntPtr.Zero) return "{\\"ok\\":false,\\"why\\":\\"no-tray\\"}";
    return "{\\"ok\\":true,\\"aware\\":" + (aware ? "true" : "false")
      + ",\\"tray\\":" + R(tray) + ",\\"taskbar\\":" + R(bar) + "}";
  }
}
"@
[IrulerTray]::Find()
`;

const parseRect = value => {
  if (!value || typeof value !== 'object') return null;
  const rect = { left: Number(value.left), top: Number(value.top),
    right: Number(value.right), bottom: Number(value.bottom) };
  if (![rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite)) return null;
  if (rect.right <= rect.left || rect.bottom <= rect.top) return null;
  return rect;
};

/** 解析脚本输出（最后一行 JSON）。拿不到就返回 null，绝不让它抛。 */
function parseTrayRect(text) {
  const line = String(text || '').trim().split(/\r?\n/).filter(Boolean).pop();
  if (!line) return null;
  try {
    const json = JSON.parse(line);
    if (!json?.ok) return null;
    const tray = parseRect(json.tray);
    if (!tray) return null;
    return { tray, taskbar: parseRect(json.taskbar), aware: json.aware === true };
  } catch {
    return null;
  }
}

/**
 * 把托盘矩形换算成"头像条离屏幕右端多远"（DIP）。
 *
 * Win32 的坐标是物理像素、Electron 的 bounds 是 DIP，两者要换算；**但**拿到的到底是哪一种
 * 取决于子进程有没有 DPI 感知——脚本里已经 `SetProcessDPIAware()`，正常情况下是物理像素。
 * 为了不把这件事交给运气，这里用**任务栏高度**自校准：任务栏在 DIP 下是 `taskbarDip`
 * （Electron 由 bounds/workArea 之差算出来的厚度），量到的高度除以它就是"一个 DIP 等于几个
 * 本坐标系单位"。比例接近 1 说明拿到的是已缩放坐标（老版本就是这样，然后我们又除了一次
 * scaleFactor，结果条子跑到屏幕正中间）。
 */
function trayReserveDip({ rect, taskbar, taskbarDip, display, gap = TRAY_GAP }) {
  const bounds = display?.bounds;
  const scale = Number(display?.scaleFactor) || 1;
  if (!rect || !bounds) return null;
  let space = scale;
  const measured = taskbar ? taskbar.bottom - taskbar.top : 0;
  if (measured > 0 && taskbarDip > 0) {
    const ratio = measured / taskbarDip;
    if (Math.abs(ratio - 1) < 0.15) space = 1;
    else if (ratio > 0.5 && ratio < 6) space = ratio;
  }
  if (!(space >= 0.75 && space <= 6)) return null;
  const leftDip = rect.left / space;
  const rightDip = rect.right / space;
  // 托盘得横向落在这块屏里，才谈得上"贴它左边"。
  if (rightDip <= bounds.x || leftDip >= bounds.x + bounds.width) return null;
  const rightOffset = Math.round(bounds.x + bounds.width - leftDip + gap);
  // 自检：算出来要贴的地方不能离谱（托盘宽到超过半屏、或者窄到不像托盘，都当没量到）。
  if (rightOffset < 40 || rightOffset > bounds.width * 0.6) return null;
  if (leftDip <= bounds.x) return null;
  return {
    /** 给 dockBounds 的 rightOffset。 */
    rightOffset,
    /** 托盘左边缘（DIP，绝对坐标）：就算用户把条子往右拖，也不许压过这里。 */
    trayLeft: Math.round(leftDip),
    /** 诊断用：这次是按"一个 DIP = space 个单位"换算的。 */
    space: Math.round(space * 1000) / 1000,
  };
}

/**
 * 建一个探测者：`measure(display)` 返回 `{ rightOffset, trayLeft }` 或 null。
 *
 * `spawn` 可以注入（测试用），默认跑一次 PowerShell。
 */
function createTrayArea(options = {}) {
  const platform = options.platform || process.platform;
  const run = options.run || ((script, timeout) => new Promise((resolve) => {
    try {
      const encoded = Buffer.from(script, 'utf16le').toString('base64');
      execFile('powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
        { timeout, windowsHide: true },
        (error, stdout) => resolve(error ? '' : String(stdout || '')));
    } catch {
      resolve('');
    }
  }));
  const cacheMs = options.cacheMs ?? TRAY_CACHE_MS;
  const timeout = options.timeoutMs ?? TRAY_TIMEOUT_MS;
  let cached;
  let measuredAt = 0;
  let measuring;

  async function measure(display, { force = false, taskbarDip = 0 } = {}) {
    if (platform !== 'win32') return null;
    const now = Date.now();
    const toReserve = measured => trayReserveDip({ rect: measured?.tray,
      taskbar: measured?.taskbar, taskbarDip, display });
    if (!force && cached !== undefined && now - measuredAt < cacheMs) return toReserve(cached);
    if (measuring) return measuring;
    measuring = run(TRAY_SCRIPT, timeout)
      .then(text => {
        cached = parseTrayRect(text) || null;
        measuredAt = Date.now();
        return toReserve(cached);
      })
      .catch(() => null)
      .finally(() => { measuring = undefined; });
    return measuring;
  }

  return {
    measure,
    /** 测试/诊断用：上次量到的原始数据（托盘矩形 + 任务栏矩形 + 是否 DPI 感知）。 */
    raw: () => cached ?? null,
    script: TRAY_SCRIPT,
  };
}

module.exports = { createTrayArea, parseTrayRect, trayReserveDip,
  TRAY_GAP, TRAY_CACHE_MS, TRAY_TIMEOUT_MS, TRAY_SCRIPT };
