const fs = require('node:fs');
const path = require('node:path');

const APP_ID = 'com.officeworld.desktop';

/** Refresh only existing shortcuts that launch this exact installation. */
function refreshShortcutIcons({ shell, executable, icon, directories, files = fs }) {
  const samePath = (left, right) => path.win32.resolve(left).toLowerCase() === path.win32.resolve(right).toLowerCase();
  const result = { updated: [], failed: [] };
  for (const directory of new Set(directories.filter(Boolean))) {
    let entries;
    try { entries = files.readdirSync(directory); } catch { continue; }
    for (const entry of entries) {
      if (path.extname(entry).toLowerCase() !== '.lnk') continue;
      const link = path.join(directory, entry);
      try {
        const existing = shell.readShortcutLink(link);
        if (!existing.target || !samePath(existing.target, executable)) continue;
        if (existing.icon && samePath(existing.icon, icon) && existing.iconIndex === 0 && existing.appUserModelId === APP_ID) continue;
        if (!shell.writeShortcutLink(link, 'update', { icon, iconIndex: 0, appUserModelId: APP_ID })) {
          result.failed.push(link);
        } else result.updated.push(link);
      } catch { result.failed.push(link); }
    }
  }
  return result;
}

module.exports = { APP_ID, refreshShortcutIcons };
