const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { EventEmitter } = require('node:events');
const policy = require('../policy.cjs');

function fixture() {
  const handlers = {}, files = new Map(), calls = [];
  const frame = { url: policy.OFFICE_URL }, wc = { mainFrame: frame };
  const event = { sender: wc, senderFrame: frame };
  const state = { displays: ['11', '22'], encrypted: true };
  const thumbnail = id => ({
    isEmpty: () => false, getSize: () => ({ width: 1920, height: 1080 }),
    resize: size => ({ toJPEG: quality => {
      calls.push({ id, size, quality }); return Buffer.from(id);
    } }),
  });
  const electron = {
    app: { getPath: () => 'test-profile' },
    ipcMain: { handle: (name, fn) => { handlers[name] = fn; } },
    screen: { getAllDisplays: () => state.displays.map(id => ({ id, size: { width: 1920, height: 1080 } })),
      getPrimaryDisplay: () => ({ id: '11' }) },
    desktopCapturer: { getSources: async options => {
      assert.deepEqual(Array.from(options.types), ['screen']);
      assert.equal(options.thumbnailSize.width, 480);
      return state.displays.map(id => ({ id: 'screen:' + id, display_id: id, thumbnail: thumbnail(id) }));
    } },
    safeStorage: {
      isEncryptionAvailable: () => state.encrypted,
      encryptString: value => 'encrypted:' + value,
      decryptString: value => value.slice(10),
    },
  };
  const context = { module: { exports: {} }, require(name) {
    if (name === 'electron') return electron;
    if (name === './policy.cjs') return policy;
    if (name === 'node:path') return require(name);
    if (name === 'node:fs') return {
      readFileSync: file => { if (!files.has(file)) throw Error('Missing'); return files.get(file); },
      writeFileSync: (file, value) => files.set(file, value), rmSync: file => files.delete(file),
    };
    throw Error(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../desktop-bridge.cjs'), 'utf8'), context);
  context.module.exports.installDesktopBridge(() => ({ webContents: wc }));
  return { call: (name, ...args) => handlers['office:' + name](event, ...args),
    event, state, files, calls, handlers, wc };
}

test('自动低清只枚举屏幕、维持比例，双屏切换与断开回退', async () => {
  const f = fixture();
  assert.equal((await f.call('displays')).length, 2);
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '11');
  assert.equal(f.calls.at(-1).size.width, 480);
  assert.equal(f.calls.at(-1).size.height, 270);
  await f.call('display-select', '22');
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '22');
  f.state.displays = ['11'];
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '11');
  await assert.rejects(f.call('display-select', 'missing'));
});

test('仅可信主窗口调用；登录信息加密保存、删除，不可加密时不落盘', async () => {
  const f = fixture();
  assert.throws(() => f.handlers['office:login-read']({ sender: f.wc, senderFrame: { url: policy.OFFICE_URL } }));
  f.event.senderFrame.url = 'https://example.com';
  assert.throws(() => f.call('preview-frame'));
  f.event.senderFrame.url = policy.OFFICE_URL;
  assert.equal(f.call('login-save', { name: '测试', password: '1' }), true);
  assert.ok([...f.files.values()].every(value => value.startsWith('encrypted:')));
  assert.equal(f.call('login-read').password, '1');
  f.call('login-clear');
  assert.equal(f.call('login-read'), null);
  f.state.encrypted = false;
  assert.equal(f.call('login-save', { name: '测试', password: '1' }), false);
  assert.equal(f.files.size, 0);
});

test('网络错误页的finish不取消重试，恢复成功/关窗清理计时', () => {
  const timers = new Map(); let sequence = 0;
  const context = { module: { exports: {} }, require: () => policy,
    setTimeout: (fn, ms) => { timers.set(++sequence, { fn, ms }); return sequence; },
    clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(fs.readFileSync(require.resolve('../reconnect.cjs'), 'utf8'), context);
  const win = new EventEmitter(), wc = new EventEmitter();
  win.webContents = wc; win.setTitle = () => {}; win.isDestroyed = () => false;
  let loaded = 0; wc.loadURL = async () => { loaded++; };
  context.module.exports.reconnect(win);
  wc.emit('did-fail-load', {}, -105, 'DNS', policy.OFFICE_URL, true);
  wc.emit('did-finish-load');
  assert.equal(timers.size, 1);
  assert.equal([...timers.values()][0].ms, 5000);
  [...timers.values()][0].fn();
  assert.equal(loaded, 1);
  wc.emit('did-start-navigation', {}, policy.OFFICE_URL, false, true);
  wc.emit('did-finish-load');
  assert.equal(timers.size, 0);
  wc.emit('did-navigate', {}, policy.OFFICE_URL, 503);
  assert.equal(timers.size, 1);
  win.emit('closed');
  assert.equal(timers.size, 0);
});
