// 任务栏头像条的位置：四条边、自动隐藏、多屏、拖动偏移、贴边夹紧。
// （用户 2026-09-17 定的：贴任务栏、紧贴右侧托盘左边、任务栏藏起来我们也藏。）
//
// 位置算的是**窗口**：窗口比头像条高，多出来的透明部分是给悬停卡片用的，窗口下边缘与
// 头像条下边缘对齐——所以卡片永远在窗口内部，不会被裁掉。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { taskbarRect, dockBounds, TRAY_RESERVE, STRIP_HEIGHT, CARD_SPACE } =
  require('../taskbar-position.cjs');

const display = ({ x = 0, y = 0, width = 1920, height = 1080, taskbar = 48, side = 'bottom' } = {}) => {
  const bounds = { x, y, width, height };
  const workArea = side === 'bottom' ? { x, y, width, height: height - taskbar }
    : side === 'top' ? { x, y: y + taskbar, width, height: height - taskbar }
      : side === 'left' ? { x: x + taskbar, y, width: width - taskbar, height }
        : { x, y, width: width - taskbar, height };
  return { bounds, workArea };
};
const windowHeight = STRIP_HEIGHT + CARD_SPACE;
const strip = { width: 400 };

test('任务栏在下方：认出边与厚度', () => {
  const bar = taskbarRect(display());
  assert.equal(bar.edge, 'bottom');
  assert.equal(bar.thickness, 48);
  assert.equal(bar.hidden, false);
});

test('任务栏在上/左/右都能认出来', () => {
  assert.equal(taskbarRect(display({ side: 'top' })).edge, 'top');
  assert.equal(taskbarRect(display({ side: 'left' })).edge, 'left');
  assert.equal(taskbarRect(display({ side: 'right' })).edge, 'right');
});

test('默认贴在任务栏右侧、托盘左边，头像条在任务栏里竖直居中', () => {
  const box = dockBounds({ display: display(), ...strip });
  assert.equal(box.hidden, false);
  assert.equal(box.x, 1920 - TRAY_RESERVE - 400, '右端留出托盘宽度');
  assert.equal(box.strip.y + STRIP_HEIGHT / 2, 1080 - 48 + 24, '头像条在任务栏里竖直居中');
  assert.equal(box.y, box.strip.y + STRIP_HEIGHT - windowHeight, '窗口下边缘与头像条下边缘对齐');
  assert.equal(box.height, windowHeight);
  assert.ok(box.y > 0, '窗口整体在屏幕内');
});

test('任务栏在屏幕上方：窗口向下展开，卡片不会被推出屏幕', () => {
  const box = dockBounds({ display: display({ side: 'top' }), ...strip });
  assert.equal(box.y, box.strip.y, '窗口上边缘贴着头像条');
  assert.ok(box.y >= 0);
  assert.ok(box.y + box.height <= 480, '不会跑到屏幕外');
});

test('任务栏自动隐藏（workArea == bounds）时我们也藏', () => {
  const full = { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
  assert.equal(taskbarRect(full).hidden, true);
  assert.equal(dockBounds({ display: full, ...strip }).hidden, true, '不能让任务栏弹不出来');
});

test('用户拖过之后按偏移量走，并被夹在屏幕内', () => {
  const moved = dockBounds({ display: display(), ...strip, dx: -120, dy: 0 });
  assert.equal(moved.x, 1920 - TRAY_RESERVE - 400 - 120);
  const pushed = dockBounds({ display: display(), ...strip, dx: -5000 });
  assert.equal(pushed.x, 0, '不能拖出屏幕左边');
  const far = dockBounds({ display: display(), ...strip, dx: 5000 });
  assert.equal(far.x, 1920 - 400, '不能拖出屏幕右边');
});

test('多屏与副屏偏移：坐标带屏的原点', () => {
  const second = display({ x: 1920, y: 0 });
  const box = dockBounds({ display: second, ...strip });
  assert.equal(box.x, 1920 + 1920 - TRAY_RESERVE - 400);
  assert.ok(box.x > 1920);
});

test('任务栏特别厚时也不会溢出任务栏', () => {
  const thick = display({ taskbar: 120 });
  const box = dockBounds({ display: thick, ...strip });
  assert.ok(box.strip.y >= thick.bounds.height - 120);
  assert.ok(box.strip.y + STRIP_HEIGHT <= thick.bounds.height);
});

test('竖着的任务栏：头像条靠下并留同样的偏移', () => {
  const box = dockBounds({ display: display({ side: 'left' }), width: 300 });
  assert.equal(box.hidden, false);
  assert.equal(box.x, 0, '贴着任务栏内边');
  assert.equal(box.strip.y, 1080 - TRAY_RESERVE - STRIP_HEIGHT, '从左边缘往上数同样的偏移');
});

test('拿不到显示器时返回隐藏，绝不硬放一个坐标', () => {
  assert.equal(dockBounds({ display: null, ...strip }).hidden, true);
  assert.equal(taskbarRect(null).hidden, true);
});
