// 会议里换屏：把已经发布的共享轨原地换掉，而不是停掉重开（参会者不该断线）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const stub = code => 'data:text/javascript,' + encodeURIComponent(code);
const compiled = ts.transpileModule(
  readFileSync(new URL('../src/meetingScreenShare.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } },
).outputText
  .replace(/['"]livekit-client['"]/, JSON.stringify(stub(
    'export const Track = { Source: { ScreenShare: "screen_share" } };')))
  .replace(/['"]\.\/screenSwitch['"]/, JSON.stringify(stub(
    'export async function swapScreenTrack(room, next) { return globalThis.__swap(room, next); }')))
  .replace(/['"]\.\/screenPermission['"]/, JSON.stringify(stub(
    'export async function waitForScreenPermission() {}')));
const { MeetingScreenShare } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const track = name => ({ name, stopped: false, stop() { this.stopped = true; } });
/** 像 createScreenTracks 那样，包装一层：停包装 = 停底下的采集。 */
const wrapper = underlying => ({ mediaStreamTrack: underlying, stop() { underlying.stopped = true; } });

function fixture({ state = 'connected', createScreenTracks, existing = true } = {}) {
  const calls = { captures: [], swaps: [], swapsResult: true };
  globalThis.__swap = (room, next) => { calls.swaps.push({ room, next }); return calls.swapsResult; };
  const room = {
    name: 'meeting-1',
    state,
    localParticipant: {
      createScreenTracks: async options => {
        calls.captures.push(options);
        return createScreenTracks ? createScreenTracks() : [wrapper(track('next'))];
      },
      getTrackPublication: () => existing ? { track: { mediaStreamTrack: track('published') } } : undefined,
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
  assert.deepEqual(f.calls.captures, [{ audio: false,
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

test('多出来的轨（音频）要停掉，交出去的那条不能停', async () => {
  const extra = track('audio');
  const video = track('next');
  const f = fixture({ createScreenTracks: () => [wrapper(video), wrapper(extra)] });
  assert.equal(await f.share.switchDisplay(), true);
  assert.equal(extra.stopped, true, '不需要的轨要收掉');
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
