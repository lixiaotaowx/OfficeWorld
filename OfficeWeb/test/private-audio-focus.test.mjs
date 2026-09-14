import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const sdk = { Track: { Source: { Microphone: 'microphone', ScreenShare: 'screen' } } };
function load(file) {
  const code = ts.transpileModule(readFileSync(new URL('../src/' + file + '.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(name => name === 'livekit-client' ? sdk : load(name.replace('./', '')), exports);
  return exports;
}
const { MediaAudioFocus } = load('mediaAudioFocus');
const tick = () => new Promise(resolve => setImmediate(resolve));

function setup() {
  const records = new Map();
  for (const name of ['call-a', 'call-b', 'meeting-c']) {
    let publication;
    const participant = {
      enabled: false,
      createTracks: async () => [{ mediaStreamTrack: { readyState: 'live' }, stop() { this.mediaStreamTrack.readyState = 'ended'; } }],
      getTrackPublication: () => publication,
      publishTrack: async track => {
        participant.enabled = true;
        publication = { track, unmute: async () => { participant.enabled = true; }, mute: async () => { participant.enabled = false; } };
      },
      unpublishTrack: async () => { publication = undefined; participant.enabled = false; },
    };
    records.set(name, { state: 'connected', localParticipant: participant });
  }
  const rooms = { values: () => [...records], run: async (name, action) => action(records.get(name), () => true) };
  const focus = new MediaAudioFocus(rooms, () => {}, () => {});
  for (const name of records.keys()) focus.add(name);
  return { focus, records };
}

test('会议与各私聊只有一个开麦目标，手动静音在切换后保留', async () => {
  const { focus, records } = setup();
  await focus.activate('call-a');
  await focus.activate('call-b');
  assert.equal(records.get('call-a').localParticipant.enabled, false);
  assert.equal(records.get('call-b').localParticipant.enabled, true);
  await focus.mute('call-b');
  await focus.activate('meeting-c');
  assert.equal(records.get('call-b').localParticipant.enabled, false);
  await focus.activate('call-b');
  assert.equal(records.get('call-b').localParticipant.enabled, false);
  assert.equal(records.get('meeting-c').localParticipant.enabled, false);
  assert.equal(focus.intended('call-b'), false);
});

test('切换期间旧权限延迟返回，不会向旧对象发布', async () => {
  const { focus, records } = setup();
  let resolve;
  records.get('call-a').localParticipant.createTracks = () => new Promise(r => { resolve = r; });
  const pending = focus.activate('call-a');
  const rejected = assert.rejects(pending, /取消/);
  await tick();
  const next = focus.activate('call-b');
  let stopped = false;
  resolve([{ stop() { stopped = true; } }]);
  await rejected; await next;
  assert.equal(stopped, true);
  assert.equal(records.get('call-a').localParticipant.enabled, false);
  assert.equal(records.get('call-b').localParticipant.enabled, true);
});

test('麦克风拒绝不会误报开启；原通话麦克风已停止', async () => {
  const { focus, records } = setup();
  await focus.activate('call-a');
  records.get('call-b').localParticipant.createTracks = async () => { throw Error('permission denied'); };
  await assert.rejects(focus.activate('call-b'), /permission denied/);
  assert.equal(records.get('call-a').localParticipant.enabled, false);
  assert.equal(records.get('call-b').localParticipant.enabled, false);
});
