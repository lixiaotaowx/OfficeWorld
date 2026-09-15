const { app, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function applyWindowIcon(window, source) {
  const icon = nativeImage.createFromPath(source);
  if (icon.isEmpty()) throw Error('无法加载应用图标');
  window.setIcon(icon);
  if (process.platform !== 'win32') return;
  // Windows Shell cannot resolve an icon inside app.asar. Keep a real, stable file.
  const iconPath = path.join(app.getPath('userData'), 'iruler-dream.ico');
  fs.mkdirSync(path.dirname(iconPath), { recursive: true });
  fs.copyFileSync(source, iconPath);
  const executable = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
  // No `appId` on purpose: setting one makes Windows look the icon up through that id,
  // and an id with no registered shortcut yields the generic application icon. Without
  // it the window's own icon (set above) is what the taskbar and Alt-Tab use.
  window.setAppDetails({ appIconPath: iconPath,
    appIconIndex: 0, relaunchDisplayName: 'iruler dream',
    ...(app.isPackaged ? { relaunchCommand: `"${executable}"` } : {}) });
}

module.exports = { applyWindowIcon };
