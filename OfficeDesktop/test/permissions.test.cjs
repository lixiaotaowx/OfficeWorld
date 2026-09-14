const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const policy = require('../policy.cjs');

function fixture() {
  const handlers = {};
  const calls = { enumerations: 0, pickers: 0 };
  const source = { id: 'window:1', name: 'Selected window' };
  const frame = {};
  const wc = { mainFrame: frame, isDestroyed: () => false, getURL: () => policy.OFFICE_URL };
  const context = {
    module: { exports: {} },
    require(name) {
      if (name === 'electron') return { desktopCapturer: { getSources: async () => { calls.enumerations++; return [source]; } } };
      if (name === './policy.cjs') return policy;
      if (name === './source-picker.cjs') return { chooseSource: async () => { calls.pickers++; return calls.cancel ? undefined : source; } };
      throw Error('Unexpected dependency: ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../permissions.cjs'), 'utf8'), context);
  context.module.exports.configurePermissions({
    setPermissionCheckHandler(fn) { handlers.check = fn; },
    setPermissionRequestHandler(fn) { handlers.request = fn; },
    setDisplayMediaRequestHandler(fn) { handlers.display = fn; },
  }, () => ({ webContents: wc }));
  return { handlers, calls, source, frame, wc };
}

test('microphone authorization requires no dialog or desktop enumeration', () => {
  const { handlers, wc, calls } = fixture();
  let granted;
  handlers.request(wc, 'media', result => { granted = result; }, {
    requestingUrl: policy.OFFICE_URL, isMainFrame: true, mediaTypes: ['audio'],
  });
  assert.equal(granted, true);
  assert.equal(calls.enumerations, 0);
  assert.equal(calls.pickers, 0);
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

test('empty media types allow display request to reach picker but do not grant camera', () => {
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

test('sharing grants exactly the selected window, with no bundled microphone/system sound', async () => {
  const { handlers, frame, source } = fixture();
  let granted;
  await handlers.display({ frame, securityOrigin: policy.OFFICE_URL, userGesture: true, videoRequested: true }, result => { granted = result; });
  assert.equal(granted.video, source);
  assert.equal(granted.audio, undefined);
});

test('cancel and missing user gesture cannot start screen capture', async () => {
  const { handlers, frame, calls } = fixture();
  const request = { frame, securityOrigin: policy.OFFICE_URL, userGesture: false, videoRequested: true };
  await handlers.display(request, value => assert.equal(value.video, undefined));
  assert.equal(calls.enumerations, 0);
  calls.cancel = true;
  await handlers.display({ ...request, userGesture: true }, value => assert.equal(value.video, undefined));
});

test('system notifications restricted to trusted main window', () => {
  const { handlers, wc } = fixture();
  assert.equal(handlers.check(wc, 'notifications', policy.OFFICE_URL, { isMainFrame: true }), true);
  assert.equal(handlers.check(wc, 'notifications', 'https://example.com', { isMainFrame: true }), false);
  assert.equal(handlers.check(wc, 'notifications', policy.OFFICE_URL, { isMainFrame: false }), false);
  handlers.request(wc, 'notifications', value => assert.equal(value, true), {
    requestingUrl: policy.OFFICE_URL, isMainFrame: true });
});
