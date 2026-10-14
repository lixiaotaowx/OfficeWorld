// 头像条要显示什么：在线的人、在座/离座、正在共享、未读与未接来电，以及"谁能有预览"。
// 外加一条铁律的守卫：小窗只做显示 + 遥控，不许自己连 socket 或碰媒体。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { buildDockState, previewPlaceholder, cardActions, DOCK_MAX_PEOPLE,
  dwellWatch, WATCH_DWELL_MS, WATCH_DWELL_GAP_MS, PEEK_GLOW_FADE_MS,
  GREET_CANVAS, greetMode, greetClip, GREET_CLIP, frameColors, hexToRgba, mergeState,
  stickyOrder, keepOrder, orderPeople, ORDER_SETTLE_MS, cardTipOffset, CARD_TIP } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const look = (color = 'kraft') => ({ color, accessories: { glasses: 'none', hair: 'short', beard: 'none', hat: 'none' } });
const person = (id, extra = {}) => ({ id, clientId: id, name: id, appearance: look(), seat: 1,
  role: 'employee', atDesk: true, sharing: false, ...extra });

test('悬停卡片那个尖要对准头像，且不许跑到卡片外面（用户 2026-09-2X）', () => {
  // 头像在卡片正中：尖的左边 = 卡片内的头像中点 - 半个尖宽。
  assert.equal(cardTipOffset(100, 294, 247), Math.round(247 - 100 - CARD_TIP.width / 2));
  // 头像比卡片左边缘还靠左（头像条比卡片窄）→ 夹在左边界内，不能被圆角切掉。
  assert.equal(cardTipOffset(400, 294, 410), CARD_TIP.width);
  // 头像比卡片右边缘还靠右 → 夹在右边界内。
  assert.equal(cardTipOffset(100, 294, 900), 294 - CARD_TIP.width);
  // 第一帧卡片还没量到宽度：返回 null，页面用默认位置。
  assert.equal(cardTipOffset(0, 0, 100), null);
  assert.equal(cardTipOffset(Number.NaN, 294, 100), null);
  // 页面接线：尖真的画在卡片里，位置来自上面那个纯函数。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /className="dock-card-tip"/, '卡片要有那个尖');
  assert.match(dock, /cardTipOffset\(frame\.left, frame\.width, box\.left \+ box\.width \/ 2\)/,
    '尖的位置要按"头像中点 - 卡片左边界"算');
  const css = readFileSync(new URL('../src/dock.css', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/dock-card.css', import.meta.url), 'utf8');
  assert.match(css, /\.dock-card-tip \{[\s\S]*?clip-path: polygon\(0 0, 100% 0, 50% 100%\)/, '尖是贴合底边的实心三角');
  assert.match(css, /\.dock\.edge-top \.dock-card-tip \{[\s\S]*?scaleY\(-1\)/,
    '任务栏在上方时要转过来指向上面的头像');
});

test('只画在线的人（名单里已离线的不会出现）', () => {
  const state = buildDockState({ people: [person('me'), person('a'), person('b')], myId: 'me', sharing: false });
  assert.deepEqual(state.people.map(row => row.id), ['me', 'a', 'b'], '自己和在线的同事都在，自己在最前');
});

test('离座时长跟在名字后面（悬停卡片用）', () => {
  const people = [person('here'), person('away'), person('long')];
  const state = buildDockState({
    people, sharing: false,
    away: { away: '离座 6 分钟', long: '离座 1.5 小时' },
  });
  const away = Object.fromEntries(state.people.map(row => [row.id, row.away]));
  assert.equal(away.away, '离座 6 分钟', '在座的人不写离座时长');
  assert.equal(away.long, '离座 1.5 小时');
  assert.equal(away.here, undefined);
  // 不传就不显示（老调用点也不会因此崩）
  assert.equal(buildDockState({ people, sharing: false }).people[1].away, undefined);
});

test('离座文案由主窗口算好（时长算法只有一处）', () => {
  const hook = readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');
  assert.match(hook, /awayMilliseconds\(person, pushedAt\.current, now\)/, '用收到 people 的时刻往后数');
  assert.match(hook, /awayLabel\(/, '复用 awayTime 的单一单位文案');
  assert.match(hook, /isAtDesk\(person\)/, '在座的人不写离座');
  const rules = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
  assert.equal(/^import[^\n]*awayTime/m.test(rules), false, '小窗规则里不该再引一套时长算法');
});

test('自己也在列表里，而且排在最前面（用户：也显示一下自己的头像）', () => {
  const state = buildDockState({
    people: [person('b'), person('me', { name: '我' }), person('a')], myId: 'me', sharing: false,
  });
  assert.deepEqual(state.people.map(row => row.id), ['me', 'a', 'b'], '自己在最左，其余按名字');
  assert.equal(state.people[0].self, true);
  assert.equal(state.people[1].self, false);
  // 自己的卡片上不给"呼叫自己"的三个按钮。
  assert.deepEqual(cardActions(state.people[0]), []);
  assert.deepEqual(cardActions(state.people[1]), ['watch', 'share', 'call']);
  assert.deepEqual(cardActions(null), []);
});

test('排序：未接来电 → 未读 → 正在共享 → 在座', () => {
  const state = buildDockState({
    people: [person('calm'), person('away', { atDesk: false }), person('sharing', { sharing: true }),
      person('unread'), person('missed')],
    unread: { unread: 2 }, missed: new Set(['missed']), sharing: false,
  });
  assert.deepEqual(state.people.map(row => row.id), ['missed', 'unread', 'sharing', 'calm', 'away']);
  assert.equal(state.people[0].missed, true);
  assert.equal(state.missed, 1);
});

test('预览只有"成员 + 有工位"才可能有；访客永远没有', () => {
  const state = buildDockState({
    people: [person('member'), person('visitor', { role: 'visitor', seat: null }),
      person('noDesk', { seat: null })],
    sharing: false,
  });
  const flags = Object.fromEntries(state.people.map(row => [row.id, row.hasPreview]));
  assert.equal(flags.member, true);
  assert.equal(flags.visitor, false, '访客不广播预览，这是规则');
  assert.equal(flags.noDesk, false, '没工位就没有工位预览');
});

test('我自己在共享屏幕时标记出来（主进程据此藏起头像条）', () => {
  assert.equal(buildDockState({ people: [], sharing: true }).sharing, true);
  assert.equal(buildDockState({ people: [], sharing: false }).sharing, false);
});

test('正在通话里的人要标出来（私聊通话 + 会议），而且不参与排序', () => {
  const state = buildDockState({
    people: [person('idle'), person('talking', { inCall: true }),
      person('meeting', { meeting: true }), person('visitor', { role: 'visitor', seat: null })],
    sharing: false,
  });
  const flags = Object.fromEntries(state.people.map(row => [row.id, row.inCall]));
  assert.equal(flags.talking, true, '服务端的 inCall（私聊语音/屏幕通话）要标话筒');
  assert.equal(flags.meeting, true, '会议里的人也在通话里');
  assert.equal(flags.idle, false);
  assert.equal(flags.visitor, false, '缺字段就是没通话，不能瞎标');
  // 排序规则没变：通话**不**是名次键（多一个键就多一次头像换位，用户 2026-09-21 明确不要）。
  assert.deepEqual(state.people.map(row => row.id), ['idle', 'meeting', 'talking', 'visitor']);
});

test('人数上限：头像条不会被塞爆', () => {
  const many = Array.from({ length: 40 }, (_, index) => person('p' + index));
  assert.equal(buildDockState({ people: many, sharing: false }).people.length, DOCK_MAX_PEOPLE);
});

test('占位文案说清"是规则没有"而不是坏了；离座的人不许写成"不在电脑前"', () => {
  assert.match(previewPlaceholder({ hasPreview: false }), /不广播/);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: true }), /正在获取/);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: true }, true), /暂时没有画面/,
    '等过了还没来，别再说"正在获取"');
  // 用户 2026-09-18：「不要出现此人不在电脑前的文字 不在的话用最后一张」
  assert.equal(previewPlaceholder({ hasPreview: true, atDesk: false }, true).includes('不在电脑前'), false);
  assert.equal(previewPlaceholder({ hasPreview: true, atDesk: false }).includes('暂停'), false);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: false }, true), /暂时没有画面/,
    '离座也按普通"还没有画面"来说，画面该是最后那一张');
  assert.equal(previewPlaceholder(null), '');
});

