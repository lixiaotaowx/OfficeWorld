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

test('默认贴在任务栏右侧、托盘左边，头像条高度＝任务栏厚度（合身）', () => {
  const box = dockBounds({ display: display(), ...strip });
  assert.equal(box.hidden, false);
  assert.equal(box.x, 1920 - TRAY_RESERVE - 400, '右端留出托盘宽度');
  assert.equal(box.strip.height, 48, '条子和任务栏一样高（这台实测 40 DIP）');
  assert.equal(box.strip.y, 1080 - 48, '贴着任务栏下边缘，不居中也不溢出');
  assert.equal(box.y, box.strip.y + box.strip.height - box.height, '窗口下边缘与头像条下边缘对齐');
  assert.equal(box.height, 48 + CARD_SPACE);
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
  assert.equal(box.strip.y, 1080 - TRAY_RESERVE - box.strip.height, '从左边缘往上数同样的偏移');
});

test('收起（expanded: false）时窗口就是头像条本身：不高、不宽，一个像素都不多占任务栏', () => {
  // 用户 2026-09-18 报障"悬停卡片点不动"之后改的：小窗不再靠点击穿透，而是没人悬停时
  // 就把自己收成头像条大小——所以收起状态下窗口绝不能比条子大。
  const box = dockBounds({ display: display(), ...strip, expanded: false });
  assert.equal(box.height, 48, '高度就是条子高度');
  assert.equal(box.width, 400, '宽度就是条子宽度（不会被卡片撑到 340+）');
  assert.equal(box.y, box.strip.y, '窗口上边缘 = 条子下边缘 - 条子高度，也就是条子本身');
  // 窄条子也一样：窗口不该因为卡片被撑宽。
  const narrow = dockBounds({ display: display(), width: 156, expanded: false });
  assert.equal(narrow.width, 156);
  assert.equal(narrow.x, 1920 - TRAY_RESERVE - 156);
  // 展开时才给卡片留空间。
  const open = dockBounds({ display: display(), width: 156, expanded: true });
  assert.equal(open.width, 340, '展开时至少和卡片一样宽');
  assert.equal(open.height, 48 + CARD_SPACE);
  assert.equal(open.strip.x, narrow.strip.x, '展开/收起时条子位置不变，不会跳');
  assert.equal(open.strip.y, narrow.strip.y);
});

test('「有人来看我了」的舞台：窗口要长到放得下那个大角色，宽度也更宽', () => {
  // 用户 2026-09-18：「把那个看我的人从状态栏头像中跳出来，站在状态栏上很大」——
  // 380 高的角色比悬停卡片高得多，窗口得跟着长。
  const { STAGE_SPACE, STAGE_WIDTH } = require('../taskbar-position.cjs');
  const bare = dockBounds({ display: display(), width: 156, expanded: false });
  const card = dockBounds({ display: display(), width: 156, expanded: true });
  const stage = dockBounds({ display: display(), width: 156, expanded: true, stage: true });
  assert.equal(bare.height, 48);
  assert.equal(card.height, 48 + CARD_SPACE);
  assert.equal(stage.height, 48 + STAGE_SPACE, '舞台比卡片高一大截');
  assert.ok(STAGE_SPACE > CARD_SPACE + 150, '要放得下 380 高的角色');
  assert.equal(stage.width, STAGE_WIDTH, '比卡片还宽一点');
  // 条子的位置不能动：三种状态下都贴着任务栏下边缘、右端还是那条线。
  assert.equal(stage.strip.y, bare.strip.y);
  assert.equal(stage.strip.x, bare.strip.x);
  assert.equal(stage.y + stage.height - 48, bare.strip.y, '窗口下边缘 = 条子下边缘');
});

