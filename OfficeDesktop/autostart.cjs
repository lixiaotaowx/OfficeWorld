

const AUTOSTART_ARG = '--autostart';

function isPortable(environment = process.env) {
  return Boolean(environment.PORTABLE_EXECUTABLE_DIR);
}

function createAutoStart({ app, platform = process.platform, environment = process.env, execPath = process.execPath } = {}) {
  const supported = platform === 'win32' && !isPortable(environment) &&
    typeof app?.setLoginItemSettings === 'function';
  return {

    supported: () => supported,

    enabled() {
      if (!supported) return false;
      try { return app.getLoginItemSettings({ path: execPath }).openAtLogin === true; }
      catch { return false; }
    },

    set(enabled) {
      if (!supported) return false;
      try {
        app.setLoginItemSettings(enabled
          ? { openAtLogin: true, path: execPath, args: [AUTOSTART_ARG] }
          : { openAtLogin: false, path: execPath });
        return this.enabled() === enabled;
      } catch { return false; }
    },

    ensure() { return this.set(true); },
  };
}

module.exports = { createAutoStart, isPortable, AUTOSTART_ARG };
