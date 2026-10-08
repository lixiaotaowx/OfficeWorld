// 屏幕共享的清晰度设置（用户 2026-09-15：「接通后很久才清晰，还会突然变糊」）：
// 屏幕轨只发一层、码率给足、并告诉编码器这是文字画面。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const resolve = specifier => JSON.stringify(import.meta.resolve(specifier));
const compile = (file, replacements = []) => {
  let code = ts.transpileModule(
    readFileSync(new URL('../src/' + file, import.meta.url), 'utf8'),
    { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } },
  ).outputText;
  for (const [from, to] of replacements) code = code.replace(from, to);
  return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
};
const { MediaRooms } = await import(compile('mediaRooms.ts',
  [[/['"]livekit-client['"]/, resolve('livekit-client')]]));
const { captureSelectedScreen } = await import(compile('screenSwitch.ts',
  [[/['"]livekit-client['"]/, resolve('livekit-client')]]));

/** 白盒：`entries` 是 TS 私有字段，运行时就是普通属性。 */
function roomOf(name = 'call-a') {
  const rooms = new MediaRooms(async () => ({ error: '测试里没有媒体服务器' }), () => {}, () => {});
  const ready = rooms.join(name);
  return { rooms, ready, room: rooms.entries.get(name).room };
}

test('屏幕共享只发两层：720p 垫底 + 1080p（默认的三层里最低那层太小）', async () => {
  const { rooms, ready, room } = roomOf();
  const defaults = room.options.publishDefaults;
  assert.equal(defaults.screenShareSimulcastLayers.length, 1,
    '一个 preset ⇒ 两层（源码 presets.length === 1 → [low, original]）；传空数组就没有垫底层了');
  const floor = defaults.screenShareSimulcastLayers[0];
  assert.ok(floor.width >= 1280 && floor.height >= 720,
    '垫底层不能是默认那种小层，否则对端一开始就是糊的：' + floor.width + 'x' + floor.height);
  assert.ok(floor.encoding.maxBitrate >= 1_000_000, '垫底层码率也要够看清字');
  assert.equal(room.options.adaptiveStream, false, '清晰度由我们定，不按元素大小自适应');
  await ready;
  rooms.dispose();
});

test('屏幕共享码率给足（默认只有 2.5 Mbps），起步码率才够高', async () => {
  const { rooms, ready, room } = roomOf();
  const encoding = room.options.publishDefaults.screenShareEncoding;
  assert.ok(encoding.maxBitrate >= 4_000_000,
    'LiveKit 用目标的 90% 作为 x-google-start-bitrate，目标太小就要爬坡十几秒：' + encoding.maxBitrate);
  assert.equal(encoding.maxFramerate, 15, '采集就是 15fps，多给帧率只会摊薄清晰度');
  await ready;
  rooms.dispose();
});

test('采集时告诉编码器这是文字画面', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const track = { kind: 'video', contentHint: '' };
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    mediaDevices: { getDisplayMedia: async () => ({ getVideoTracks: () => [track] }) },
  } });
  try {
    await captureSelectedScreen();
    assert.equal(track.contentHint, 'text');
  } finally {
    if (previous) Object.defineProperty(globalThis, 'navigator', previous);
  }
});

test('两条采集路径都走同一套设置，不会各自漂移', () => {
  const media = readFileSync(new URL('../src/media.ts', import.meta.url), 'utf8');
  assert.match(media, /const stream = await captureSelectedScreen\(\);/,
    '私聊那条必须复用 screenSwitch 的采集（约束和 contentHint 都在那里）');
  assert.doesNotMatch(media, /navigator\.mediaDevices\.getDisplayMedia/,
    '不要在 media.ts 里另起一套采集参数');
  const meeting = readFileSync(new URL('../src/meetingScreenShare.ts', import.meta.url), 'utf8');
  assert.equal((meeting.match(/contentHint: 'text'/g) || []).length, 2,
    '会议开始共享和换屏两处都要带上文字提示');
});
