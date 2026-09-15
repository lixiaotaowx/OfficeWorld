// Launch-at-sign-in: a fresh install must come up with the machine, a portable build
// must never register anything, and a locked-down machine must not take the app down.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAutoStart, isPortable, AUTOSTART_ARG } = require('../autostart.cjs');

function fakeApp() {
  const calls = [];
  const state = { openAtLogin: false };
  return {
    calls,
    state,
    setLoginItemSettings(settings) { calls.push(settings); state.openAtLogin = settings.openAtLogin === true; },
    getLoginItemSettings(options) { calls.push({ read: options }); return { openAtLogin: state.openAtLogin }; },
  };
}

test('已安装版本：默认登记开机自启，并带上 --autostart 参数', () => {
  const app = fakeApp();
  const auto = createAutoStart({ app, platform: 'win32', environment: {},
    execPath: 'C:\\Apps\\iruler dream\\iruler dream.exe' });
  assert.equal(auto.supported(), true);
  assert.equal(auto.enabled(), false);
  assert.equal(auto.ensure(), true);
  const written = app.calls.find(call => call.openAtLogin !== undefined);
  assert.equal(written.openAtLogin, true);
  assert.equal(written.path, 'C:\\Apps\\iruler dream\\iruler dream.exe');
  assert.deepEqual(written.args, [AUTOSTART_ARG], '登录启动要靠这个参数才知道该静默进托盘');
  assert.equal(auto.enabled(), true, '必须如实回报登记后的真实状态');
});

test('便携版绝不登记自启：可执行文件每次都在新的临时目录', () => {
  const app = fakeApp();
  const auto = createAutoStart({ app, platform: 'win32',
    environment: { PORTABLE_EXECUTABLE_DIR: 'C:\\Temp\\abc' },
    execPath: 'C:\\Temp\\abc\\iruler dream.exe' });
  assert.equal(auto.supported(), false);
  assert.equal(auto.ensure(), false);
  assert.equal(auto.set(true), false);
  assert.equal(auto.enabled(), false);
  assert.equal(app.calls.length, 0, '便携版不允许碰登录项');
  assert.equal(isPortable({ PORTABLE_EXECUTABLE_DIR: 'x' }), true);
  assert.equal(isPortable({}), false);
});

test('托盘里可以关掉，并且回报最终状态而不是请求的状态', () => {
  const app = fakeApp();
  const auto = createAutoStart({ app, platform: 'win32', environment: {}, execPath: 'x.exe' });
  assert.equal(auto.ensure(), true);
  assert.equal(auto.set(false), true);
  assert.equal(auto.enabled(), false);
  const last = app.calls.filter(call => call.openAtLogin !== undefined).at(-1);
  assert.equal(last.openAtLogin, false);
});

test('非 Windows 与被策略锁死时都返回 false，绝不抛异常', () => {
  const mac = createAutoStart({ app: fakeApp(), platform: 'darwin', environment: {} });
  assert.equal(mac.supported(), false);
  assert.equal(mac.ensure(), false);

  const locked = {
    setLoginItemSettings() { throw Error('denied by policy'); },
    getLoginItemSettings() { throw Error('denied by policy'); },
  };
  const auto = createAutoStart({ app: locked, platform: 'win32', environment: {}, execPath: 'x.exe' });
  assert.equal(auto.ensure(), false);
  assert.equal(auto.set(true), false);
  assert.equal(auto.enabled(), false);
});
