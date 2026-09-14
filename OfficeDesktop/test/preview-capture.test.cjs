// The preview capture keeps ONE small stream alive instead of re-capturing every
// display for each frame, which measured 552ms per call in the main process.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function load(overrides = {}) {
  const created = [];
  const scripts = [];
  const permissionHandlers = [];
  class FakeWindow {
    constructor(options) {
      this.options = options;
      this.destroyed = false;
      created.push(this);
      this.webContents = {
        isDestroyed: () => this.destroyed,
        setWindowOpenHandler() {},
        on() {},
        executeJavaScript(script) {
          scripts.push(script);
          if (overrides.script) return Promise.resolve(overrides.script(script));
          if (script.includes('.start(')) return Promise.resolve(overrides.startOk !== false);
          if (script.includes('.frame('))
            return Promise.resolve('frame' in overrides ? overrides.frame : 'data:image/jpeg;base64,AAA');
          return Promise.resolve(true);
        },
      };
    }
    isDestroyed() { return this.destroyed; }
    destroy() { this.destroyed = true; }
    loadFile() { return Promise.resolve(); }
    on() {}
  }
  const session = {
    fromPartition: () => ({
      setPermissionRequestHandler(fn) { permissionHandlers.push(fn); },
    }),
  };
  const context = {
    module: { exports: {} },
    __dirname: require('node:path').join(__dirname, '..'),
    require(name) {
      if (name === 'electron') return { BrowserWindow: FakeWindow, session };
      if (name === 'node:path') return require('node:path');
      throw Error('Unexpected dependency: ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../preview-capture.cjs'), 'utf8'), context);
  return { capture: context.module.exports.createPreviewCapture(overrides.options || {}),
    created, scripts, permissionHandlers };
}

test('取源一次后常驻：同一块屏不重复启动，换屏才重启', async () => {
  const { capture, scripts } = load();
  assert.equal(await capture.start('screen:1'), true);
  const started = scripts.filter((script) => script.includes('.start(')).length;
  assert.equal(started, 1);
  assert.equal(capture.attachedTo(), 'screen:1');
  // Same display: nothing new is asked of the hidden page.
  assert.equal(await capture.start('screen:1'), true);
  assert.equal(scripts.filter((script) => script.includes('.start(')).length, 1);
  // Different display: stop, then start again.
  assert.equal(await capture.start('screen:2'), true);
  assert.equal(scripts.filter((script) => script.includes('.stop(')).length, 1);
  assert.equal(scripts.filter((script) => script.includes('.start(')).length, 2);
  assert.equal(capture.attachedTo(), 'screen:2');
});

test('启动参数带上分辨率与帧率，取帧直接返回图片', async () => {
  const { capture, scripts } = load();
  await capture.start('screen:9');
  const start = scripts.find((script) => script.includes('.start('));
  assert.match(start, /"sourceId":"screen:9"/);
  assert.match(start, /"maxEdge":300/, '最长边必须是 300');
  assert.match(start, /"frameRate":2/, '常驻流保持低帧率');
  assert.match(start, /"quality":55/, '仍是低清 JPEG');
  // The stream itself is configured inside the hidden page from those numbers.
  const preload = fs.readFileSync(require.resolve('../preview-capture-preload.cjs'), 'utf8');
  assert.match(preload, /chromeMediaSource: 'desktop'/);
  assert.match(preload, /maxWidth: settings\.maxEdge/);
  assert.match(preload, /maxHeight: settings\.maxEdge/);
  assert.match(preload, /maxFrameRate: options\.frameRate/);
  assert.equal(await capture.frame(), 'data:image/jpeg;base64,AAA');
  // 没有附着时不应返回图片，调用方会先 start。
  const bare = load();
  assert.equal(await bare.capture.frame(), null);
});

test('启动失败标记为不支持，取帧出错则解绑以便下次重连', async () => {
  const failed = load({ startOk: false });
  await assert.rejects(() => failed.capture.start('screen:1'), /常驻采集启动失败/);
  assert.equal(failed.capture.isSupported(), false);
  await assert.rejects(() => failed.capture.start('screen:1'));

  const flaky = load({ frame: null });
  await flaky.capture.start('screen:1');
  assert.equal(await flaky.capture.frame(), null, '没有新帧时返回 null 而不是抛错');

  const broken = load();
  await broken.capture.start('screen:1');
  broken.capture.window().webContents.executeJavaScript = () => Promise.reject(Error('gone'));
  await assert.rejects(() => broken.capture.frame(), /预览采集中断/);
  assert.equal(broken.capture.attachedTo(), '', '出错后解绑，下一次会重新启动');
});

test('隐藏窗口不可见、禁用 Node，并且只允许它自己申请采集权限', async () => {
  const { capture, created, permissionHandlers } = load();
  await capture.start('screen:1');
  const options = created[0].options;
  assert.equal(options.show, false, '采集窗口不能可见');
  assert.equal(options.webPreferences.contextIsolation, true);
  assert.equal(options.webPreferences.nodeIntegration, false);
  assert.equal(options.webPreferences.sandbox, true);
  assert.equal(options.webPreferences.backgroundThrottling, false, '后台也要持续供帧');
  assert.equal(permissionHandlers.length, 1);
  let granted;
  permissionHandlers[0](created[0].webContents, 'media', (value) => { granted = value; });
  assert.equal(granted, true, '隐藏页自己的媒体权限要放行');
  permissionHandlers[0]({}, 'media', (value) => { granted = value; });
  assert.equal(granted, false, '其它来源一律拒绝');
  permissionHandlers[0](created[0].webContents, 'notifications', (value) => { granted = value; });
  assert.equal(granted, false, '只放行媒体采集');
});