test('小窗报版面：卡片开合、条子宽度和控件命中区域交给主进程', () => {
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /const payload = \{ expanded: Boolean\(statusMenu \|\| state.people.some\(p => p.status\) \|\| hovered \|\| shares.length \|\| meetingPerson !== null \|\| state.meeting\?\.active\), cardPx, stage: Boolean\(greet\),/,
    '悬停状态、舞台、条子宽度都要报给主进程');
  assert.match(dock, /officeDock\?\.layout\?\.\(payload\)/, '去重后的完整 payload 仍须传给主进程');
  assert.equal(dock.includes('setInteractive'), false, '点击穿透那套已经废弃（实测收不到 mousemove）');
  assert.equal(dock.includes('dockInteractive'), false, '命中判定搬到主进程的窗口尺寸上了');
  const rules = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
  assert.equal(rules.includes('dockInteractive'), false, '别再留下没人用的命中函数');
  const preload = readFileSync(new URL('../../OfficeDesktop/desktop-dock-preload.cjs', import.meta.url), 'utf8');
  assert.match(preload, /office:dock-layout/);
  const win = readFileSync(new URL('../../OfficeDesktop/dock-window.cjs', import.meta.url), 'utf8');
  assert.equal(/setIgnoreMouseEvents\s*\(/.test(win.replace(/^\s*\/\/.*$/gm, '')), false,
    '不能再用 ignore+forward：透明窗上收不到 mousemove，悬停卡片点不动（用户 2026-09-18 报障）');
});

test('有人来看我了：动作要从角色自带的动作库里挑一条，而且真的存在', () => {
  // 用户 2026-09-18：「把那个看我的人从状态栏头像中跳出来，站在状态栏上很大，做一个动作，
  // 动作就用下载的动作库里面找一个」。
  const rules = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
  const clip = /export const GREET_CLIP = '([^']+)'/.exec(rules)?.[1];
  assert.ok(clip, '要有一个明确的 GREET_CLIP');
  // 动作库就在角色 GLB 里（Quaternius 打包的 24 条），挑的那条必须真的在。
  const glb = readFileSync(new URL('../public/assets/characters/ruler.glb', import.meta.url));
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
  const names = (json.animations || []).map(a => a.name);
  assert.ok(names.length >= 9, '动作库应该有 9 条：' + names.length);
  assert.ok(names.includes(clip), `角色动作库里没有 ${clip}，手上这些：${names.join(', ')}`);
  assert.equal(clip, '招手_Wave', '打招呼就该是招手');
  // 舞台按需加载 three.js：平时那一页不能把 three.js 直接 import 进来。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /import\('\.\/dockStage'\)/, 'three.js 只在真有人来看时才加载');
  assert.doesNotMatch(dock.split('\n').filter(l => l.startsWith('import ')).join('\n'), /three/,
    '小窗页面的静态 import 里不许出现 three');
  assert.match(dock, /onGreet/, '要接主进程转来的"有人在看你"');
  assert.match(dock, /stage: Boolean\(greet\)/, '舞台亮着要把窗口让出来');
});

