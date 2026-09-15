// Launch at sign-in.
//
// The APP registers itself instead of the installer doing it: a per-user install then
// needs no admin rights, and the registration keeps pointing at wherever the app
// actually lives. A portable build is deliberately excluded — it unpacks to a fresh
// temp directory on every run, so registering that path would leave a dead entry
// behind after the folder is cleaned up.
const AUTOSTART_ARG = '--autostart';

/** electron-builder sets this only while a portable build is running. */
function isPortable(environment = process.env) {
  return Boolean(environment.PORTABLE_EXECUTABLE_DIR);
}

/**
 * Bind the login-item seam to one Electron app.
 * @param options - the app plus injectable platform facts, for tests.
 */
function createAutoStart({ app, platform = process.platform, environment = process.env, execPath = process.execPath } = {}) {
  const supported = platform === 'win32' && !isPortable(environment) &&
    typeof app?.setLoginItemSettings === 'function';
  return {
    /** Whether this build can offer launch-at-sign-in at all. */
    supported: () => supported,
    /** Whether the login item is registered right now; never throws. */
    enabled() {
      if (!supported) return false;
      try { return app.getLoginItemSettings({ path: execPath }).openAtLogin === true; }
      catch { return false; }
    },
    /**
     * Register or clear the login item.
     * @returns whether the registration now matches the request.
     */
    set(enabled) {
      if (!supported) return false;
      try {
        app.setLoginItemSettings(enabled
          ? { openAtLogin: true, path: execPath, args: [AUTOSTART_ARG] }
          : { openAtLogin: false, path: execPath });
        return this.enabled() === enabled;
      } catch { return false; }
    },
    /** A fresh install starts with the machine, without being asked. */
    ensure() { return this.set(true); },
  };
}

module.exports = { createAutoStart, isPortable, AUTOSTART_ARG };