test('只是鼠标停在头像上（peek）：窗口只留一半地方（用户 2026-09-20）', () => {
  // 「只是鼠标放上的话人物出现会小一倍」——人物小一倍，窗口也就不必比卡片高出一大截，
  // 免得白白挡住任务栏上方那一片（那片透明区是会吃鼠标的）。
  const { PEEK_SPACE, PEEK_WIDTH, STAGE_SPACE, STAGE_WIDTH } = require('../taskbar-position.cjs');
  const peek = dockBounds({ display: display(), width: 156, expanded: true, stage: true, peek: true });
  const call = dockBounds({ display: display(), width: 156, expanded: true, stage: true });
  const card = dockBounds({ display: display(), width: 156, expanded: true });
  assert.equal(peek.height, 48 + PEEK_SPACE);
  assert.equal(call.height, 48 + STAGE_SPACE, '打电话过来还是"站在任务栏上很大"');
  assert.ok(PEEK_SPACE < STAGE_SPACE, 'peek 要比 call 矮');
  assert.ok(PEEK_SPACE > CARD_SPACE - 40, '但也要真的放得下那个小一倍的人（160×190）');
  assert.equal(peek.width, PEEK_WIDTH, '宽度也收窄到小画布');
  assert.ok(PEEK_WIDTH < STAGE_WIDTH && PEEK_WIDTH > 156, '比大舞台窄，但比一条 156 的条子宽');
  // 条子本身一动不动：三种状态都贴在任务栏下边缘，右端还是那条线。
  assert.equal(peek.strip.x, card.strip.x);
  assert.equal(peek.strip.y, card.strip.y);
  assert.equal(peek.y + peek.height - 48, card.strip.y, '窗口下边缘 = 条子下边缘');
  // 没给 peek 时就是原来那个大舞台（老页面/老客户端照旧）。
  assert.equal(dockBounds({ display: display(), width: 156, expanded: true, stage: true, peek: false }).height,
    48 + STAGE_SPACE);
});

test('拿不到显示器时返回隐藏，绝不硬放一个坐标', () => {
  assert.equal(dockBounds({ display: null, ...strip }).hidden, true);
  assert.equal(taskbarRect(null).hidden, true);
});

test('Windows 11 认到 build ≥ 22000，Windows 10 继续贴托盘', () => {
  const { dockAnchor } = require('../taskbar-position.cjs');
  assert.equal(dockAnchor('10.0.19045'), 'tray', 'Win10 22H2 还是贴托盘');
  assert.equal(dockAnchor('10.0.19044'), 'tray');
  assert.equal(dockAnchor('10.0.22000'), 'left', 'Win11 第一个正式版就是 22000');
  assert.equal(dockAnchor('10.0.22631'), 'left');
  assert.equal(dockAnchor(''), 'tray', '认不出来就当 Win10（保持现状最安全）');
  assert.equal(dockAnchor(undefined), 'tray');
  assert.equal(dockAnchor('garbage'), 'tray');
});

test('Windows 11：头像条简单放在屏幕最左侧（用户 2026-09-18）', () => {
  const { LEFT_GAP } = require('../taskbar-position.cjs');
  const strip100 = dockBounds({ display: display(), width: 156, expanded: false, anchor: 'left' });
  assert.equal(strip100.strip.x, LEFT_GAP, '条子贴屏幕左边，只留一点点空隙');
  assert.equal(strip100.x, LEFT_GAP, '收起时窗口就是条子本身');
  assert.ok(strip100.x + strip100.width <= 1920);
  assert.equal(strip100.strip.y, 1080 - 48, '竖直方向不变，还是贴着任务栏');
  // 展开/舞台时条子一动不动，窗口在屏幕内往右长。
  const open = dockBounds({ display: display(), width: 156, expanded: true, anchor: 'left' });
  assert.equal(open.strip.x, strip100.strip.x);
  assert.equal(open.strip.y, strip100.strip.y);
  assert.ok(open.width >= 340, '还是至少和卡片一样宽，卡片不会被裁');
  assert.ok(open.x >= 0 && open.x + open.width <= 1920, '窗口不能被推出屏幕');
  assert.ok(open.x <= open.strip.x && open.strip.x + open.strip.width <= open.x + open.width,
    '条子必须在窗口里面，卡片才画得下');
  // 拖到屏幕外会被夹住。
  const dragged = dockBounds({ display: display(), width: 156, expanded: false, anchor: 'left', dx: -500 });
  assert.equal(dragged.strip.x, 0);
  const pushed = dockBounds({ display: display(), width: 156, expanded: false, anchor: 'left', dx: 5000 });
  assert.equal(pushed.strip.x, 1920 - 156);
});