test('鼠标停 2 秒才算"我在看他"（用户 2026-09-20）', () => {
  assert.equal(WATCH_DWELL_MS, 2000, '用户要求：鼠标停留在别人头像 2 秒后才开始亮起绿色');
  assert.ok(WATCH_DWELL_GAP_MS > 800, '要比小窗 800ms 的心跳宽，否则每一下都被当成"刚来"');
  // 一下一下地要画面（每 800ms），到 2 秒才算是"在看"。
  let dwell = null;
  const at = [];
  for (const now of [0, 800, 1600, 2400, 3200]) {
    const state = dwellWatch(dwell, 'p1', now);
    dwell = state.dwell;
    if (state.watching) at.push(now);
  }
  assert.deepEqual(at, [2400, 3200], '2 秒之后才开始报，而且一直报（心跳不能断）');
  // 中途断过一次（超过 GAP）就要从头算：划过一排头像不该惊动别人。
  const first = dwellWatch(null, 'p1', 0);
  const resumed = dwellWatch(first.dwell, 'p1', WATCH_DWELL_GAP_MS + 1);
  assert.equal(resumed.watching, false, '指针离开过就要重新数 2 秒');
  assert.equal(resumed.dwell.since, WATCH_DWELL_GAP_MS + 1);
  // 换了个人也是重新计时。
  const other = dwellWatch(dwellWatch(null, 'p1', 0).dwell, 'p2', 500);
  assert.equal(other.watching, false);
  assert.equal(other.dwell.id, 'p2');
  // 刚好停满 2 秒就该报，不用等下一次 800ms 心跳（waitMs 是给定时器用的）。
  const half = dwellWatch(null, 'p1', 0);
  assert.equal(half.watching, false);
  assert.equal(half.waitMs, WATCH_DWELL_MS, '第一下要等满 2 秒');
  assert.equal(dwellWatch(half.dwell, 'p1', 800).waitMs, 1200, '按 800ms 的心跳来，还剩 1.2 秒');
  // 主窗口那边真的按这个规则计时（不能又变回"悬停就报"）。
  const hook = readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');
  assert.match(hook, /dwellWatch\(dwell, personId, Date\.now\(\)\)/, '要用同一条规则计时');
  assert.match(hook, /state\.watching/, '停够了才 onPreviewWant');
  assert.match(hook, /state\.waitMs/, '刚好满 2 秒就报，不等下一次心跳');
  // 亮起来也是慢慢的：用户 2026-09-20「亮起的时间会很慢 大概用2秒才渐渐亮起」。
  assert.equal(PEEK_GLOW_FADE_MS, 2000, '悬停那一路要 2 秒才渐渐亮起到满');
  const office = readFileSync(new URL('../src/useOffice.ts', import.meta.url), 'utf8');
  assert.match(office, /fade: PEEK_GLOW_FADE_MS/, '被看的人要用这个时长去点绿光');
});

