

const { execFile } = require('node:child_process');

const PERSONALIZE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
const DWM = 'HKCU\\Software\\Microsoft\\Windows\\DWM';

const THEME_TTL_MS = 30000;

function parseRegQuery(text) {
  const values = {};
  for (const line of String(text || '').split(/\r?\n/)) {
    const row = /^\s+(\S+)\s+REG_DWORD\s+0x([0-9a-f]+)\s*$/i.exec(line);
    if (row) values[row[1]] = Number.parseInt(row[2], 16);
  }
  return values;
}

function abgrToHex(value) {
  const number = Number(value) >>> 0;
  const r = number & 0xff, g = (number >>> 8) & 0xff, b = (number >>> 16) & 0xff;
  return '#' + [r, g, b].map(part => part.toString(16).padStart(2, '0')).join('');
}

function isLightColor(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!match) return false;
  const number = Number.parseInt(match[1], 16);
  const r = (number >>> 16) & 0xff, g = (number >>> 8) & 0xff, b = number & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
}

function themeFrom(personalize = {}, dwm = {}) {
  const tinted = personalize.ColorPrevalence === 1;
  const accent = tinted || dwm.AccentColor != null
    ? abgrToHex(dwm.AccentColor ?? dwm.ColorizationColor ?? 0) : '';
  const light = tinted && accent ? isLightColor(accent) : personalize.SystemUsesLightTheme === 1;
  return {
    light,
    tinted,
    accent: /^#[0-9a-f]{6}$/.test(accent) ? accent : '',
    transparent: personalize.EnableTransparency !== 0,

    source: personalize.SystemUsesLightTheme == null ? 'default' : 'registry',
  };
}

function createTaskbarTheme(dependencies = {}) {
  const run = dependencies.run || ((file, args = []) => new Promise((resolve, reject) => {
    execFile('reg.exe', ['query', file, ...args], { windowsHide: true, timeout: 4000 },
      (error, stdout) => (error ? reject(error) : resolve(String(stdout))));
  }));
  const nativeTheme = Object.hasOwn(dependencies, 'nativeTheme') ? dependencies.nativeTheme : (() => {
    try { return require('electron').nativeTheme; } catch { return undefined; }
  })();
  const ttl = dependencies.ttl ?? THEME_TTL_MS;
  const now = dependencies.now || (() => Date.now());
  let cached;
  let cachedAt = 0;

  async function load() {
    try {

      const [personalize, dwm] = await Promise.all([run(PERSONALIZE), run(DWM)]);
      return themeFrom(parseRegQuery(personalize), parseRegQuery(dwm));
    } catch {

      const dark = nativeTheme?.shouldUseDarkColors;
      return { light: dark === false, tinted: false, accent: '', transparent: true,
        source: dark == null ? 'default' : 'native' };
    }
  }

  const view = value => ({
    light: value?.light === true,
    tinted: value?.tinted === true,
    accent: value?.accent || '',
    transparent: value?.transparent !== false,
  });

  return {

    async current() {
      if (cached && now() - cachedAt < ttl) return view(cached);
      cached = await load();
      cachedAt = now();
      return view(cached);
    },

    refresh() { cached = undefined; cachedAt = 0; return this.current(); },

    peek: () => (cached ? view(cached) : null),
  };
}

module.exports = { createTaskbarTheme, parseRegQuery, abgrToHex, isLightColor, themeFrom,
  THEME_TTL_MS, PERSONALIZE, DWM };
