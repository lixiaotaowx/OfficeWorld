import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, wait } from './helpers.mjs';
import { grantRoom } from '../livekit.mjs';

test('会议邀请、拒绝、回会、主持人权限与结束隔离', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('主持人', { id: 'account-a' });
    const b = await connect('同事', { id: 'account-b' });
    const c = await connect('未邀请', { id: 'account-c' });
    const states = new Map();
    for (const s of [a, b, c]) s.on('meeting-state', x => states.set(s, x));
    const act = async (s, data) => {
      await wait(160);
      const result = await new Promise(resolve => s.emit('meeting-action', data, resolve));
      await wait(30); return result;
    };
    const created = await act(a, { action: 'create', title: '设计讨论', invitees: ['account-b'] });
    assert.equal(created.ok, true);
    const id = created.id;
    assert.equal(states.get(b).invitations.length, 1);
    assert.equal(states.get(c).invitations.length, 0);
    assert.equal((await act(c, { action: 'accept', id })).ok, false);
    assert.equal((await act(b, { action: 'decline', id })).ok, true);
    assert.equal(states.get(b).active, null);
    assert.equal(states.get(a).active.members.find(m => m.id === 'account-b').status, 'declined');
    await act(a, { action: 'invite', id, invitees: ['account-b'] });
    assert.equal((await act(b, { action: 'accept', id })).ok, true);
    const room = states.get(b).active.room;
    const p = peopleOf(b).find(p => p.id === b.id);
    assert.equal(grantRoom({ socketId: b.id, requested: room, person: p }), room);
    assert.equal(grantRoom({ socketId: c.id, requested: room, person: peopleOf(c).find(p => p.id === c.id) }), null);
    assert.equal((await act(b, { action: 'end', id })).ok, false);
    assert.equal((await act(b, { action: 'create', title: '重复' })).ok, false);
    await act(b, { action: 'leave', id });
    assert.equal(states.get(b).active, null);
    assert.equal((await act(b, { action: 'accept', id })).ok, true);
    await act(a, { action: 'leave', id });
    assert.equal(states.get(b).active.host, 'account-b');
    await act(b, { action: 'end', id });
    assert.equal(states.get(a).invitations.length, 0);
    assert.equal(states.get(b).active, null);
    assert.equal((await act(a, { action: 'accept', id })).ok, false);
  });
});

