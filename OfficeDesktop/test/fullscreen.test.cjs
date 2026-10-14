// Leaving whole-screen mode must never touch a window that was never put there.
// Chromium answers `setFullScreen(false)` by restoring the window's saved placement, so
// firing it at a window that was never full screen SHRINKS the window — which is what a
// hung-up ordinary call used to do (user, 2026-09-15: "挂断后为啥软件还变小了").
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setWindowFullscreen, isWindowFullscreen, hidesDock } = require('../fullscreen.cjs');

function fakeWindow({ fullscreen = false, maximized = false } = {}) {
  const calls = [];
  const scripts = [];
  const state = { fullscreen, maximized };
  return {
    calls,
    scripts,
    isDestroyed: () => false,
    // 跟着 maximize() 真的变：退出整屏要还原成"最大化着看"那一屏，这里得能观察出来。
    isMaximized: () => state.maximized,
    isFullScreen: () => state.fullscreen,
    setFullScreen(value) { calls.push(['setFullScreen', value]); state.fullscreen = value; },
    maximize() { calls.push(['maximize']); state.maximized = true; },
    webContents: {
      isDestroyed: () => false,
      executeJavaScript: (script) => { scripts.push(script); return Promise.resolve(); },
      send: (channel, payload) => calls.push([channel, payload]),
    },
  };
}

const fullscreenCalls = win => win.calls.filter(call => call[0] === 'setFullScreen');

test('从未进入全屏的窗口：退出请求必须被忽略，绝不碰窗口', () => {
  const win = fakeWindow();
  assert.equal(setWindowFullscreen(win, false), false);
  assert.deepEqual(fullscreenCalls(win), [],
    '没进过全屏就不许调 setFullScreen(false)——那会让窗口缩回旧的摆放位置');
});

test('进入后再退出：两次都要真的作用到窗口上', () => {
  const win = fakeWindow();
  assert.equal(setWindowFullscreen(win, true), true);
  assert.deepEqual(fullscreenCalls(win), [['setFullScreen', true]]);
  assert.equal(setWindowFullscreen(win, false), false);
  assert.deepEqual(fullscreenCalls(win), [['setFullScreen', true], ['setFullScreen', false]]);
});

test('重复退出不会第二次碰窗口（幂等）', () => {
  const win = fakeWindow();
  setWindowFullscreen(win, true);
  setWindowFullscreen(win, false);
  setWindowFullscreen(win, false);
  setWindowFullscreen(win, false);
  assert.deepEqual(fullscreenCalls(win), [['setFullScreen', true], ['setFullScreen', false]]);
});

test('窗口自己报着全屏（F11 等其它来源）：仍然要能退出', () => {
  const win = fakeWindow({ fullscreen: true });
  assert.equal(setWindowFullscreen(win, false), false);
  assert.deepEqual(fullscreenCalls(win), [['setFullScreen', false]]);
});

test('被忽略的退出请求仍要通知页面与渲染进程，而不是静默', () => {
  const win = fakeWindow();
  setWindowFullscreen(win, false);
  assert.ok(win.scripts.some(script => script.includes("'iruler-fullscreen', false")),
    '页面要被告知已经不在全屏');
  assert.ok(win.calls.some(call => call[0] === 'office:fullscreen-changed' && call[1] === false),
    '渲染进程也要收到状态通知');
});

test('"算不算整屏"不能只看 isFullScreen()：自己请求过的也算（用户 2026-09-22「头像会消失找不到」）', () => {
  // 真机实测：页面调 setFullscreen(true) 之后页面类加上了、窗口也铺满了屏幕，但
  // `isFullScreen()` 在这个无边框透明窗口上**仍然返回 false**。头像条"整屏时藏起来"如果只看它，
  // 就永远不藏；反过来只看事件，事件不来时又会永久藏着。
  const lying = fakeWindow();
  lying.isFullScreen = () => false;          // 就是这台机器上的真实表现
  assert.equal(isWindowFullscreen(lying), false, '没进过整屏就是 false');
  setWindowFullscreen(lying, true);
  assert.equal(isWindowFullscreen(lying), true, '自己请求过整屏 → 必须是 true（哪怕 isFullScreen 撒谎）');
  setWindowFullscreen(lying, false);
  assert.equal(isWindowFullscreen(lying), false, '退出整屏后要立刻恢复 false');
  // 外面进的整屏（F11/系统）也要认。
  const external = fakeWindow({ fullscreen: true });
  assert.equal(isWindowFullscreen(external), true);
  assert.equal(isWindowFullscreen(undefined), false);
  assert.equal(isWindowFullscreen({ isDestroyed: () => true }), false, '销毁的窗口不算');
});

test('头像条该不该藏：整屏与最大化都藏，最小化照旧出现（用户 2026-10-14）', () => {
  // 用户原话：「当状态栏小窗口出现视频共享画面时，点击最大化，这个小窗口会消失；当最小化时，
  // 这个小窗口就会出现。这就是这种常见的逻辑」。旧判断只看原生整屏，所以在软件窗口里最大化
  // 看共享画面时条子不藏（它正好压在画面右下角上）。
  assert.equal(hidesDock(fakeWindow()), false, '普通大小：条子要出现');
  assert.equal(hidesDock(fakeWindow({ maximized: true })), true, '最大化：条子让位（这次新加的）');
  assert.equal(hidesDock(fakeWindow({ fullscreen: true })), true, '整屏：条子让位（原来就有）');
  // **最小化绝不算**：窗口是普通的（既没整屏也没最大化），屏幕上没有画面要遮，条子要留着。
  // 千万别把这条改成"只要窗口不是普通大小就藏"——最小化也会被算进去，条子会跟着窗口一起消失。
  assert.equal(hidesDock(fakeWindow({ minimized: true })), false, '最小化：条子要出现');
  const lying = fakeWindow();
  lying.isFullScreen = () => false;
  setWindowFullscreen(lying, true);
  assert.equal(hidesDock(lying), true, '自己请求过整屏的窗口也要藏（哪怕 isFullScreen 撒谎）');
  setWindowFullscreen(lying, false);
  assert.equal(hidesDock(lying), false, '退出整屏立刻恢复显示');
  assert.equal(hidesDock(undefined), false);
  assert.equal(hidesDock({ isDestroyed: () => true }), false, '销毁的窗口不算');
});

test('最大化着进整屏、退出来还要是最大化（别把窗口缩回旧摆放）', () => {
  // `setFullScreen(false)` 让 Windows 恢复"上一次的摆放"，对无边框透明窗口来说那一位常常是
  // 普通大小 —— 一个最大化着看视频的人，退出整屏后不该得到一个缩小过的窗口。
  const win = fakeWindow({ maximized: true });
  setWindowFullscreen(win, true);
  assert.deepEqual(win.calls.filter(call => call[0] === 'setFullScreen'), [['setFullScreen', true]]);
  setWindowFullscreen(win, false);
  assert.ok(win.calls.some(call => call[0] === 'maximize'), '退出整屏要把最大化还原回来');
  assert.equal(win.isMaximized(), true);
  // 本来就是普通大小进来的：退出时**不许**顺手把它最大化（那就成了另一个 bug）。
  const plain = fakeWindow();
  setWindowFullscreen(plain, true);
  setWindowFullscreen(plain, false);
  assert.equal(plain.calls.some(call => call[0] === 'maximize'), false, '普通大小不该被最大化');
  assert.equal(plain.isMaximized(), false);
});
