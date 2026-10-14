// 任务栏头像条那个小窗：建窗参数、贴任务栏、收放、转发消息、加载重试。
// （用户 2026-09-17：贴任务栏、永远置顶、无边框、紧贴右侧托盘左边。）
//
// **什么时候藏/显示**那一簇搬去了 `dock-hide-reasons.test.cjs`（四个理由互不覆盖 + 用户
// 2026-10-14 的"最大化看视频时让位"）。假窗口与 harness 两者共用 `dock-harness.cjs`。
//
// 注意：这个文件在 2026-09-21 被一次 PowerShell 改写弄坏过编码（`Get-Content -Raw` 按 GBK
// 读、再写回 UTF-8，中文和换行全乱了）。从 git 恢复的那版还是 0.1.18 的（还在测"点击穿透"、
// "默认贴托盘"），和现在的代码相反，所以按**当前**行为重写了一遍。**别再拿 PowerShell 改文件**
// （见 Design/Deployment.md 2026-09-21 那条）。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDockWindow, widthFor } = require('../dock-window.cjs');
const { TRAY_RESERVE, STRIP_HEIGHT, CARD_SPACE, CARD_WIDTH, STAGE_SPACE, PEEK_SPACE } =
  require('../taskbar-position.cjs');
const { FakeWindow, harness, settle } = require('./dock-harness.cjs');

test('原生层级检查正常时不反复置顶，隐藏规则照常，窗口独立于任务栏', () => {
  const zOrder = { start() {}, sync: () => true, watching: () => true,
    diagnostics: () => ({}), stop() {} };
  const h = harness({ zOrder });
  try {
    h.dock.ensure();
    for (let i = 0; i < 10; i++) h.dock.place();
    assert.equal(h.window().alwaysOnTop.length, 1, 'only initial topmost declaration');
    assert.equal(h.window().raised || 0, 0, 'correct ordering needs no moveTop');
    assert.equal(h.dock.ownership().attached, false);
    h.dock.setVisible(false, 'sharing');
    assert.equal(h.window().isVisible(), false);
    h.dock.place(); assert.equal(h.window().isVisible(), false);
    h.dock.setVisible(true); assert.equal(h.window().isVisible(), true);
  } finally { h.dock.destroy(); }
});

test('建窗：无边框透明、不进任务栏、不抢焦点、贴任务栏同级置顶、用主窗口同一个会话', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  assert.equal(win.options.frame, false);
  assert.equal(win.options.transparent, true);
  assert.equal(win.options.skipTaskbar, true);
  assert.equal(win.options.focusable, true, '允许点击控件，显示仍使用 showInactive 避免抢焦点');
  assert.equal(win.options.resizable, false);
  assert.equal(win.options.hasShadow, false);
  assert.equal(win.options.webPreferences.session.name, 'persist:office-world', '和主窗口同会话');
  assert.equal(win.options.webPreferences.nodeIntegration, false);
  assert.deepEqual(win.alwaysOnTop, [[false, undefined]], '创建时不抢占最高层，层级由任务栏适配器决定');
  assert.equal(win.url, 'https://115.159.43.237/dock.html');
});

test('位置：贴着任务栏下边缘、右端留出托盘宽度（量不到就用估算值）', async () => {
  const h = harness();
  h.dock.ensure();
  await settle();
  const win = h.window();
  h.dock.place();
  assert.equal(h.dock.stripHeight(), 48, '条子高度 = 任务栏厚度（合身）');
  assert.equal(win.bounds.y + win.bounds.height, 1080, '窗口下边缘贴在屏幕底部');
  assert.equal(win.bounds.x + win.bounds.width, 1920 - TRAY_RESERVE, '右端留出托盘宽度（估算值）');
});

