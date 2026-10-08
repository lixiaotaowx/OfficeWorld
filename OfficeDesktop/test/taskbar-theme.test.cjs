// 任务栏现在是什么颜色（头像条外面那圈框要跟着它适配，用户 2026-09-20）。
//
// 这一层只做两件事：把 `reg query` 的输出读懂、把结论缓存起来。读不到就退回 Electron 的
// 明暗（只有明暗、没有强调色），任何时候都不许抛错——框颜色不对是小事，起不来是大事。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTaskbarTheme, parseRegQuery, abgrToHex, isLightColor, themeFrom, THEME_TTL_MS } =
  require('../taskbar-theme.cjs');

const output = rows => ['HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize']
  .concat(rows.map(([name, value]) => `    ${name}    REG_DWORD    0x${value.toString(16)}`)).join('\r\n') + '\r\n';

test('读懂 reg query 的输出', () => {
  const values = parseRegQuery(output([['SystemUsesLightTheme', 0], ['EnableTransparency', 1],
    ['ColorPrevalence', 1], ['AccentColor', 0xff3f6d4a]]));
  assert.equal(values.SystemUsesLightTheme, 0);
  assert.equal(values.EnableTransparency, 1);
  assert.equal(values.ColorPrevalence, 1);
  assert.equal(values.AccentColor, 0xff3f6d4a);
  assert.deepEqual(parseRegQuery(''), {});
  assert.deepEqual(parseRegQuery('胡说八道 not a registry dump'), {});
});

test('强调色是 0xAABBGGRR：低字节是红', () => {
  assert.equal(abgrToHex(0xff3f6d4a), '#4a6d3f');
  assert.equal(abgrToHex(0), '#000000');
  assert.equal(abgrToHex(0xffffffff), '#ffffff');
  assert.equal(abgrToHex(0x00ff0000), '#0000ff', '低字节红 = 0，高字节蓝 = ff');
});

test('浅色/深色判断按感知亮度来', () => {
  assert.equal(isLightColor('#f3f3f3'), true);
  assert.equal(isLightColor('#1c1c1c'), false);
  assert.equal(isLightColor('#ffffff'), true);
  assert.equal(isLightColor('胡说'), false, '读不懂就当深色（默认那套）');
});

test('任务栏的样子：明暗听系统主题，被强调色着色时听强调色', () => {
  const dark = themeFrom({ SystemUsesLightTheme: 0, EnableTransparency: 1 });
  assert.deepEqual([dark.light, dark.tinted, dark.transparent], [false, false, true]);
  assert.equal(dark.source, 'registry');
  const light = themeFrom({ SystemUsesLightTheme: 1 });
  assert.equal(light.light, true);
  // 关掉透明效果：任务栏是不透明纯色，框要画实一点。
  assert.equal(themeFrom({ SystemUsesLightTheme: 1, EnableTransparency: 0 }).transparent, false);
  // 任务栏用强调色着色：底色就是强调色，明暗听它。
  const pinkTaskbar = themeFrom({ SystemUsesLightTheme: 0, ColorPrevalence: 1 }, { AccentColor: 0xffc8a0f0 });
  assert.equal(pinkTaskbar.tinted, true);
  assert.equal(pinkTaskbar.accent, '#f0a0c8');
  assert.equal(pinkTaskbar.light, true, '浅色强调色 → 浅色任务栏');
  const navy = themeFrom({ SystemUsesLightTheme: 1, ColorPrevalence: 1 }, { AccentColor: 0xff5a3410 });
  assert.equal(navy.light, false, '深色强调色 → 深色任务栏');
  // 读不到注册表：source 是 default，按深色兜底。
  assert.deepEqual([themeFrom().light, themeFrom().source], [false, 'default']);
});

test('缓存：一次 TTL 之内只读一次注册表；refresh 立刻重读', async () => {
  let calls = 0;
  let light = 0;
  const theme = createTaskbarTheme({
    ttl: 1000,
    now: () => clock,
    run: async (file, args) => {
      calls++;
      // `reg query` 只认一个 `/v`，所以这条路是整把键读回来（不点名值）。
      assert.deepEqual(args, undefined, '不要传 /v：多个 /v 会让 reg 报 Invalid syntax');
      if (file.includes('DWM')) return output([['AccentColor', 0xff3f6d4a]]);
      return output([['SystemUsesLightTheme', light], ['EnableTransparency', 1]]);
    },
  });
  let clock = 0;
  assert.deepEqual(await theme.current(), { light: false, tinted: false, accent: '#4a6d3f',
    transparent: true });
  assert.equal(calls, 2, 'Personalize 与 DWM 各一次');
  await theme.current();
  assert.equal(calls, 2, 'TTL 之内不再读');
  clock = 1500;
  light = 1;
  const next = await theme.current();
  assert.equal(calls, 4, '过期了才重读');
  assert.equal(next.light, true, '用户换了主题就跟上');
  light = 0;
  assert.equal((await theme.refresh()).light, false, 'refresh 立刻重读');
  assert.equal(theme.peek().light, false);
  assert.ok(THEME_TTL_MS >= 5000 && THEME_TTL_MS <= 60000, 'TTL 是个合理值：' + THEME_TTL_MS);
});

test('读不到注册表就退回 Electron 的明暗，绝不抛错', async () => {
  const dark = createTaskbarTheme({ run: async () => { throw Error('reg.exe 不存在'); },
    nativeTheme: { shouldUseDarkColors: true } });
  assert.deepEqual(await dark.current(), { light: false, tinted: false, accent: '',
    transparent: true }, '深色系统 → 深色任务栏那套');
  const light = createTaskbarTheme({ run: async () => { throw Error('不管'); },
    nativeTheme: { shouldUseDarkColors: false } });
  assert.equal((await light.current()).light, true);
  const none = createTaskbarTheme({ run: async () => { throw Error('不管'); }, nativeTheme: undefined });
  assert.equal((await none.current()).light, false, '连 nativeTheme 都没有也不许抛');
  // 读到的是一堆垃圾（不是注册表输出）：当"没读到"，退回兜底。
  const junk = createTaskbarTheme({ run: async () => '完全不是注册表', nativeTheme: { shouldUseDarkColors: false } });
  assert.equal((await junk.current()).light, false, '解析不出东西时 source 是 default → 深色兜底');
});
