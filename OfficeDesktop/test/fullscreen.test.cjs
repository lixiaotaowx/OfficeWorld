// Leaving whole-screen mode must never touch a window that was never put there.
// Chromium answers `setFullScreen(false)` by restoring the window's saved placement, so
// firing it at a window that was never full screen SHRINKS the window — which is what a
// hung-up ordinary call used to do (user, 2026-09-15: "挂断后为啥软件还变小了").
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setWindowFullscreen, isWindowFullscreen } = require('../fullscreen.cjs');

function fakeWindow({ fullscreen = false, maximized = false } = {}) {
  const calls = [];
  const scripts = [];
  const state = { fullscreen };
  return {
    calls,
    scripts,
    isDestroyed: () => false,
    isMaximized: () => maximized,
    isFullScreen: () => state.fullscreen,
    setFullScreen(value) { calls.push(['setFullScreen', value]); state.fullscreen = value; },
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
