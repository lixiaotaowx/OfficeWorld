const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const policy = require('../policy.cjs');

function fixture() {
  const handlers = {};
  const calls = { enumerations: 0, resolvings: 0 };
  const source = { id: 'screen:2', display_id: '2', name: 'Selected display' };
  const frame = {};
  const wc = { mainFrame: frame, isDestroyed: () => false, getURL: () => policy.OFFICE_URL };
  const context = {
    module: { exports: {} },
    require(name) {
      if (name === 'electron') return { desktopCapturer: { getSources: async () => { calls.enumerations++; return [source]; } }, screen: {} };
      if (name === './policy.cjs') return policy;
      if (name === './dock-capture-intent.cjs') return require('../dock-capture-intent.cjs');
      throw Error('Unexpected dependency: ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../permissions.cjs'), 'utf8'), context);
  // Sharing resolves the display the workstation preview already uses; no picker.
  const displays = { source: async () => { calls.resolvings++; return calls.noDisplay ? undefined : source; } };
  context.module.exports.configurePermissions({
    setPermissionCheckHandler(fn) { handlers.check = fn; },
    setPermissionRequestHandler(fn) { handlers.request = fn; },
    setDisplayMediaRequestHandler(fn) { handlers.display = fn; },
  }, () => ({ webContents: wc }), { displays });
  return { handlers, calls, source, frame, wc };
}

test('trusted dock share authorizes only one main-frame capture without a page gesture', async () => {
  const { handlers, frame, wc, source } = fixture();
  require('../dock-capture-intent.cjs').grantDockCapture(wc);
  const request = { frame, securityOrigin: policy.OFFICE_URL, userGesture: false, videoRequested: true };
  await handlers.display({ ...request, frame: {} }, value => assert.equal(value.video, undefined));
  await handlers.display({ ...request, securityOrigin: 'https://example.com' }, value => assert.equal(value.video, undefined));
  await handlers.display(request, value => assert.equal(value.video, source));
  await handlers.display(request, value => assert.equal(value.video, undefined));
});

test('microphone authorization requires no dialog or desktop enumeration', () => {
  const { handlers, wc, calls } = fixture();
  let granted;
  handlers.request(wc, 'media', result => { granted = result; }, {
    requestingUrl: policy.OFFICE_URL, isMainFrame: true, mediaTypes: ['audio'],
  });
  assert.equal(granted, true);
  assert.equal(calls.enumerations, 0);
  assert.equal(calls.resolvings, 0);
});

test('camera, foreign origin and child frames cannot inherit audio authorization', () => {
  const { handlers, wc } = fixture();
  for (const changes of [{ mediaTypes: ['video'] }, { mediaTypes: ['audio', 'video'] },
    { requestingUrl: 'https://example.com' }, { isMainFrame: false }]) {
    handlers.request(wc, 'media', value => assert.equal(value, false), {
      requestingUrl: policy.OFFICE_URL, isMainFrame: true, mediaTypes: ['audio'], ...changes,
    });
  }
});

test('microphone checks authorize only the first-party audio device', () => {
  const { handlers, wc } = fixture();
  assert.equal(handlers.check(wc, 'media', policy.OFFICE_URL, { mediaType: 'audio', isMainFrame: true }), true);
  assert.equal(handlers.check(wc, 'media', policy.OFFICE_URL, { mediaType: 'video', isMainFrame: true }), false);
  assert.equal(handlers.check(wc, 'media', 'https://example.com', { mediaType: 'audio', isMainFrame: true }), false);
});

test('Electron empty-origin main-frame checks use verified embedding origin', () => {
  const { handlers, wc } = fixture();
  assert.equal(handlers.check(wc, 'media', '', { mediaType: 'audio', isMainFrame: true,
    embeddingOrigin: policy.OFFICE_URL }), true);
  assert.equal(handlers.check(wc, 'media', '', { mediaType: 'video', isMainFrame: true,
    embeddingOrigin: policy.OFFICE_URL }), false);
  assert.equal(handlers.check(wc, 'media', '', { mediaType: 'audio', isMainFrame: false,
    embeddingOrigin: policy.OFFICE_URL }), false);
});

test('empty media types let the display request reach the capture handler without granting camera', () => {
  const { handlers, wc } = fixture();
  for (const types of [[], ['video'], ['audio', 'video'], undefined]) {
    handlers.request(wc, 'media', value => assert.equal(value, Array.isArray(types) && types.length === 0), {
      requestingUrl: policy.OFFICE_URL, isMainFrame: true, mediaTypes: types,
    });
  }
  handlers.request(wc, 'media', value => assert.equal(value, false), {
    requestingUrl: 'https://example.com', isMainFrame: true, mediaTypes: [],
  });
});

test('sharing grants exactly the preview display, with no bundled microphone or system sound', async () => {
  const { handlers, frame, source, calls } = fixture();
  let granted;
  await handlers.display({ frame, securityOrigin: policy.OFFICE_URL, userGesture: true, videoRequested: true }, result => { granted = result; });
  assert.equal(granted.video, source, '必须直接给已选显示器，不能弹选择窗');
  assert.equal(granted.audio, undefined);
  assert.equal(calls.resolvings, 1, '显示器只解析一次，没有第二次交互');
});

test('screen audio is loopback only when requested by an authorized main frame', async () => {
  const { handlers, frame, source } = fixture();
  const request = { frame, securityOrigin: policy.OFFICE_URL, userGesture: true,
    videoRequested: true, audioRequested: true };
  await handlers.display(request, value => {
    assert.equal(value.video, source);
    assert.equal(value.audio, 'loopbackWithoutChrome');
  });
  for (const changes of [{ frame: {} }, { securityOrigin: 'https://example.com' }, { userGesture: false }]) {
    await handlers.display({ ...request, ...changes }, value => assert.equal(value.audio, undefined));
  }
});

test('缺少用户手势或没有可用显示器时都不能开始采集', async () => {
  const { handlers, frame, calls } = fixture();
  calls.noDisplay = true;
  await handlers.display({ frame, securityOrigin: policy.OFFICE_URL, userGesture: false, videoRequested: true },
    value => assert.equal(value.video, undefined));
  await handlers.display({ frame, securityOrigin: policy.OFFICE_URL, userGesture: true, videoRequested: true },
    value => assert.equal(value.video, undefined));
  assert.equal(calls.noDisplay, true);
  // 非主框架、非可信来源同样拒绝。
  await handlers.display({ frame: {}, securityOrigin: policy.OFFICE_URL, userGesture: true, videoRequested: true },
    value => assert.equal(value.video, undefined));
  await handlers.display({ frame, securityOrigin: 'https://example.com', userGesture: true, videoRequested: true },
    value => assert.equal(value.video, undefined));
});

test('system notifications restricted to trusted main window', () => {
  const { handlers, wc } = fixture();
  assert.equal(handlers.check(wc, 'notifications', policy.OFFICE_URL, { isMainFrame: true }), true);
  assert.equal(handlers.check(wc, 'notifications', 'https://example.com', { isMainFrame: true }), false);
  assert.equal(handlers.check(wc, 'notifications', policy.OFFICE_URL, { isMainFrame: false }), false);
  handlers.request(wc, 'notifications', value => assert.equal(value, true), {
    requestingUrl: policy.OFFICE_URL, isMainFrame: true });
});
