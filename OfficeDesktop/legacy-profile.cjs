const fs = require('node:fs');
const path = require('node:path');

/**
 * Chromium keeps cookies and the saved login in a folder named after the application.
 * Up to 0.1.70 the desktop client pinned that folder to `%APPDATA%\office-world-desktop`;
 * 0.1.71 let the product name decide and moved the profile to `%APPDATA%\iruler dream`.
 * An update through that rename opened a brand-new profile and silently signed everybody
 * out: the session cookie and `login.enc` were still in the old folder, so the next launch
 * showed an empty login form. Copy them across once, before the profile is opened, and
 * never look again — an explicit log-out must stay logged out.
 *
 * The saved login has to travel with `Local State`: `safeStorage` encrypts it with a key
 * that Chromium keeps in that file, so a `login.enc` next to another profile's key cannot
 * be decrypted. The cookie jar uses the same key, which is why both move together.
 */
const LEGACY_FOLDERS = ['office-world-desktop', 'OfficeWorld'];
const LOGIN_FILE = 'login.enc';
const MARKER = 'legacy-profile.json';
/** Files that can only be read with the matching `Local State`, so they move as one unit. */
const CREDENTIAL_FILES = [LOGIN_FILE, 'Local State',
  path.join('Network', 'Cookies'), path.join('Network', 'Cookies-journal')];
/** Small app-owned settings a moved profile should not lose. */
const PREFERENCE_FILES = ['Preferences', 'preview-display.json', 'dock-tray.json', 'dock.json'];

const stat = (file) => {
  try { return fs.statSync(file); } catch { return null; }
};

function copy(from, to, label, copied) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied.push(label);
}

/** The old folder that actually holds a saved login, newest first. */
function legacySource(appData, target, folders) {
  return folders
    .map((name) => path.join(appData, name))
    .filter((folder) => path.resolve(folder) !== target)
    .map((folder) => ({ folder, login: path.join(folder, LOGIN_FILE), at: stat(path.join(folder, LOGIN_FILE))?.mtimeMs || 0 }))
    .filter((entry) => entry.at > 0)
    .sort((a, b) => b.at - a.at)[0]?.folder;
}

/**
 * @returns {{ migrated: boolean, copied: string[], reason: string, from?: string }}
 * `reason` is `adopted`, `same-folder`, `no-legacy-profile`, `already-signed-in` or `checked`.
 * The marker is written once a real old profile was handled, so a later sign-out never
 * re-adopts the old login.
 */
function adoptLegacyProfile({ appData, profilePath, legacyFolders = LEGACY_FOLDERS }) {
  const target = path.resolve(profilePath);
  if (legacyFolders.some((name) => path.resolve(path.join(appData, name)) === target)) {
    return { migrated: false, copied: [], reason: 'same-folder' };
  }
  if (stat(path.join(target, MARKER))) return { migrated: false, copied: [], reason: 'checked' };

  const legacy = legacySource(appData, target, legacyFolders);
  if (!legacy) return { migrated: false, copied: [], reason: 'no-legacy-profile' };
  const copied = [];
  if (stat(path.join(target, LOGIN_FILE))) {
    fs.mkdirSync(target, { recursive: true });
    writeMarker(target, legacy, 'already-signed-in', copied);
    return { migrated: false, copied, reason: 'already-signed-in', from: legacy };
  }

  for (const file of CREDENTIAL_FILES) {
    if (stat(path.join(legacy, file))) copy(path.join(legacy, file), path.join(target, file), file, copied);
  }
  for (const file of PREFERENCE_FILES) {
    if (!stat(path.join(target, file)) && stat(path.join(legacy, file))) {
      copy(path.join(legacy, file), path.join(target, file), file, copied);
    }
  }
  if (!fs.existsSync(path.join(target, 'Local Storage')) && fs.existsSync(path.join(legacy, 'Local Storage'))) {
    fs.cpSync(path.join(legacy, 'Local Storage'), path.join(target, 'Local Storage'), { recursive: true });
    copied.push('Local Storage');
  }
  writeMarker(target, legacy, 'adopted', copied);
  return { migrated: true, copied, reason: 'adopted', from: legacy };
}

function writeMarker(target, legacy, reason, copied) {
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(path.join(target, MARKER),
    JSON.stringify({ checkedAt: new Date().toISOString(), from: legacy, reason, copied }, null, 2) + '\n');
}

module.exports = { adoptLegacyProfile, LEGACY_FOLDERS };
