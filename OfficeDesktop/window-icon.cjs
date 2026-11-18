const { app, nativeImage, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { APP_ID, refreshShortcutIcons } = require('./shortcut-icons.cjs');

function applyWindowIcon(window, source) {
  const icon = nativeImage.createFromPath(source);
  if (icon.isEmpty()) throw Error("Unable to load the application icon");
  window.setIcon(icon);
  if (process.platform !== 'win32') return;

  // A new filename breaks Explorer's icon cache when an installation is upgraded.
  const iconName = `app-icon-${app.getVersion()}.ico`;
  const installedIcon = path.join(process.resourcesPath, iconName);
  const iconPath = app.isPackaged && fs.existsSync(installedIcon)
    ? installedIcon : path.join(app.getPath('userData'), iconName);
  if (iconPath !== installedIcon) {
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
    fs.copyFileSync(source, iconPath);
  }
  const executable = process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;

  window.setAppDetails({ appId: APP_ID, appIconPath: iconPath,
    appIconIndex: 0, relaunchDisplayName: 'iruler dream',
    ...(app.isPackaged ? { relaunchCommand: `"${executable}"` } : {}) });
  if (app.isPackaged) {
    const roaming = app.getPath('appData');
    const result = refreshShortcutIcons({ shell, executable, icon: iconPath, directories: [
      app.getPath('desktop'),
      path.join(roaming, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
      path.join(roaming, 'Microsoft', 'Internet Explorer', 'Quick Launch', 'User Pinned', 'TaskBar'),
    ] });
    if (result.failed.length) console.warn('Application shortcut icon refresh failed:', result.failed);
  }
}

module.exports = { applyWindowIcon };
