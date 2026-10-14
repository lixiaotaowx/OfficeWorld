// 会议里换屏：把已经发布的共享轨原地换掉，而不是停掉重开（参会者不该断线）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

import { loadMedia } from './media-test-loader.mjs';
const { MeetingScreenShare } = loadMedia('meetingScreenShare', {
  './screenSwitch': { swapScreenTrack: (room, next) => globalThis.__swap(room, next) },
});
const { screenAudioConstraints } = loadMedia('screenAudio');
const track = (name, kind = 'video') => ({ name, kind, readyState: 'live', stopped: false,
  clone() { return track(name, kind); }, addEventListener() {}, stop() { this.stopped = true; } });
const wrapper = underlying => ({ mediaStreamTrack: underlying, stop() { underlying.stopped = true; } });

function fixture({ state = 'connected', createScreenTracks, existing = true } = {}) {
  const calls = { captures: [], swaps: [], audio: [], swapsResult: true };
  globalThis.__swap = (room, next) => { calls.swaps.push({ room, next }); return calls.swapsResult; };
  const room = {
    name: 'meeting-1',
    state,
    localParticipant: {
      publishTrack: async (t, options) => calls.audio.push({ t, options }),
      createScreenTracks: async options => {
        calls.captures.push(options);
        return createScreenTracks ? createScreenTracks() : [wrapper(track('next'))];
      },
      getTrackPublication: source => existing && source === 'screen_share' ? { track: { mediaStreamTrack: track('published') } } : undefined,
    },
  };
  const socket = { on() {}, off() {}, emitWithAck: async () => ({ ok: true }) };
  const rooms = { get: () => room, run: async (_name, run) => run(room, () => true) };
  const share = new MeetingScreenShare(socket, rooms, () => 'meeting-1', () => {});
  const published = track('published');
  share.captures.set('meeting-1', { lease: 'lease-1', tracks: [published], cancelled: false });
  return { share, room, calls, published };
}

test('会议共享换屏：按同一套参数重新采集，并原地换轨', async () => {
  const f = fixture();
  assert.equal(await f.share.switchDisplay(), true);
  assert.deepEqual(f.calls.captures, [{ audio: screenAudioConstraints,
    resolution: { width: 1920, height: 1080, frameRate: 15 }, contentHint: 'text' }],
    '换屏要跟开始共享用同一套采集参数（含文字提示）');
  assert.equal(f.calls.swaps.length, 1);
  assert.equal(f.calls.swaps[0].room, f.room);
  assert.equal(f.calls.swaps[0].next.name, 'next');
});

test('换轨失败时收掉刚采集的轨，不让它挂着', async () => {
  const fresh = track('next');
  const f = fixture({ createScreenTracks: () => [wrapper(fresh)] });
  f.calls.swapsResult = false;
  assert.equal(await f.share.switchDisplay(), false);
  assert.equal(fresh.stopped, true);
});

test('换屏保留并发布新的共享声音，原始采集保持到结束', async () => {
  const extra = track('audio', 'audio');
  const video = track('next');
  const f = fixture({ createScreenTracks: () => [wrapper(video), wrapper(extra)] });
  assert.equal(await f.share.switchDisplay(), true);
  assert.equal(extra.stopped, false);
  assert.equal(f.calls.audio[0].options.source, 'screen_share_audio');
  assert.notEqual(f.calls.audio[0].t, extra);
  assert.equal(video.stopped, false, '已经交给发布轨的采集不能再停，否则共享立刻断');
});

test('媒体没连上、或这次共享已经取消：跳过，不算切换成功', async () => {
  const offline = fixture({ state: 'disconnected' });
  assert.equal(await offline.share.switchDisplay(), false);
  assert.equal(offline.calls.captures.length, 0, '没连上就别去采集');

  const cancelled = fixture();
  cancelled.share.captures.get('meeting-1').cancelled = true;
  assert.equal(await cancelled.share.switchDisplay(), false);
  assert.equal(cancelled.calls.captures.length, 0);
});

test('压根没在共享：什么都不采集', async () => {
  const f = fixture();
  f.share.captures.clear();
  assert.equal(await f.share.switchDisplay(), false);
  assert.equal(f.calls.captures.length, 0);
});

test('共享在选屏期间停止时，新画面和新声音全部释放', async () => {
  let resolve;
  const pending = new Promise(r => { resolve = r; });
  const f = fixture({ createScreenTracks: () => pending });
  const switching = f.share.switchDisplay();
  f.share.captures.get('meeting-1').cancelled = true;
  const video = track('next'), audio = track('sound', 'audio');
  resolve([wrapper(video), wrapper(audio)]);
  assert.equal(await switching, false);
  assert.equal(video.stopped, true);
  assert.equal(audio.stopped, true);
  assert.equal(f.calls.swaps.length, 0);
  assert.equal(f.calls.audio.length, 0);
});
