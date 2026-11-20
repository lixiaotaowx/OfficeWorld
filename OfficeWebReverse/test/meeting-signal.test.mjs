import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { createMeetingSignal } from '../src/app/meetingSignal.js';
import { RoomEvent } from '../src/vendor/livekit.js';

function room(quality) {
  return Object.assign(new EventEmitter(), {
    state: 'connected',
    localParticipant: { identity: 'me', connectionQuality: quality },
    remoteParticipants: new Map(),
  });
}

test('meeting signal listens only to the current room and resets on leaving', t => {
  const first = room('good');
  const second = room('excellent');
  let current = first;
  let updates = 0;
  const monitor = createMeetingSignal(() => current, () => updates++);
  t.after(monitor.dispose);
  monitor.setRoom('first');
  assert.equal(monitor.snapshot().summary, '信号好');
  assert.equal(updates, 0);
  first.localParticipant.connectionQuality = 'poor';
  first.emit(RoomEvent.ConnectionQualityChanged);
  assert.equal(monitor.snapshot().summary, '信号弱');
  assert.equal(updates, 1);
  first.emit(RoomEvent.ConnectionQualityChanged);
  assert.equal(updates, 1);
  current = second;
  monitor.setRoom('second');
  assert.equal(first.listenerCount(RoomEvent.ConnectionQualityChanged), 0);
  assert.equal(second.listenerCount(RoomEvent.ConnectionQualityChanged), 1);
  assert.equal(monitor.snapshot().summary, '信号很好');
  monitor.setRoom(null);
  assert.equal(second.listenerCount(RoomEvent.ConnectionQualityChanged), 0);
  assert.deepEqual(monitor.snapshot().state, { connection: 'inactive', quality: 'unknown', participants: [] });
  assert.equal(monitor.snapshot().tick, 0);
});