test('Windows 11 放最左侧时不受托盘夹紧影响（那条规则只给托盘那侧用）', () => {
  // 量到的托盘左边缘就在屏幕中间：贴着托盘时条子会被推到那儿，放最左侧时不该理它。
  const trayLeft = 1200;
  const tray = dockBounds({ display: display(), ...strip, trayLeft, rightOffset: 500, anchor: 'tray' });
  assert.equal(tray.strip.x, trayLeft - 8 - 400, '贴托盘这侧仍然被夹在托盘左边');
  const left = dockBounds({ display: display(), width: 400, expanded: false, trayLeft, anchor: 'left' });
  assert.equal(left.strip.x, 8, '最左侧就是最左侧，托盘在哪都不管');
});

test('卡片往哪边画要挑有地方的那边（用户 2026-09-20：「小窗口出现的方向多变一下」）', () => {
  // Windows 11：条子贴在屏幕最左端，左边只有 8px，卡片只能往右画，窗口也就往右长。
  const left = dockBounds({ display: display(), width: 156, expanded: true, anchor: 'left' });
  assert.equal(left.popup, 'right', '左边没地方 → 翻到右边');
  assert.equal(left.x, 8, '往右长时窗口左边缘 = 条子左边缘');
  assert.equal(left.strip.x, 8, '条子纹丝不动');
  assert.equal(left.width, 340);
  assert.ok(left.x + left.width <= 1920);
  // 老样子（Win10 贴托盘、条子在右边）：左边地方大，继续往左画。
  const tray = dockBounds({ display: display(), width: 156, expanded: true, anchor: 'tray' });
  assert.equal(tray.popup, 'left');
  assert.equal(tray.x, tray.strip.x + tray.strip.width - tray.width, '往左长：右边缘与条子右边缘对齐');
  // 收起/舞台/peek 三种状态的判断必须一致，否则条子会左右横跳（参考宽度固定用卡片宽度）。
  for (const state of [{ expanded: false }, { expanded: true, stage: true },
    { expanded: true, stage: true, peek: true }]) {
    assert.equal(dockBounds({ display: display(), width: 156, anchor: 'left', ...state }).popup, 'right',
      '状态变了也不能换边：' + JSON.stringify(state));
    assert.equal(dockBounds({ display: display(), width: 156, anchor: 'left', ...state }).strip.x, 8);
  }
  // 条子被拖到偏左的位置（左边只剩 100px，放不下 340 的卡片）：往右画，条子仍然不许动。
  const middle = dockBounds({ display: display(), width: 156, expanded: true,
    dx: -(1920 - TRAY_RESERVE - 156 - 100), anchor: 'tray' });
  assert.equal(middle.strip.x, 100);
  assert.equal(middle.popup, 'right', '左边放不下 340 的卡片，就往右画');
  assert.equal(middle.x, middle.strip.x, '往右画时窗口左边缘跟着条子');
});

test('窗口长出来时头像条一个像素都不动（Win11 那条小 bug）', () => {
  // 用户 2026-09-20：「鼠标放在上面出现大窗口时头像会自适应位移，需要锁定」。
  // 根因：条子在屏幕最左端时窗口还按"往左长"摆，左边缘被屏幕夹住 → 窗口右边缘不再和条子
  // 对齐 → 页面里靠右对齐的头像条被顶到一边（实测位移 175px）。
  const collapsed = dockBounds({ display: display(), width: 156, expanded: false, anchor: 'left' });
  for (const state of [
    { expanded: true },
    { expanded: true, stage: true },
    { expanded: true, stage: true, peek: true },
  ]) {
    const box = dockBounds({ display: display(), width: 156, anchor: 'left', ...state });
    assert.deepEqual(box.strip, collapsed.strip, '任何状态下条子的位置与尺寸都必须一样');
    assert.ok(box.x >= 0 && box.x + box.width <= 1920, '窗口不能被推出屏幕');
    // 条子必须落在窗口里面，而且贴在"卡片另一侧"的那条边上。
    const side = box.popup === 'right' ? box.x : box.x + box.width - box.strip.width;
    assert.equal(box.strip.x, side, '条子钉在窗口靠' + (box.popup === 'right' ? '左' : '右') + '的那条边');
  }
});
