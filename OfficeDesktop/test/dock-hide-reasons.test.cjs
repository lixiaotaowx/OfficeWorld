// 任务栏头像条小窗：**什么时候藏、什么时候显示**。
//
// 四个理由各自独立（页面说 / 主进程说 / 用户说 / 任务栏没了），任何一个说藏就藏，但它们
// 互不覆盖 —— 以前共用一个标志时，最后写的那一路会把别的理由顶掉（比如整屏结束后那条事件
// 没来、页面又一直没再推状态，条子就永远藏着）。用户 2026-09-22「头像这个 ui 有时候会消失
// 找不到」就是照这条查出来的。
//
// 2026-10-14 补的是用户提的通用播放器逻辑：「当状态栏小窗口出现视频共享画面时，点击最大化，
// 这个小窗口会消失；当最小化时，这个小窗口就会出现」。所以判定搬到了 `fullscreen.cjs` 的
// `hidesDock()`（整屏 **或** 最大化；最小化不算），`main.cjs` 的 `systemHidden` 用它。
//
// 从 `dock-window.test.cjs` 拆出来（那个文件到 528 行、超了 500 行上限），共用
// `dock-harness.cjs` 里的假窗口。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./dock-harness.cjs');
test('应用层要求隐藏（共享屏幕/全屏）就藏，要求显示就回来', () => {
  const h = harness();
  h.dock.ensure();
  h.dock.place();
  assert.equal(h.window().isVisible(), true);
  h.dock.setVisible(false, 'sharing');
  assert.equal(h.window().isVisible(), false);
  assert.equal(h.dock.reason(), 'sharing');
  h.dock.setVisible(true);
  assert.equal(h.window().isVisible(), true);
  // 托盘里的开关：关掉就一直不显示。
  h.dock.setEnabled(false);
  assert.equal(h.window().isVisible(), false);
  assert.equal(h.dock.enabled(), false);
  h.dock.setEnabled(true);
  assert.equal(h.window().isVisible(), true);
});

test('藏起来的三个理由互不覆盖，整屏那一路绝不会卡住（用户 2026-09-22「头像有时候会消失找不到」）', () => {
  let fullscreen = false;
  const h = harness({ systemHidden: () => fullscreen });
  h.dock.ensure();
  h.dock.place();
  assert.equal(h.window().isVisible(), true, '平时是显示的');
  assert.equal(h.dock.why(), 'shown');
  // 整屏：藏。**页面那边一直在说"显示"**（它不知道整屏），不许把这一路顶掉。
  fullscreen = true;
  h.dock.place();
  assert.equal(h.window().isVisible(), false);
  assert.equal(h.dock.why(), 'system');
  h.dock.setVisible(true);
  assert.equal(h.window().isVisible(), false, '页面说显示也不能盖过整屏');
  assert.equal(h.dock.why(), 'system');
  // 整屏结束：**不靠任何事件**，下一次贴位置自己就回来（以前事件一漏就永久藏着）。
  fullscreen = false;
  h.dock.place();
  assert.equal(h.window().isVisible(), true, '整屏结束必须自己回来');
  assert.equal(h.dock.why(), 'shown');
  // 页面那一路（共享屏幕/没登录）照样独立生效、也能自己恢复。
  h.dock.setVisible(false, 'sharing');
  assert.equal(h.dock.why(), 'page');
  assert.equal(h.window().isVisible(), false);
  h.dock.setVisible(true);
  assert.equal(h.dock.why(), 'shown');
  // 托盘开关那一路也是独立的。
  h.dock.setEnabled(false);
  assert.equal(h.dock.why(), 'manual');
  assert.equal(h.window().isVisible(), false);
  h.dock.setEnabled(true);
  assert.equal(h.window().isVisible(), true);
  // 每一次结论变化都留了证据（落到 dock-why.json）。
  const reasons = h.decisions.map(row => row.why);
  assert.deepEqual(reasons, ['shown', 'system', 'shown', 'page', 'shown', 'manual', 'shown'],
    '只有变化时才记，且理由要对得上：' + JSON.stringify(reasons));
  assert.ok(h.decisions.every(row => typeof row.at === 'string' && 'pageVisible' in row));
});

test('主窗口最大化时条子也让位，恢复大小就回来（用户 2026-10-14 的通用播放器逻辑）', () => {
  // 用户原话：「当状态栏小窗口出现视频共享画面时，点击最大化，这个小窗口会消失；当最小化时，
  // 这个小窗口就会出现。这就是这种常见的逻辑」。`main.cjs` 把 `hidesDock(mainWindow)` 交给
  // `systemHidden`，所以这里只要像真的那样跟着窗口状态翻，条子就该跟着藏/回来。
  let maximized = false;
  const h = harness({ systemHidden: () => maximized });
  h.dock.ensure();
  h.dock.place();
  assert.equal(h.window().isVisible(), true, '普通大小：条子显示');
  maximized = true;                       // mainWindow.on('maximize') → place()
  h.dock.place();
  assert.equal(h.window().isVisible(), false, '最大化：条子要为画面让位');
  assert.equal(h.dock.why(), 'system');
  maximized = false;                      // mainWindow.on('unmaximize'|'restore') → place()
  h.dock.place();
  assert.equal(h.window().isVisible(), true, '退出最大化：条子自己回来');
  assert.equal(h.dock.why(), 'shown');
});

test('`systemHidden` 必须用 hidesDock（整屏 **或** 最大化），不能退回只看整屏', () => {
  // 这条是防回归的源码断言：`hidesDock` 是唯一决定"窗口挡住条子了吗"的地方，
  // main.cjs 里换成 `isWindowFullscreen` 就又会漏掉"在窗口里最大化看共享画面"。
  const main = require('node:fs').readFileSync(require.resolve('../main.cjs'), 'utf8');
  assert.match(main, /systemHidden: \(\) => hidesDock\(mainWindow\)/);
  assert.match(main, /const \{ hidesDock \} = require\('\.\/fullscreen\.cjs'\)/);
  // 窗口状态一变就重贴一次：最大化/最小化/还原/整屏进出都要有（少一个就会出现"要等 1.5 秒
  // 心跳才回来"的延迟）。
  for (const event of ['enter-full-screen', 'leave-full-screen', 'maximize', 'unmaximize', 'minimize', 'restore']) {
    assert.ok(main.includes(`'${event}'`), `main.cjs 要监听 ${event}`);
  }
});
