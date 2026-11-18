

const { execFile } = require('node:child_process');

const TRAY_GAP = 8;

const TRAY_CACHE_MS = 30000;

const TRAY_TIMEOUT_MS = 4000;

const TRAY_SCRIPT = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class officeworldTray {
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
$out = [officeworldTray]::Find()
# Windows 11 keeps its Widgets (weather) button at the far left of the taskbar; the dock starts after it
try {
  Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
  $root = [System.Windows.Automation.AutomationElement]::FromHandle([officeworldTray]::FindWindow("Shell_TrayWnd", $null))
  $cond = New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::AutomationIdProperty, "WidgetsButton")
  $el = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $cond)
  if ($el -and $out.EndsWith("}")) {
    $r = $el.Current.BoundingRectangle
    if (-not $r.IsEmpty -and $r.Width -gt 0) {
      $out = $out.Substring(0, $out.Length - 1) + ',"widgets":{"left":' + [int]$r.Left + ',"top":' + [int]$r.Top + ',"right":' + [int]$r.Right + ',"bottom":' + [int]$r.Bottom + '}}'
    }
  }
} catch {}
$out
`;

const parseRect = value => {
  if (!value || typeof value !== 'object') return null;
  const rect = { left: Number(value.left), top: Number(value.top),
    right: Number(value.right), bottom: Number(value.bottom) };
  if (![rect.left, rect.top, rect.right, rect.bottom].every(Number.isFinite)) return null;
  if (rect.right <= rect.left || rect.bottom <= rect.top) return null;
  return rect;
};

function parseTrayRect(text) {
  const line = String(text || '').trim().split(/\r?\n/).filter(Boolean).pop();
  if (!line) return null;
  try {
    const json = JSON.parse(line);
    if (!json?.ok) return null;
    const tray = parseRect(json.tray);
    if (!tray) return null;
    return { tray, taskbar: parseRect(json.taskbar), widgets: parseRect(json.widgets), aware: json.aware === true };
  } catch {
    return null;
  }
}

function trayReserveDip({ rect, taskbar, widgets, taskbarDip, display, gap = TRAY_GAP }) {
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

  if (rightDip <= bounds.x || leftDip >= bounds.x + bounds.width) return null;
  const rightOffset = Math.round(bounds.x + bounds.width - leftDip + gap);

  if (rightOffset < 40 || rightOffset > bounds.width * 0.6) return null;
  if (leftDip <= bounds.x) return null;
  // a Widgets button on the left half of this display: the dock's left gap clears it
  const widgetsRight = widgets ? widgets.right / space : NaN;
  const leftGap = Number.isFinite(widgetsRight) && widgetsRight > bounds.x && widgetsRight < bounds.x + bounds.width / 2
    ? Math.round(widgetsRight - bounds.x + gap) : undefined;
  return {
    ...(leftGap ? { leftGap } : {}),

    rightOffset,

    trayLeft: Math.round(leftDip),

    space: Math.round(space * 1000) / 1000,
  };
}

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
      taskbar: measured?.taskbar, widgets: measured?.widgets, taskbarDip, display });
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

    raw: () => cached ?? null,
    script: TRAY_SCRIPT,
  };
}

module.exports = { createTrayArea, parseTrayRect, trayReserveDip,
  TRAY_GAP, TRAY_CACHE_MS, TRAY_TIMEOUT_MS, TRAY_SCRIPT };
