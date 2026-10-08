// 任务栏托盘到底有多宽：解析、换算、缓存、失败兜底。
//
// 用户 2026-09-18 报障：另一台电脑上头像条「直接盖在了输入法等那一堆按钮上了」——
// 因为托盘宽度是写死的 220 DIP（实测这台机器就 256px）。现在真的去量 TrayNotifyWnd。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTrayArea, parseTrayRect, trayReserveDip, TRAY_GAP } =
  require('../tray-area.cjs');

const display = { bounds: { x: 0, y: 0, width: 1920, height: 1080 }, scaleFactor: 1 };
/** 任务栏在 DIP 下 40 高（夹具里和上面那块屏一致）。 */
const TASKBAR_DIP = 40;

test('解析 PowerShell 输出：拿最后一行 JSON，坏了就当没有', () => {
  const ok = parseTrayRect('{"ok":true,"aware":true,"tray":{"left":1664,"top":1040,"right":1920,"bottom":1080},' +
    '"taskbar":{"left":0,"top":1040,"right":1920,"bottom":1080}}\n');
  assert.deepEqual(ok.tray, { left: 1664, top: 1040, right: 1920, bottom: 1080 });
  assert.deepEqual(ok.taskbar, { left: 0, top: 1040, right: 1920, bottom: 1080 });
  assert.equal(ok.aware, true);
  assert.ok(parseTrayRect('warning: 噪音\n{"ok":true,"tray":{"left":10,"top":0,"right":20,"bottom":10}}'),
    '前面有噪音也要认');
  assert.equal(parseTrayRect('{"ok":false,"why":"no-tray"}'), null);
  assert.equal(parseTrayRect('not json'), null);
  assert.equal(parseTrayRect(''), null);
  assert.equal(parseTrayRect('{"ok":true,"tray":{"left":100,"top":0,"right":100,"bottom":10}}'), null, '空矩形不算');
  assert.equal(parseTrayRect('{"ok":true,"tray":{"left":"x","top":0,"right":10,"bottom":10}}'), null);
});

test('换算成"离屏幕右端多远"：这台机器实测托盘 256px', () => {
  const rect = { left: 1664, top: 1040, right: 1920, bottom: 1080 };
  const bar = { left: 0, top: 1040, right: 1920, bottom: 1080 };
  const result = trayReserveDip({ display, rect, taskbar: bar, taskbarDip: TASKBAR_DIP });
  assert.equal(result.rightOffset, 1920 - 1664 + TRAY_GAP, '托盘 256 宽 + 8px 空隙');
  assert.equal(result.trayLeft, 1664, '托盘左边缘留着夹住拖动');
  assert.equal(result.space, 1, '这台 100% 缩放，物理像素 = DIP');
  assert.ok(result.rightOffset > 220, '比原来的估算值 220 大——这正是这台机器之前会压进去的原因');
});

test('高 DPI：物理像素要按缩放折算（进程 DPI 感知那条路）', () => {
  // 1920 物理宽 @150% → Electron 那边是 1280x720 DIP；任务栏物理 60 高 = 40 DIP。
  const hidpi = { bounds: { x: 0, y: 0, width: 1280, height: 720 }, scaleFactor: 1.5 };
  const result = trayReserveDip({ display: hidpi, taskbarDip: TASKBAR_DIP,
    rect: { left: 1536, top: 960, right: 1920, bottom: 1020 },
    taskbar: { left: 0, top: 960, right: 1920, bottom: 1020 } });
  assert.equal(result.trayLeft, 1024, '1536 物理 / 1.5 = 1024 DIP');
  assert.equal(result.rightOffset, 1280 - 1024 + TRAY_GAP);
  assert.equal(result.space, 1.5);
});

test('坐标被"虚拟化"过（子进程不 DPI 感知）时，不能再除一次缩放', () => {
  // 这正是那台 150% 缩放的机器上出的问题：拿到的 left 已经是 DIP(1109) 了，
  // 老代码又除以 1.5 → 736，条子就跑到屏幕中间去了。
  const hidpi = { bounds: { x: 0, y: 0, width: 1280, height: 720 }, scaleFactor: 1.5 };
  const result = trayReserveDip({ display: hidpi, taskbarDip: TASKBAR_DIP,
    rect: { left: 1109, top: 640, right: 1280, bottom: 680 },
    taskbar: { left: 0, top: 640, right: 1280, bottom: 680 } });
  assert.equal(result.space, 1, '任务栏只有 40 高 → 说明坐标已经是"已缩放"的');
  assert.equal(result.trayLeft, 1109);
  assert.equal(result.rightOffset, 1280 - 1109 + TRAY_GAP);
  assert.ok(result.rightOffset < 200, '这才是"贴着托盘左边"，而不是屏幕中间');
});

