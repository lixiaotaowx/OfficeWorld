import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import ts from 'typescript';

function load(file, sdk) {
  const source = readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(() => sdk, exports);
  return exports;
}
function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}
function setup(token = async () => ({ url: 'wss://test', token: 'test' })) {
  const created = [];
  class Room extends EventEmitter {
    state = 'disconnected';
    constructor() { super(); created.push(this); }
    async connect() { this.state = 'connected'; }
    async disconnect() { this.state = 'disconnected'; this.emit('disconnected'); }
  }
  const { MediaRooms } = load('mediaRooms.ts', { Room });
  const manager = new MediaRooms(token, () => {}, () => {});
  return { manager, created };
}
const tick = () => new Promise(r => setImmediate(r));

test('one room for simultaneous joins', async () => {
  const { manager, created } = setup();
  const [a, b] = await Promise.all([manager.join('a'), manager.join('a')]);
  assert.equal(a, b); assert.equal(created.length, 1); manager.dispose();
});
test('permission/publication completes before teardown; later queued work is cancelled', async () => {
  const { manager } = setup(); const room = await manager.join('a');
  const capture = deferred(); let validAfterCapture; let ranLate = false;
  const operation = manager.run('a', async (_, valid) => { await capture.promise; validAfterCapture = valid(); });
  await tick();
  const late = manager.run('a', async () => { ranLate = true; });
  const rejected = assert.rejects(late, /恢复/);
  manager.close('a'); assert.equal(room.state, 'connected');
  capture.resolve(); await operation; await rejected; await tick();
  assert.equal(validAfterCapture, false); assert.equal(ranLate, false);
  assert.equal(room.state, 'disconnected');
});
test('leave/rejoin waits for old teardown and stale events cannot own new room', async () => {
  const { manager } = setup(); const old = await manager.join('a');
  const hold = deferred(); const operation = manager.run('a', async () => hold.promise);
  await tick(); manager.close('a'); const next = manager.join('a');
  let finished = false; void next.then(() => { finished = true; });
  await tick(); assert.equal(finished, false);
  hold.resolve(); await operation; const room = await next;
  assert.notEqual(room, old); assert.equal(manager.current('a', old), false);
  assert.equal(manager.current('a', room), true); manager.dispose();
});
test('late token after cancellation never connects the abandoned room', async () => {
  const token = deferred(); const { manager, created } = setup(() => token.promise);
  const ready = manager.join('a'); await tick(); manager.close('a');
  token.resolve({ url: 'wss://test', token: 'test' });
  assert.equal(await ready, null); await tick(); assert.equal(created[0].state, 'disconnected');
});
test('capture returning after room cancellation stops tracks without publication', async () => {
  const capture = deferred(); let stopped = false; let published = false; let valid = true;
  const { setPublication } = load('mediaPublication.ts', { Track: { Source: { ScreenShare: 'screen' } } });
  const room = { localParticipant: { getTrackPublication() {}, createScreenTracks: () => capture.promise,
    publishTrack: async () => { published = true; } } };
  const result = setPublication(room, 'screen', true, () => valid);
  valid = false; capture.resolve([{ stop() { stopped = true; } }]);
  await assert.rejects(result, /取消/); assert.equal(published, false); assert.equal(stopped, true);
});