test('悬停卡片开合保持预留窗口尺寸，头像条不闪动', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  h.dock.place();
  const stripY = win.bounds.y;
  assert.deepEqual(h.dock.applyLayout({ expanded: true, width: 0 }),
    { expanded: true, stage: false, peek: false, stagePx: 0, width: 400 });
  assert.equal(win.bounds.height, 48 + CARD_SPACE, '卡片要有地方画');
  assert.equal(win.bounds.y, stripY, '打开预览不移动透明窗口');
  // 页面量出来的真实宽度以它为准（估算值差过 30px，用户看得见）。
  assert.deepEqual(h.dock.applyLayout({ expanded: true, width: 156 }),
    { expanded: true, stage: false, peek: false, stagePx: 0, width: 156 });
  assert.equal(win.bounds.width, CARD_WIDTH, '展开时仍不能窄于卡片');
  assert.deepEqual(h.dock.applyLayout({ expanded: false, width: 156 }),
    { expanded: false, stage: false, peek: false, stagePx: 0, width: 156 });
  assert.equal(win.bounds.width, CARD_WIDTH, '收起仍预留预览宽度，透明区域由命中区域穿透');
  assert.equal(win.bounds.height, 48 + CARD_SPACE, '收起不缩小窗口');
  const stable = win.getBounds();
  let resized = 0;
  const setBounds = win.setBounds.bind(win);
  win.setBounds = next => { resized++; setBounds(next); };
  for (let i = 0; i < 5; i++) {
    h.dock.applyLayout({ expanded: true, width: 156, cardPx: 0 });
    h.dock.applyLayout({ expanded: true, width: 156, cardPx: 200 });
    h.dock.applyLayout({ expanded: false, width: 156, cardPx: 0 });
    assert.deepEqual(win.getBounds(), stable);
  }
  assert.equal(resized, 0, '首帧到测量完成及反复悬停均不触发原生窗口重设尺寸');
});

test('舞台：打电话用老常量、peek 只留一半地方、高度也可以由页面报（来电气泡）', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  h.dock.place();
  const stripY = win.bounds.y;
  h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'call', width: 156 });
  assert.equal(h.dock.stage(), true);
  assert.equal(h.dock.peek(), false);
  assert.equal(win.bounds.height, 48 + STAGE_SPACE, '要放得下那个大角色');
  assert.equal(win.bounds.y, stripY + CARD_SPACE - STAGE_SPACE, '舞台放大仍固定头像条底边');
  // 只是鼠标停在头像上：人物小一倍，窗口也只留一半地方（用户 2026-09-20）。
  assert.deepEqual(h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'peek', width: 156 }),
    { expanded: true, stage: true, peek: true, stagePx: 0, width: 156 });
  assert.equal(win.bounds.height, 48 + PEEK_SPACE);
  // 页面报了舞台高度（角色画布 + 来电气泡）就以它为准：写死的话气泡会被窗口裁掉。
  assert.deepEqual(h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'call',
    stagePx: 452, width: 156 }),
  { expanded: true, stage: true, peek: false, stagePx: 452, width: 156 });
  assert.equal(win.bounds.height, 48 + 452);
  // 脏数据：太小的当没报（退回老常量），太大的封顶。
  h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'call', stagePx: 10, width: 156 });
  assert.equal(win.bounds.height, 48 + STAGE_SPACE, '太小的报数当没有');
  h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'call', stagePx: 5000, width: 156 });
  assert.ok(win.bounds.height <= 48 + 700, '太大的报数要封顶：' + win.bounds.height);
  h.dock.applyLayout({ expanded: false, stage: false, width: 156 });
  assert.equal(h.dock.stage(), false);
  assert.equal(h.dock.peek(), false);
  assert.equal(win.bounds.height, 48 + CARD_SPACE, '舞台收起回预览预留尺寸');
});