test('离谱的结果宁可不要（半屏宽的托盘 / 贴到屏幕左边都当没量到）', () => {
  const rect = { left: 200, top: 1040, right: 1920, bottom: 1080 };
  assert.equal(trayReserveDip({ display, rect, taskbarDip: TASKBAR_DIP,
    taskbar: { left: 0, top: 1040, right: 1920, bottom: 1080 } }), null, '1720 宽的"托盘"不可信');
  const whole = { left: 0, top: 1040, right: 1920, bottom: 1080 };
  assert.equal(trayReserveDip({ display, rect: whole, taskbarDip: TASKBAR_DIP,
    taskbar: { left: 0, top: 1040, right: 1920, bottom: 1080 } }), null, '托盘顶到屏幕左边也不可信');
});

test('托盘不在那块屏上（副屏、竖排任务栏）就不硬算', () => {
  const second = { bounds: { x: 1920, y: 0, width: 1920, height: 1080 }, scaleFactor: 1 };
  const rect = { left: 1664, top: 1040, right: 1920, bottom: 1080 };
  const bar = { left: 0, top: 1040, right: 1920, bottom: 1080 };
  assert.equal(trayReserveDip({ display: second, rect, taskbar: bar, taskbarDip: TASKBAR_DIP }),
    null, '主屏的托盘跟副屏的头像条没关系');
  assert.equal(trayReserveDip({ display, rect: null, taskbar: bar, taskbarDip: TASKBAR_DIP }), null);
  assert.equal(trayReserveDip({ display: null, rect, taskbar: bar, taskbarDip: TASKBAR_DIP }), null);
});

const SCRIPT_OUT = '{"ok":true,"aware":true,' +
  '"tray":{"left":1664,"top":1040,"right":1920,"bottom":1080},' +
  '"taskbar":{"left":0,"top":1040,"right":1920,"bottom":1080}}';

test('探测者：缓存、失败兜底、非 Windows 直接不查', async () => {
  let calls = 0;
  const tray = createTrayArea({
    run: async () => { calls++; return SCRIPT_OUT; },
    cacheMs: 10000,
  });
  const first = await tray.measure(display, { taskbarDip: TASKBAR_DIP });
  assert.equal(first.rightOffset, 1920 - 1664 + TRAY_GAP);
  await tray.measure(display, { taskbarDip: TASKBAR_DIP });
  assert.equal(calls, 1, '缓存期内不再跑脚本');
  await tray.measure(display, { force: true, taskbarDip: TASKBAR_DIP });
  assert.equal(calls, 2, 'force 要重量');
  assert.deepEqual(tray.raw().tray, { left: 1664, top: 1040, right: 1920, bottom: 1080 });

  const failing = createTrayArea({ run: async () => { throw Error('powershell 被挡'); } });
  assert.equal(await failing.measure(display, { taskbarDip: TASKBAR_DIP }), null,
    '量不到就返回 null（调用方退回估算值）');

  const foreign = createTrayArea({ platform: 'darwin', run: async () => SCRIPT_OUT });
  assert.equal(await foreign.measure(display, { taskbarDip: TASKBAR_DIP }), null);
});

test('同一时刻只跑一次脚本（并发调用共享同一个 promise）', async () => {
  let calls = 0;
  const tray = createTrayArea({
    run: async () => { calls++; await new Promise(r => setTimeout(r, 20));
      return '{"ok":true,"tray":{"left":1800,"top":0,"right":1920,"bottom":40},' +
        '"taskbar":{"left":0,"top":0,"right":1920,"bottom":40}}'; },
  });
  const [a, b] = await Promise.all([
    tray.measure(display, { taskbarDip: TASKBAR_DIP }),
    tray.measure(display, { taskbarDip: TASKBAR_DIP })]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});
