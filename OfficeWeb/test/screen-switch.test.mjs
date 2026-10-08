// 换屏：正在共享的画面必须是"原地换轨"，不能重开会话，也不能把新采集掐掉。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// livekit-client 是浏览器库，这里只用到 Track.Source.ScreenShare 这一个常量。
const LK_STUB = 'data:text/javascript,' + encodeURIComponent(
  'export const Track = { Source: { ScreenShare: "screen_share" } };');
const compiled = ts.transpileModule(
  readFileSync(new URL('../src/screenSwitch.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } },
).outputText.replace(/['"]livekit-client['"]/, JSON.stringify(LK_STUB));
const { captureSelectedScreen, swapScreenTrack, switchLiveScreen } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

function fakeTrack(name) {
  const track = { kind: 'video', name, stopped: false, stop() { this.stopped = true; } };
  // 真的 MediaStreamTrack 支持 clone()，每个 sender 要自己的一份。
  track.clone = () => fakeTrack(name);
  return track;
}

function fakeStream(track) {
  return { active: true, getTracks: () => [track], getVideoTracks: () => [track] };
}

/** A room publishing one screen track, recording every swap it is asked for. */
function fakeRoom(swaps = []) {
  const publication = {
    track: {
      mediaStreamTrack: fakeTrack('published'),
      replaceTrack: async next => { swaps.push(next); },
    },
  };
  return {
    name: 'room',
    swaps,
    localParticipant: { getTrackPublication: () => publication },
    publication,
  };
}

test('swapScreenTrack 原地换轨并停掉旧采集；没有发布屏幕时返回 false', async () => {
  const room = fakeRoom();
  const next = fakeTrack('next');
  assert.equal(await swapScreenTrack(room, next), true);
  assert.deepEqual(room.swaps, [next]);
  assert.equal(room.publication.track.mediaStreamTrack.stopped, true, '旧采集必须被停掉');

  const empty = { localParticipant: { getTrackPublication: () => undefined } };
  assert.equal(await swapScreenTrack(empty, fakeTrack('x')), false);
});

test('switchLiveScreen 把每个房间都切到新屏幕，每间一份自己的克隆', async () => {
  const live = fakeStream(fakeTrack('live'));
  live.getVideoTracks()[0].onended = () => { throw Error('旧采集的 onended 不该被触发'); };
  const rooms = [fakeRoom(), fakeRoom()];
  let adopted = null;
  const switched = await switchLiveScreen({
    live: () => live,
    owner: () => true,
    adopt: next => { adopted = next; },
    publishers: () => rooms,
  }, async () => fakeStream(fakeTrack('fresh')));
  assert.equal(switched, true);
  assert.equal(adopted?.getVideoTracks()[0]?.name, 'fresh', 'adopt 必须拿到刚采集的那条流');
  assert.notEqual(adopted, live, 'adopt 不能拿到被替换掉的旧流');
  assert.equal(live.getVideoTracks()[0].onended, null,
    '旧采集的 onended 要先清掉，否则会被当成"用户停止共享"');
  assert.equal(live.getVideoTracks()[0].stopped, true, '旧采集最后要停掉');
  for (const room of rooms) {
    assert.equal(room.swaps.length, 1);
    assert.equal(room.swaps[0].name, 'fresh');
  }
  assert.notEqual(rooms[0].swaps[0], rooms[1].swaps[0], '每个 sender 要自己的一份轨');
});

test('没有共享、或采集期间共享已经结束：什么都不做', async () => {
  let adopted = 0;
  assert.equal(await switchLiveScreen({ live: () => null, owner: () => true,
    adopt: () => { adopted += 1; }, publishers: () => [fakeRoom()] }), false);

  const ended = fakeStream(fakeTrack('live'));
  ended.active = false;
  assert.equal(await switchLiveScreen({ live: () => ended, owner: () => true,
    adopt: () => { adopted += 1; }, publishers: () => [fakeRoom()] }), false);
  assert.equal(adopted, 0);
});

test('采集回来后已经不是同一条共享：丢掉新采集，不打断别人那条', async () => {
  const fresh = fakeTrack('fresh');
  const live = fakeStream(fakeTrack('live'));
  const room = fakeRoom();
  assert.equal(await switchLiveScreen({
    live: () => live,
    owner: () => false,
    adopt: () => { throw Error('不该 adopt'); },
    publishers: () => [room],
  }, async () => fakeStream(fresh)), false);
  assert.equal(fresh.stopped, true, '这条新采集必须自己收尾');
  assert.equal(room.swaps.length, 0);
});

test('采集参数：15fps、不要系统声音', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  let asked = null;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    mediaDevices: { getDisplayMedia: async constraints => { asked = constraints; return fakeStream(fakeTrack('s')); } },
  } });
  try {
    await captureSelectedScreen();
    assert.deepEqual(asked, { video: { frameRate: { ideal: 15, max: 20 } }, audio: false });
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
  }
});