test('卡片往哪边画：Win11 条子在最左端只能往右，条子一个像素都不动', () => {
  // 用户 2026-09-20：「鼠标放在上面出现大窗口时头像会自适应位移，需要锁定」。
  const h = harness({ anchor: 'left' });
  h.dock.ensure();
  const win = h.window();
  h.dock.place();
  const collapsed = { ...win.bounds };
  assert.equal(h.dock.popup(), 'right', '左边只有 8px，只能往右画');
  h.dock.applyLayout({ expanded: true, width: 156 });
  assert.equal(h.dock.popup(), 'right');
  assert.equal(win.bounds.x, collapsed.x, '窗口左边缘不动（条子就贴在它左边）');
  assert.equal(win.bounds.width, CARD_WIDTH);
  assert.equal(win.bounds.y, collapsed.y, '预览开合不改变窗口上边缘');
  // 舞台（大角色 / 小人儿）也一样：条子始终在窗口左边。
  h.dock.applyLayout({ expanded: true, stage: true, stageMode: 'call', width: 156 });
  assert.equal(h.dock.popup(), 'right');
  assert.equal(win.bounds.x, collapsed.x);
  h.dock.applyLayout({ expanded: false, stage: false, width: 156 });
  assert.equal(win.bounds.x, collapsed.x, '全部收起后窗口左边缘仍是那一个');
  assert.equal(win.bounds.height, 48 + CARD_SPACE, '窗口保留透明预览空间');
});

test('托盘量到之后贴在它左边：条子右边缘不许越过托盘左边缘', async () => {
  // 用户 2026-09-18 报障：另一台电脑上条子「直接盖在了输入法等那一堆按钮上了」。
  const tray = { measure: async () => ({ rightOffset: 264, trayLeft: 1664 }) };
  const h = harness({ tray });
  h.dock.ensure();
  await settle();
  const win = h.window();
  h.dock.place();
  assert.equal(win.bounds.x + win.bounds.width, 1664 - 8, '窗口右边缘 = 托盘左边再让开 8px');
  assert.ok(win.bounds.x + win.bounds.width <= 1664, '绝不压到托盘');
  // 就算用户往右拖，也要被夹在托盘左边（不能靠用户自己躲）。
  h.state.saved = { dx: 400 };
  h.dock.place();
  assert.ok(h.window().bounds.x + h.window().bounds.width <= 1664, '往右拖也压不过去');
  // 往左拖照旧能用（用户自己躲开托盘是合法的）。
  h.state.saved = { dx: -123 };
  h.dock.place();
  assert.equal(h.window().bounds.x + h.window().bounds.width, 1664 - 8 - 123);
});

test('量托盘失败：退回估算值，不能炸', async () => {
  const tray = { measure: async () => { throw Error('powershell 不在'); } };
  const h = harness({ tray });
  h.dock.ensure();
  await settle();
  assert.equal(h.dock.tray(), null, '量不到就是 null');
  h.dock.place();
  assert.equal(h.window().bounds.x + h.window().bounds.width, 1920 - TRAY_RESERVE, '退回估算值');
  // 没有探测者也不能炸（老调用方）。
  const bare = harness();
  bare.dock.ensure();
  await settle();
  assert.equal(bare.dock.tray(), null);
  assert.ok(bare.window().bounds.width > 0);
});

test('任务栏自动隐藏时我们也藏（连续三次才算，别忽闪）', () => {
  const full = { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
  const h = harness({ display: full });
  h.dock.ensure();
  // 要连着读到三次（每 1.5 秒一次）才真藏：一次就藏的话，息屏/全屏这类抖动会让条子忽闪
  // （用户 2026-09-20）。代价是任务栏真藏起来之后最多多留三四秒，而条子在托盘那侧、
  // 底边别的地方照样能把任务栏碰出来。
  h.dock.place();
  h.dock.place();
  assert.equal(h.window().isVisible(), true, '前两次先不动');
  h.dock.place();
  assert.equal(h.window().isVisible(), false, '认定任务栏真的藏起来了才跟着藏');
});

test('任务栏读数抖一下不许让头像条忽闪（用户 2026-09-20 报的"消失闪烁"）', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  h.dock.place();
  assert.equal(win.isVisible(), true);
  const normal = h.state.display;
  const gone = { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
  // 抖一下又好了：一次都不许藏。
  h.state.display = gone;
  h.dock.place();
  assert.equal(win.isVisible(), true, '第一次读到"没有任务栏"先不动');
  h.state.display = normal;
  h.dock.place();
  assert.equal(win.isVisible(), true);
  h.state.display = gone;
  h.dock.place();
  assert.equal(win.isVisible(), true, '又抖一次还是不动（计数被好读数清零了）');
  // 真的没了：连续三次之后跟着藏。
  h.dock.place();
  h.dock.place();
  assert.equal(win.isVisible(), false, '连续三次才真藏');
  // 一恢复就立刻回来。
  h.state.display = normal;
  h.dock.place();
  assert.equal(win.isVisible(), true, '任务栏回来就立刻显示');
});

test('任务栏换边/换屏/改高度都会重新贴上去', () => {
  const h = harness();
  h.dock.ensure();
  h.state.display = { bounds: { x: 1920, y: 0, width: 2560, height: 1440 },
    workArea: { x: 1920, y: 0, width: 2560, height: 1392 } };
  h.dock.place();
  assert.equal(h.dock.edge(), 'bottom');
  assert.equal(h.window().bounds.x + h.window().bounds.width, 1920 + 2560 - TRAY_RESERVE);
  // 任务栏跑到上边：窗口贴着屏幕上边。
  h.state.display = { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 48, width: 1920, height: 1032 } };
  h.dock.place();
  assert.equal(h.dock.edge(), 'top');
  assert.equal(h.window().bounds.y, 0, '贴着屏幕上边');
});

