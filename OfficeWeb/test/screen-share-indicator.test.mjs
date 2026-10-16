import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { loadMedia } from './media-test-loader.mjs';

class VideoTrack extends EventTarget {
  kind = 'video'; readyState = 'live';
  clone() { return new VideoTrack(); }
  stop() { this.readyState = 'ended'; } // 真实 stop() 不发 ended
  end() { this.stop(); this.dispatchEvent(new Event('ended')); }
}
const stream = track => ({ active: true, getTracks: () => [track], getVideoTracks: () => [track], getAudioTracks: () => [] });
const wrap = mediaStreamTrack => ({ mediaStreamTrack, stop() { this.mediaStreamTrack.stop(); },
  async replaceTrack(next) { this.mediaStreamTrack = next; } });

function fixture({ desktop = true } = {}) {
  const sent = [], timers = new Set();
  let chosen = 'left', readSource = async () => chosen;
  const exports = {};
  const source = readFileSync(new URL('../src/screenShareIndicator.ts', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  vm.runInNewContext(code, { exports,
    window: desktop ? { officeDesktop: { screenShareIndicator: {
      source: () => readSource(), show: async ids => { sent.push(Array.from(ids)); return true; },
    } } } : {},
    setInterval: callback => { timers.add(callback); return callback; },
    clearInterval: callback => timers.delete(callback),
  });
  return { api: exports, sent, timers,
    tick() { [...timers].forEach(callback => callback()); },
    choose(id) { chosen = id; }, failSource() { readSource = async () => { throw Error('IPC failed'); }; },
    async capture(track = new VideoTrack()) {
      await exports.captureScreen(async () => stream(track), value => value.getTracks());
      return track;
    },
  };
}

function room(name = 'private-1') {
  const publications = new Map();
  return { name, state: 'connected', publications,
    localParticipant: {
      getTrackPublication: source => publications.get(source),
      publishTrack: async (track, options) => publications.set(options.source,
        { track: track.mediaStreamTrack ? track : wrap(track) }),
      unpublishTrack: async track => {
        track.stop();
        for (const [key, publication] of publications) if (publication.track === track) publications.delete(key);
      },
    },
  };
}

test('捕获不亮框；发布后只框这条轨的真实来源，后改选项不改变它', async () => {
  const f = fixture(), video = await f.capture();
  assert.deepEqual(f.sent, []);
  f.choose('right');
  f.api.showSharedScreen(video);
  assert.deepEqual(f.sent, [['left']]);
  f.tick(); f.tick();
  assert.equal(f.sent.length, 1, '不轮询 IPC、不反复重建窗口');
  video.end();
  assert.deepEqual(f.sent.at(-1), []);
  assert.equal(f.timers.size, 0);
});

test('克隆保留来源；私聊与会议共用屏幕时一方停止不能错误消框', async () => {
  const f = fixture(), original = await f.capture();
  const a = f.api.cloneScreenTrack(original), b = f.api.cloneScreenTrack(original);
  f.api.showSharedScreen(a); f.api.showSharedScreen(b);
  original.stop(); a.stop(); f.tick();
  assert.deepEqual(f.sent, [['left']]);
  assert.equal(f.timers.size, 1);
  b.stop(); f.tick();
  assert.deepEqual(f.sent.at(-1), []);
  assert.equal(f.timers.size, 0, 'SDK stop() 也能清理，不依赖 ended 事件');
});

test('并发采集不串来源；取消与来源 IPC 失败均不遗留轨或绿框', async () => {
  const f = fixture();
  let resolve;
  const first = f.api.captureScreen(() => new Promise(done => { resolve = done; }), value => value.getTracks());
  await assert.rejects(f.capture(), /正在选择共享屏幕/);
  const video = new VideoTrack();
  resolve(stream(video)); await first;
  f.api.showSharedScreen(video); video.end();
  await assert.rejects(f.api.captureScreen(async () => { throw Error('cancel'); }, () => []), /cancel/);
  const audio = new VideoTrack(); audio.kind = 'audio';
  const next = new VideoTrack();
  f.failSource();
  await assert.rejects(f.api.captureScreen(async () => [next, audio], value => value), /IPC failed/);
  assert.equal(next.readyState, 'ended'); assert.equal(audio.readyState, 'ended');
  assert.deepEqual(f.sent.at(-1), []);
});

test('浏览器/旧客户端沿用原生系统提示，不阻断共享也不创建计时器', async () => {
  const f = fixture({ desktop: false }), video = await f.capture();
  f.api.showSharedScreen(video);
  assert.equal(video.readyState, 'live');
  assert.deepEqual(f.sent, []); assert.equal(f.timers.size, 0);
});

test('真实私聊发布/换屏/取消发布链路；换轨失败保持原屏绿框', async () => {
  const f = fixture();
  const overrides = { './screenShareIndicator': f.api,
    './screenPermission': { waitForScreenPermission: async () => {} } };
  const { publishPrivateScreen, unpublishScreen } = loadMedia('screenAudio', overrides);
  const { switchLiveScreen } = loadMedia('screenSwitch', overrides);
  const r = room();
  let live = stream(await f.capture());
  await publishPrivateScreen(r, live, () => true, () => {});
  assert.deepEqual(f.sent.at(-1), ['left']);
  const oldPublication = r.publications.get('screen_share').track;
  oldPublication.replaceTrack = async () => { throw Error('cannot replace'); };
  f.choose('right');
  const host = { live: () => live, owner: value => live === value,
    adopt: value => { live = value; }, publishers: () => [r] };
  assert.equal(await switchLiveScreen(host, async () => stream(await f.capture())), false);
  f.tick();
  assert.deepEqual(f.sent.at(-1), ['left'], '采集了右屏不代表对方已经收到右屏');
  oldPublication.replaceTrack = async function(next) { this.mediaStreamTrack = next; };
  assert.equal(await switchLiveScreen(host, async () => stream(await f.capture())), true);
  f.tick();
  assert.deepEqual(f.sent.at(-1), ['right']);
  await unpublishScreen(r);
  assert.deepEqual(f.sent.at(-1), []);
  assert.equal(f.timers.size, 0);
});

test('部分私聊换屏成功时，两块仍有发布的屏幕都提示，最后挂断才都消失', async () => {
  const f = fixture();
  const overrides = { './screenShareIndicator': f.api,
    './screenPermission': { waitForScreenPermission: async () => {} } };
  const { publishPrivateScreen, unpublishScreen } = loadMedia('screenAudio', overrides);
  const { switchLiveScreen } = loadMedia('screenSwitch', overrides);
  const a = room('a'), b = room('b');
  let live = stream(await f.capture());
  await publishPrivateScreen(a, live, () => true, () => {});
  await publishPrivateScreen(b, live, () => true, () => {});
  b.publications.get('screen_share').track.replaceTrack = async () => { throw Error('failed'); };
  f.choose('right');
  await switchLiveScreen({ live: () => live, owner: value => value === live,
    adopt: value => { live = value; }, publishers: () => [a, b] }, async () => stream(await f.capture()));
  f.tick(); assert.deepEqual(f.sent.at(-1), ['left', 'right']);
  await unpublishScreen(b); assert.deepEqual(f.sent.at(-1), ['right']);
  await unpublishScreen(a); assert.deepEqual(f.sent.at(-1), []);
});

test('会议发布、换屏与被替换停止共用实际视频轨状态；失败发布不留框', async () => {
  const f = fixture();
  const { MeetingScreenShare } = loadMedia('meetingScreenShare', { './screenShareIndicator': f.api,
    './screenPermission': { waitForScreenPermission: async () => {} } });
  const r = room('meeting');
  r.localParticipant.createScreenTracks = async () => [wrap(new VideoTrack())];
  const socket = { on() {}, off() {}, connected: true, timeout() { return this; },
    emitWithAck: async () => ({ ok: true }) };
  const rooms = { get: () => r, run: async (_name, action) => action(r, () => true) };
  const share = new MeetingScreenShare(socket, rooms, () => 'meeting', () => {});
  await share.start('meeting'); assert.deepEqual(f.sent.at(-1), ['left']);
  f.choose('right'); await share.switchDisplay(); f.tick();
  assert.equal(r.publications.get('screen_share').track.mediaStreamTrack.readyState, 'live',
    'SDK 的已发布包装器随 replaceTrack 改变引用，旧采集清理不能停掉新发布');
  assert.deepEqual(f.sent.at(-1), ['right']);
  const capture = share.captures.get('meeting');
  share.replaced({ room: 'meeting', lease: capture.lease });
  await new Promise(resolve => setImmediate(resolve)); f.tick();
  assert.deepEqual(f.sent.at(-1), []); assert.equal(f.timers.size, 0);
  r.localParticipant.publishTrack = async () => { throw Error('publish failed'); };
  await assert.rejects(share.start('meeting'), /publish failed/);
  assert.deepEqual(f.sent.at(-1), []);
  share.dispose();
});
