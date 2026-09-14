import test from 'node:test';
import assert from 'node:assert/strict';
import { once, EventEmitter } from 'node:events';
import { withServer } from './helpers.mjs';
import { createMeetings } from '../meetings.mjs';

test('已接通私聊直接共享：后来者独占，旧端停止不清掉新端，第三人拒绝', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙'), c = await connect('丙');
    const invitation = once(b, 'request'); a.emit('request', { target: b.id, kind: 'voice' });
    const [request] = await invitation;
    const sessionEvent = once(a, 'session'); await b.emitWithAck('respond', { id: request.id, accept: true });
    const [voice] = await sessionEvent;
    assert.equal((await a.emitWithAck('private-screen', voice.id)).ok, false);
    a.emit('sharing', true); b.emit('sharing', true); c.emit('sharing', true);
    const first = await a.emitWithAck('private-screen', voice.id);
    assert.deepEqual(first.session.screenOwners, [a.id]);
    const second = await b.emitWithAck('private-screen', voice.id);
    assert.equal(second.session.id, voice.id);
    assert.deepEqual(second.session.screenOwners, [b.id]);
    assert.equal((await c.emitWithAck('private-screen', voice.id)).ok, false);
    a.emit('sharing', false);
    assert.deepEqual((await b.emitWithAck('private-screen', voice.id)).session.screenOwners, [b.id]);
  });
});

test('会议共享串行接替及权限更新，旧lease释放不影响新共享', async () => {
  const people = new Map(['a', 'b', 'c'].map(id => [id, { id, clientId: id, name: id }]));
  const events = [], permissions = [];
  const io = { to: id => ({ emit: (event, value) => events.push({ id, event, value }) }) };
  const meetings = createMeetings(io, people, () => {}, async () => {}, async session => {
    permissions.push(session);
  });
  const sockets = Object.fromEntries(['a', 'b', 'c'].map(id => {
    const s = new EventEmitter(); s.id = id; s.data = {}; meetings.attach(s); return [id, s];
  }));
  const act = (id, event, data) => new Promise(resolve => sockets[id].emit(event, data, resolve));
  const created = await act('a', 'meeting-action', { action: 'create', title: '共享测试', invitees: ['b'] });
  assert.equal(created.ok, true);
  await act('b', 'meeting-action', { action: 'accept', id: created.id });
  const room = people.get('a').meetingRoom;
  assert.equal((await act('c', 'meeting-screen', { room, action: 'claim', lease: 'c1' })).ok, false);
  assert.equal((await act('a', 'meeting-screen', { room, action: 'claim', lease: 'a1' })).ok, true);
  assert.equal(meetings.screenOwner(room), 'a');
  const results = await Promise.all([
    act('b', 'meeting-screen', { room, action: 'claim', lease: 'b1' }),
    act('a', 'meeting-screen', { room, action: 'release', lease: 'a1' }),
  ]);
  assert.ok(results.every(result => result.ok));
  assert.equal(meetings.screenOwner(room), 'b');
  assert.deepEqual(permissions.at(-1).screenOwners, ['b']);
  assert.ok(events.some(e => e.id === 'a' && e.event === 'meeting-screen-replaced' && e.value.lease === 'a1'));
  await act('b', 'meeting-screen', { room, action: 'release', lease: 'b1' });
  assert.equal(meetings.screenOwner(room), null);
  assert.deepEqual(permissions.at(-1).screenOwners, []);
});