test('窗口被销毁（驱动/异常）之后要自己建回来，不能就此永久消失', async () => {
  const h = harness({ followMs: 20 });
  h.dock.ensure();
  const first = h.window();
  assert.ok(first);
  first.destroy();                    // 模拟窗口被系统/驱动收掉（不是我们主动 destroy）
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(h.windows.length >= 2, true, '应该又建了一个窗口：' + h.windows.length);
  assert.equal(h.dock.isVisible(), true, '重建之后要贴回去、显示出来');
  // 主动 destroy（退出/关机）之后不许再建回来。
  const before = h.windows.length;
  h.dock.destroy();
  await new Promise(resolve => setTimeout(resolve, 80));
  assert.equal(h.windows.length, before, '主动收掉之后不该自己冒出来');
});

test('拖动后记住偏移，下次仍然贴在那个位置', async () => {
  const h = harness();
  h.dock.ensure();
  h.dock.place();
  h.window().setBounds({ ...h.window().bounds, x: h.window().bounds.x - 120 });
  h.dock.remember();
  assert.equal(h.state.saved.dx, -120);
  h.dock.place();
  assert.equal(h.window().bounds.x, 1920 - TRAY_RESERVE - 400 - 120, '记住之后还贴在那儿');
  // 窗口自己发的 moved 也会记（防抖 300ms）——先把位置放回基准，再拖一次。
  h.state.saved = {};
  h.dock.place();
  h.window().setBounds({ ...h.window().bounds, x: h.window().bounds.x - 40 });
  h.window().emit('moved');
  await new Promise(resolve => setTimeout(resolve, 350));
  assert.equal(h.state.saved.dx, -40, '自己拖完也会记下来');
});

test('转发消息给小窗；窗口没建好时不报错', () => {
  const bare = createDockWindow({ electron: {}, BrowserWindow: FakeWindow, screen: {}, url: '' });
  assert.equal(bare.send('office:dock-state', { people: [] }), false, '还没建窗就是 false');
  const h = harness();
  h.dock.ensure();
  assert.equal(h.dock.send('office:dock-state', { people: [] }), true);
  assert.deepEqual(h.window().sent.at(-1), { channel: 'office:dock-state', payload: { people: [] } });
});

test('不用点击穿透：窗口自己收成头像条大小，永远接收鼠标事件', () => {
  // 用户 2026-09-18：悬停卡片点不动。实测 ignore+forward 状态下页面一条 mousemove 都收不到
  // （Build/dock-hover-watch.mjs），所以整套穿透都不要了。
  const h = harness();
  h.dock.ensure();
  assert.equal(h.window().ignored, undefined, '绝不能调 setIgnoreMouseEvents');
  h.dock.place();
  assert.equal(h.window().ignored, undefined);
});

