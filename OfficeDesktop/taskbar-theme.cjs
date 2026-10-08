// 任务栏现在是什么颜色 —— 头像条外面那圈框要跟着它适配（用户 2026-09-20：
// 「把所有的头像整体框起来…另外要根据当前状态栏的颜色去适配」）。
//
// 这一层只能问 Windows，问不到就别瞎猜：
//   * `SystemUsesLightTheme`：任务栏（系统）用浅色还是深色。**注意不是 `AppsUseLightTheme`**
//     ——那是应用窗口的主题，两者可以不一样，而任务栏听的是前者；
//   * `ColorPrevalence` = 1：任务栏被"强调色"着色了（这时底色是强调色，不是黑/白）；
//   * `AccentColor` / `ColorizationColor`：强调色，`0xAABBGGRR`（低字节是红）；
//   * `EnableTransparency`：任务栏有没有开透明效果（关掉时框要画实一点才看得清）。
//
// 读注册表要起一个 `reg.exe`（几十毫秒），所以结果**缓存**起来，默认 30 秒过期；
// 过期之后下一次问就是新的（用户换主题/换强调色，最多半分钟就跟着变）。
// 读失败一律退回 Electron 的 `nativeTheme`（只有明暗，没有强调色），绝不抛错。
const { execFile } = require('node:child_process');

const PERSONALIZE = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
const DWM = 'HKCU\\Software\\Microsoft\\Windows\\DWM';
/** 隔多久重新读一次注册表。 */
const THEME_TTL_MS = 30000;

/** `    SystemUsesLightTheme    REG_DWORD    0x1` → { SystemUsesLightTheme: 1 } */
function parseRegQuery(text) {
  const values = {};
  for (const line of String(text || '').split(/\r?\n/)) {
    const row = /^\s+(\S+)\s+REG_DWORD\s+0x([0-9a-f]+)\s*$/i.exec(line);
    if (row) values[row[1]] = Number.parseInt(row[2], 16);
  }
  return values;
}

/** `0xAABBGGRR` → `#rrggbb`。 */
function abgrToHex(value) {
  const number = Number(value) >>> 0;
  const r = number & 0xff, g = (number >>> 8) & 0xff, b = (number >>> 16) & 0xff;
  return '#' + [r, g, b].map(part => part.toString(16).padStart(2, '0')).join('');
}

/** 这个颜色看起来是浅色还是深色（够用就行的感知亮度）。 */
function isLightColor(hex) {
  const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!match) return false;
  const number = Number.parseInt(match[1], 16);
  const r = (number >>> 16) & 0xff, g = (number >>> 8) & 0xff, b = number & 0xff;
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
}

/**
 * 把两组注册表读数变成"任务栏长什么样"。
 *
 * `light` 是**实际底色**的明暗：任务栏被强调色着色时听强调色的，否则听系统主题。
 * 页面拿这个决定框是用白色浮层还是黑色浮层。
 */
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
    // 读不到注册表时用 Electron 的明暗兜底（没有强调色）。
    source: personalize.SystemUsesLightTheme == null ? 'default' : 'registry',
  };
}

function createTaskbarTheme(dependencies = {}) {
  const run = dependencies.run || ((file, args = []) => new Promise((resolve, reject) => {
    execFile('reg.exe', ['query', file, ...args], { windowsHide: true, timeout: 4000 },
      (error, stdout) => (error ? reject(error) : resolve(String(stdout))));
  }));
  const nativeTheme = dependencies.nativeTheme || (() => {
    try { return require('electron').nativeTheme; } catch { return undefined; }
  })();
  const ttl = dependencies.ttl ?? THEME_TTL_MS;
  const now = dependencies.now || (() => Date.now());
  let cached;
  let cachedAt = 0;

  async function load() {
    try {
      // 整把键读回来（`reg query KEY`）。**注意 `reg query` 只认一个 `/v`**：
      // `reg query KEY /v A /v B` 直接报 "Invalid syntax"（2026-09-20 实测踩到，整条路
      // 静默退回兜底），所以这里不点名值，读回来自己挑。
      const [personalize, dwm] = await Promise.all([run(PERSONALIZE), run(DWM)]);
      return themeFrom(parseRegQuery(personalize), parseRegQuery(dwm));
    } catch {
      // 读不到（非 Windows、被策略挡住…）：退回 Electron 的明暗，强调色就没有了。
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
    /** 当前任务栏的样子（缓存 `ttl` 毫秒）。永远不会抛。 */
    async current() {
      if (cached && now() - cachedAt < ttl) return view(cached);
      cached = await load();
      cachedAt = now();
      return view(cached);
    },
    /** 立刻重读（换主题之后想马上反映时用）。 */
    refresh() { cached = undefined; cachedAt = 0; return this.current(); },
    /** 测试用：现在缓存里是什么（没读过就是 null）。 */
    peek: () => (cached ? view(cached) : null),
  };
}

module.exports = { createTaskbarTheme, parseRegQuery, abgrToHex, isLightColor, themeFrom,
  THEME_TTL_MS, PERSONALIZE, DWM };