test('舞台两种场合：只是停一下小一倍不演动作，打电话过来用当前大小招手（用户 2026-09-20）', () => {
  assert.equal(GREET_CANVAS.call.width, 320, '打电话过来还是"站在状态栏上很大"');
  assert.equal(GREET_CANVAS.call.height, 380);
  assert.equal(GREET_CANVAS.peek.width, 160, '只是鼠标停一下：人物小一倍');
  assert.equal(GREET_CANVAS.peek.height, 190);
  assert.equal(GREET_CANVAS.peek.height * 2, GREET_CANVAS.call.height, '正好一半大');
  assert.equal(greetClip('call'), GREET_CLIP, '打电话过来要招手');
  assert.equal(greetClip('peek'), undefined, '只是看一眼不用打招呼');
  assert.equal(greetMode('call'), 'call');
  assert.equal(greetMode('peek'), 'peek');
  assert.equal(greetMode(undefined), 'peek', '没带 mode 的老消息当"只是看一眼"，别突然放个大角色');
  assert.equal(greetMode('whatever'), 'peek');
  // 页面：画布尺寸与动作都跟着 mode 走，并把 stageMode 报给主进程（窗口据此留地方）。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /GREET_CANVAS\[mode\]/, '画布尺寸按场合取');
  assert.match(dock, /\{ appearance: resolveAppearance\(appearance\), size: mode \}/,
    '三种场合走同一个舞台函数，只差 size；外观按那个人的配色与配件传下去');
  assert.match(dock, /stageMode: mode, stagePx, width,/, '窗口要据此决定留多大地方');
  assert.match(dock, /key=\{greet\.id \+ greetMode\(greet\.mode\)\}/,
    '换人或场合变了要重新挂载');
  assert.match(dock, /\[look, mode\]/, '名单中的外观变化也必须更新舞台');
  const stage = readFileSync(new URL('../src/dockStage.ts', import.meta.url), 'utf8');
  assert.match(stage, /options\.clip \?\? greetClip\(mode\)/, '不点名就按场合取动作');
  assert.match(stage, /GREET_CANVAS\[mode\]/, '舞台自己也按场合定画布');
  const css = readFileSync(new URL('../src/dock.css', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/dock-card.css', import.meta.url), 'utf8');
  assert.match(css, /\.dock-stage\.peek \{ width: 160px; height: 190px; \}/, 'peek 的画布框也要小一半');
});

test('头像外面那圈框的颜色跟着任务栏适配（用户 2026-09-20）', () => {
  // 「把所有的头像整体框起来，像是同一个系统内感觉，有个大的圆角框，另外要根据当前状态栏
  // 的颜色去适配」。
  const dark = frameColors({ light: false, transparent: true });
  assert.match(dark.background, /rgba\(255, 255, 255/, '深色任务栏 → 白色浮层');
  assert.match(dark.border, /rgba\(255, 255, 255/, '边框同色系');
  // 浮层要**极淡**：2026-09-2X 用户说"太白了"，白色浮层 .1 + 白色头像垫底叠起来就是块白玻璃。
  const alphaOf = value => Number(/rgba\([^)]*,\s*([\d.]+)\)/.exec(value)[1]);
  assert.ok(alphaOf(dark.background) <= 0.06, '深色任务栏的白浮层要极淡：' + dark.background);
  assert.ok(alphaOf(dark.backgroundHover) > alphaOf(dark.background), '悬停只能比常态略亮一点');
  assert.ok(alphaOf(dark.backgroundHover) - alphaOf(dark.background) <= 0.03,
    '悬停不许再亮一大截：' + dark.backgroundHover);
  // 头像**没有**自己的小底色（用户 2026-09-2X：「头像本身的小背景有点黑啊 直接去掉内部小背景」），
  // 深浅两种任务栏都一样：贴图是透明底的，直接透出去最干净。
  assert.equal(dark.chip, 'transparent', '头像不要再垫自己的小底色');
  assert.equal(frameColors({ light: true, transparent: true }).chip, 'transparent',
    '浅色任务栏也不要垫底');
  const light = frameColors({ light: true, transparent: true });
  assert.match(light.background, /rgba\(0, 0, 0/, '浅色任务栏 → 黑色浮层');
  // 关掉透明效果：任务栏是不透明纯色，浮层要浓一点才看得见。
  const solid = frameColors({ light: true, transparent: false });
  assert.ok(alphaOf(solid.background) > alphaOf(light.background), '不透明任务栏上要画实一点');
  // 任务栏被强调色着色：边框跟着用强调色，里面垫一层很淡的同色。
  const tinted = frameColors({ light: false, tinted: true, accent: '#0078D7' });
  assert.match(tinted.border, /rgba\(0, 120, 215/, '强调色边框（注意 #0078d7 → 0,120,215）');
  assert.equal(hexToRgba('#0078d7', 0.5), 'rgba(0, 120, 215, 0.5)');
  // 脏数据 / 缺省：退回深色那一套，绝不抛。
  for (const bad of [undefined, null, {}, { tinted: true }, { tinted: true, accent: 'javascript:1' }]) {
    const colors = frameColors(bad);
    assert.match(colors.background, /^rgba\(255, 255, 255/);
    assert.match(colors.border, /^rgba\(255, 255, 255/, '强调色不合法就退回中性边框');
  }
  assert.equal(hexToRgba('胡说', 0.2), 'rgba(255, 255, 255, 0.2)');
  // 页面：所有头像真的被同一个框包住，颜色从 state.theme 来。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /<div className="dock-frame"[^>]*>/, '头像要套在一个框里');
  assert.match(dock, /const frame = frameColors\(state\.theme\)/);
  assert.match(dock, /\['--dock-frame-bg' as string\]: frame\.background/);
  const css = readFileSync(new URL('../src/dock.css', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/dock-card.css', import.meta.url), 'utf8');
  assert.match(css, /\.dock-frame \{[\s\S]*border-radius: 999px/,
    '灵动岛那种纯半圆收口（999px 会被夹成高度的一半）');
  assert.match(css, /padding: 0 calc\(var\(--dock-h\) \* \.4\)/,
    '两侧留白按高度算，够宽才不会让头像的方角戳出半圆');
  assert.match(css, /background: var\(--dock-frame-bg/, '底色用变量，跟着任务栏走');
  assert.equal(/\.dock-frame \{[^}]*overflow: hidden/.test(css), false,
    '不能裁掉头像右上角凸出去的未读"!"和共享标记');
  // 留白够不够：半圆的圆心离左上角是「框高/2」，头像的角要落在内圈里
  //（要求 `留白 ≥ 半径 - √(框高 - 3)`），按 CSS 里那个 0.4 倍验一遍最薄和最厚的任务栏。
  for (const dockHeight of [28, 40, 48, 64]) {
    const frame = dockHeight - 4, radius = frame / 2, pad = dockHeight * 0.4;
    const avatarTop = 2;                     // 头像比框矮 4px，上下各 2px
    const reach = Math.hypot(pad - radius, avatarTop - radius);
    assert.ok(reach <= radius - 1 + 0.5,
      `任务栏 ${dockHeight}px 时头像的角戳出半圆了：${reach.toFixed(2)} > ${(radius - 1).toFixed(2)}`);
  }
});

test('短暂掉线时不许把整排头像抹掉（用户 2026-09-20：「有时候头像会消失闪烁」）', () => {
  const old = { people: [person('a'), person('b')], sharing: false, missed: 0, hidden: false };
  // 休眠/切网：主窗口会先推一份空的（disconnect 里 setPeople([])），几秒后才推回真的名单。
  const blip = mergeState(old, { people: [], sharing: false, missed: 0, hidden: false, connected: false });
  assert.deepEqual(blip.people.map(row => row.id), ['a', 'b'], '断开期间沿用上一次的名单');
  assert.equal(blip.connected, false, '但要把"没连着"这个事实带下去');
  // 连着的时候服务器说没人了就是没人了（该显示"现在没有其他人在线"）。
  const empty = mergeState(old, { people: [], sharing: false, missed: 0, hidden: false, connected: true });
  assert.deepEqual(empty.people, []);
  assert.deepEqual(mergeState(old, { people: [], sharing: false, missed: 0, hidden: false }).people, [],
    '不写 connected 就当连着');
  // 真的要走（退出登录/被请出）时 `hidden: true`：照旧清空，别留着旧名单。
  assert.deepEqual(mergeState(old,
    { people: [], sharing: false, missed: 0, hidden: true, connected: false }).people, []);
  // 断线期间来了新名单：以新的为准（重连之后服务器会给全量）。
  const back = mergeState(old, { people: [person('c')], sharing: false, missed: 0, hidden: false });
  assert.deepEqual(back.people.map(row => row.id), ['c']);
  // 脏数据（null / 乱七八糟）不许把小窗搞崩。
  assert.deepEqual(mergeState(old, null).people, []);
  assert.equal(mergeState(old, { people: 'no' }), old, 'people 不是数组就当没收到，保留手上的');
  // 主窗口那边真的把 connected 报上来了。
  const hook = readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');
  assert.match(hook, /connected: current\.connected/, '小窗要拿到连接状态');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /connected: office\.connected/);
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /mergeState\(old, next as DockState\)/, '小窗收状态时要过这条规则');
});



test('尺子角色 GLD 里，look.ts 登记的每个配件都真的在，招式动作也真的指向骨骼', () => {
  // 用户 2026-09-20：「注意检查所有角色都要适配打招呼的动作」→ 现在只有一个角色（尺子），
  // 但配件变多了：**每一件配件都要能在 GLB 里按名字找到**，否则捏人面板点了没反应。
  const dir = new URL('../public/assets/characters/', import.meta.url);
  const glb = readFileSync(new URL('ruler.glb', dir));
  assert.equal(glb.subarray(0, 4).toString('ascii'), 'glTF', 'ruler.glb 不是 GLB');
  const jsonLength = glb.readUInt32LE(12);
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8'));
  const nodeNames = new Set((json.nodes || []).map(n => n.name));
  const look = readFileSync(new URL('../src/look.ts', import.meta.url), 'utf8');
  // look.ts 里登记的每个 `mesh:` 名字（跳过空串 = 不戴）。
  const meshes = [...look.matchAll(/mesh:\s*"([^"]+)"/g)].map(m => m[1]).filter(Boolean);
  assert.ok(meshes.length >= 19, '配件登记数量不对：' + meshes.length);
  for (const mesh of meshes) {
    assert.ok(nodeNames.has(mesh), `ruler.glb 里没有登记过的配件网格「${mesh}」`);
  }
  // 眼睛已经并进身体，所以身上只该有身体 + 眼镜 + 配件这些节点。
  const names = (json.animations || []).map(a => a.name);
  assert.ok(names.includes(GREET_CLIP), `动作库里没有 ${GREET_CLIP}：${names.join(', ')}`);
  for (const clip of ['站立待机_Idle', '走路循环_Walk']) {
    assert.ok(names.includes(clip), `动作库里没有 ${clip}：${names.join(', ')}`);
  }
  // 不只看名字：招手那条的每一路通道都要指到真实存在的节点上（骨骼改名/缺骨都会在这里露出来）。
  const wave = json.animations.find(a => a.name === GREET_CLIP);
  assert.ok(wave.channels.length > 0, '的招手是空的');
  const nodes = json.nodes || [];
  for (const channel of wave.channels) {
    assert.ok(channel.target?.node != null && nodes[channel.target.node],
      `招手指向了不存在的节点 ${channel.target?.node}`);
    assert.ok(json.accessors?.[channel.sampler != null ? wave.samplers[channel.sampler].input : -1],
      '招手缺少时间轴数据');
  }
  // 招手是真会动的：旋转或位移的通道得有（不然"演"出来是站着的）。
  const moving = wave.channels.some(channel =>
    channel.target.path === 'rotation' || channel.target.path === 'translation');
  assert.ok(moving, '招手没有任何旋转/位移通道');
  // 每个配件都蒙在头上（配件不跟头走 = 戴着帽子转头帽子留在原地）。
  const skinned = new Set();
  for (const mesh of json.meshes || []) {
    for (const prim of mesh.primitives || []) if (prim.attributes?.JOINTS_0 != null) skinned.add(mesh.name);
  }
  for (const mesh of meshes) {
    // 网格数据名可能带后缀（`眼镜` vs `眼镜.001`），按前缀认。
    assert.ok([...skinned].some(name => name === mesh || name.startsWith(mesh + '.')),
      `配件「${mesh}」没有蒙皮，不会跟着头动`);
  }
});

test('头像顺序要粘住：鼠标看着谁，谁就不许被换走（用户 2026-09-21）', () => {
  // 报障：「状态栏的头像位置尽量不要频繁的切换顺序，不然本来鼠标看着一个人闪烁到另一个人了」。
  const target = ['me', 'b', 'a'];                       // 主窗口重排后的"名次"
  const first = stickyOrder(null, ['me', 'a', 'b'], 1000, false);
  assert.deepEqual(first.order.ids, ['me', 'a', 'b'], '第一份名单直接照排');
  assert.equal(first.waitMs, 0);

  // 指针停在条子上：一个都不许挪（新人接最后、走掉的人立刻消失）。
  const frozen = stickyOrder(first.order, target, 1200, true);
  assert.deepEqual(frozen.order.ids, ['me', 'a', 'b'], '指针在上面时顺序冻结');
  const frozenNew = stickyOrder({ ids: ['me', 'a'], since: 0 }, ['me', 'a', 'b'], 1200, true);
  assert.deepEqual(frozenNew.order.ids, ['me', 'a', 'b'], '冻结期间新人接在最后');
  const frozenGone = stickyOrder({ ids: ['me', 'a', 'b'], since: 0 }, ['me', 'a'], 1200, true);
  assert.deepEqual(frozenGone.order.ids, ['me', 'a'], '人走了立刻消失，不留鬼头像');

  // 没停住也不许"一变就跳"：名次和显示对不上之后要连续稳定 ORDER_SETTLE_MS 才换序。
  const pending = stickyOrder(first.order, target, 1200, false);
  assert.deepEqual(pending.order.ids, ['me', 'a', 'b'], '刚变的一瞬间不动');
  assert.equal(pending.order.since, 1200, '稳定时间从"名次第一次对不上"算起');
  assert.equal(pending.waitMs, ORDER_SETTLE_MS, '要告诉调用方过多久再看一眼');
  assert.ok(ORDER_SETTLE_MS >= 1000, '稳定时间不能太短，否则等于没防抖：' + ORDER_SETTLE_MS);
  // 差一点点（1.9 秒）也还不能换。
  assert.deepEqual(stickyOrder(pending.order, target, 1200 + ORDER_SETTLE_MS - 100, false).order.ids,
    ['me', 'a', 'b'], '差一点也不能换');
  // 中途名次又变回去 = 重新计时（抖动的排名永远不会落地）。
  const back = stickyOrder(pending.order, ['me', 'a', 'b'], 2400, false);
  assert.deepEqual(back.order.ids, ['me', 'a', 'b']);
  assert.equal(back.order.since, 0, '名次和显示一致时不再计时');
  assert.equal(back.waitMs, 0, '一致就不用再看');
  // 稳住够久 → 真的换过来。
  const settled = stickyOrder(pending.order, target, 1200 + ORDER_SETTLE_MS, false);
  assert.deepEqual(settled.order.ids, target, '稳住之后才换序');
  assert.equal(settled.order.since, 0, '换完就一致了');
  // 指针一直压着：无论多久都不换（用户就是在这种时候被"闪"到的）。
  assert.deepEqual(stickyOrder({ ids: ['me', 'a', 'b'], since: 1200 }, target, 99999, true).order.ids,
    ['me', 'a', 'b'], '指针在条子上时压多久都不换');

  // 辅助函数：老的人保持先后，新人接最后；摆人头时按 id 取、漏掉的接后面。
  assert.deepEqual(keepOrder(['a', 'b', 'gone'], ['b', 'c', 'a']), ['a', 'b', 'c']);
  assert.deepEqual(orderPeople([{ id: 'a' }, { id: 'b' }, { id: 'c' }], ['b', 'a']).map(r => r.id),
    ['b', 'a', 'c'], '顺序表里没有的人接在最后，别丢人');

  // 页面真的接上了：指针进出的两个事件 + 画的是粘住的顺序。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /onMouseEnter=\{\(\) => setPointerOn\(true\)\}/, '指针上来要冻结顺序');
  assert.match(dock, /onMouseLeave=\{\(\) => setPointerOn\(false\)\}/);
  assert.match(dock, /stickyOrder\(orderRef\.current, state\.people\.map\(row => row\.id\), Date\.now\(\), pointerOn\)/);
  assert.match(dock, /\{people\.map\(row => <DockAvatar/, '画的是粘住的顺序，不是每帧重排的名次');
  assert.equal(/\{state\.people\.map\(row => <DockAvatar/.test(dock), false, '别又画回原始顺序');
  // 名次规则本身没变（未接来电 → 未读 → 共享 → 在座 → 名字）。
  assert.match(source, /Number\(b\.missed\) - Number\(a\.missed\)/);
  assert.match(source, /Number\(b\.sharing\) - Number\(a\.sharing\)/);
});

test('铁律：小窗只做显示 + 遥控，绝不连 socket、绝不碰媒体', () => {
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockPreviewCard.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  for (const forbidden of ['socket.io-client', 'useOffice', 'OfficeScene', 'getDisplayMedia',
    'RTCPeerConnection', 'fetch(']) {
    assert.equal(dock.includes(forbidden), false, '小窗里不该出现 ' + forbidden);
  }
  const preload = readFileSync(new URL('../../OfficeDesktop/desktop-dock-preload.cjs', import.meta.url), 'utf8');
  assert.equal(preload.includes('exposeInMainWorld(\'officeDock\''), true);
  assert.equal(/ipcRenderer\s*[,}]/.test(preload) && !preload.includes('contextBridge.exposeInMainWorld'),
    false, '只能通过 contextBridge 暴露白名单');
  assert.equal(preload.includes('getDisplayMedia'), false);
  assert.equal(preload.includes('nodeIntegration'), false);
  // 主进程那条通道必须真的把小窗和主窗口分开校验。
  const bridge = readFileSync(new URL('../../OfficeDesktop/dock-bridge.cjs', import.meta.url), 'utf8');
  assert.match(bridge, /allowApp/);
  assert.match(bridge, /allowDock/);
  assert.match(bridge, /trusted\(event\.senderFrame\?\.url\)/);
  // 主窗口那侧只推状态、只发起邀请；它自己才是 socket 的拥有者。
  const hook = readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');
  assert.equal(hook.includes('io('), false, '推状态不该另开连接');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /useDockBridge\(\{/, '主窗口负责喂状态');
  assert.match(app, /office\.request\(personId, 'screen', kind === 'share'\)/, '看屏幕/分享走同一条邀请通道');
});