test('原生层级不可用时降级普通窗口，不反复抢到全屏之上', () => {
  const h = harness();
  try {
    h.dock.ensure();
    for (let i = 0; i < 10; i++) h.dock.place();
    assert.equal(h.window().raised || 0, 0);
    assert.ok(h.window().alwaysOnTop.every(([value]) => value === false));
  } finally { h.dock.destroy(); }
});

test('外部全屏临时隐藏，退出后恢复，但不能覆盖共享或手动隐藏', () => {
  let fullscreen = false;
  const zOrder = { start() {}, sync: () => true, blocked: () => fullscreen,
    watching: () => true, diagnostics: () => ({}), stop() {} };
  const h = harness({ zOrder });
  try {
    h.dock.ensure(); h.dock.place(); assert.equal(h.window().isVisible(), true);
    fullscreen = true; h.dock.place();
    assert.equal(h.window().isVisible(), false); assert.equal(h.dock.why(), 'fullscreen');
    fullscreen = false; h.dock.place(); assert.equal(h.window().isVisible(), true);
    h.dock.setVisible(false, 'sharing');
    fullscreen = true; h.dock.place(); fullscreen = false; h.dock.place();
    assert.equal(h.window().isVisible(), false); assert.equal(h.dock.why(), 'page');
    h.dock.setVisible(true); h.dock.setEnabled(false);
    fullscreen = true; h.dock.place(); fullscreen = false; h.dock.place();
    assert.equal(h.window().isVisible(), false); assert.equal(h.dock.why(), 'manual');
    h.dock.setEnabled(true); assert.equal(h.window().isVisible(), true);
  } finally { h.dock.destroy(); }
});

test('宽度跟着人数走，并且和页面里的条子一样宽（差过 30px 导致偏移）', () => {
  assert.equal(widthFor(4), 157, '4 个头像 = 32*4 + 2*3 + 把手 15 + 留白 8（和 dock.css 一致）');
  assert.ok(widthFor(1) < widthFor(3), '一个人比三个人窄');
  assert.equal(widthFor(30), 560, '再多人也不会无限宽');
  const h = harness();
  h.dock.ensure();
  h.dock.place();
  assert.equal(h.window().bounds.width, 400, '页面还没报之前用建窗时的估算值');
  // 页面量出来的真实宽度优先。
  h.dock.applyLayout({ expanded: false, width: 156 });
  assert.equal(h.window().bounds.width, CARD_WIDTH);
  assert.equal(h.dock.width(), 156);
});

test('页面没加载出来会自己重试（开机自启时网络常常还没起来）', async () => {
  // 用户 2026-09-20：「有时候启动不出现头像 / 有时候开机自启不出现头像」——窗口是透明的，
  // 那一次 loadURL 失败就等于什么都没显示，而老代码从来不重试。
  const h = harness({ loadRetryMs: [20] });
  h.dock.ensure();
  const win = h.window();
  assert.equal(win.url, 'https://115.159.43.237/dock.html', '第一次加载');
  win.url = '';
  win.webContents.emit('did-fail-load', {}, -106, 'ERR_INTERNET_DISCONNECTED', '', true);
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(win.url, 'https://115.159.43.237/dock.html', '失败之后要自己再加载一次');
  // 我们自己打断的（-3）不算失败，别疯狂重试。
  win.url = '';
  win.webContents.emit('did-fail-load', {}, -3, 'ERR_ABORTED', '', true);
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(win.url, '', '-3 是我们自己中断的，不重试');
  // 渲染进程崩了（驱动/GPU 抖动）：窗口会变一片空白，重新加载。
  win.webContents.emit('did-finish-load');
  win.webContents.emit('render-process-gone');
  await new Promise(resolve => setTimeout(resolve, 120));
  assert.equal(win.url, 'https://115.159.43.237/dock.html', '崩了要重新加载');
  h.dock.destroy();
});

test('销毁后不再跟随，也不留定时器', async () => {
  const h = harness();
  h.dock.ensure();
  h.dock.destroy();
  assert.equal(h.window().destroyed, true);
  assert.equal(h.dock.window(), undefined);
  await settle();
  assert.equal(h.dock.place(), null, '销毁之后再贴也不炸');
  assert.equal(h.dock.send('office:dock-state', {}), false);
});
