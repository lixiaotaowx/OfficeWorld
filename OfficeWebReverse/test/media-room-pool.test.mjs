import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MediaRoomPool } from '../src/app/MediaRoomPool.js';

const credentials = { url: 'ws://127.0.0.1', token: 'test-only' };

test('reuses pending media connections and waits for cleanup before rejoining', async () => {
  const events = [];
  let releaseCleanup;
  const cleanupGate = new Promise(resolve => { releaseCleanup = resolve; });
  const pool = new MediaRoomPool(async id => {
    events.push(`token:${id}`);
    return credentials;
  }, (room, id) => {
    room.connect = async () => { events.push(`connect:${id}`); };
    room.disconnect = async () => {
      events.push(`disconnect:${id}`);
      await cleanupGate;
    };
  }, error => assert.fail(error));

  const first = pool.join('desk');
  assert.equal(pool.join('desk'), first);
  const firstRoom = await first;
  assert.deepEqual(pool.values(), [['desk', firstRoom]]);
  pool.close('desk');
  assert.equal(pool.get('desk'), undefined);
  const replacement = pool.join('desk');
  await new Promise(setImmediate);
  assert.deepEqual(events, ['token:desk', 'connect:desk', 'disconnect:desk']);
  releaseCleanup();
  assert.notEqual(await replacement, firstRoom);
  assert.deepEqual(events, ['token:desk', 'connect:desk', 'disconnect:desk', 'token:desk', 'connect:desk']);
  pool.dispose();
});

test('cancels pending rooms and treats audio and screen jobs as separate queues', async () => {
  let releaseScreen;
  const screenGate = new Promise(resolve => { releaseScreen = resolve; });
  const events = [];
  const pool = new MediaRoomPool(async () => credentials, room => {
    room.connect = async () => { room.state = 'connected'; };
    room.disconnect = async () => {};
  }, error => assert.fail(error));

  const pending = pool.join('cancelled');
  pool.close('cancelled');
  assert.equal(await pending, null);
  await assert.rejects(pool.run('cancelled', () => assert.fail('Closed room ran a job')));

  await pool.join('desk');
  const first = pool.run('desk', async () => {
    events.push('screen:start');
    await screenGate;
    events.push('screen:end');
  });
  const second = pool.run('desk', () => events.push('screen:next'));
  await pool.run('desk', () => events.push('audio'), 'audio');
  assert.deepEqual(events, ['screen:start', 'audio']);
  releaseScreen();
  await Promise.all([first, second]);
  assert.deepEqual(events, ['screen:start', 'audio', 'screen:end', 'screen:next']);
  pool.dispose();
});
