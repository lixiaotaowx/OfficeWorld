import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { withServer } from './helpers.mjs';
import { grantRoom, privateSources } from '../livekit.mjs';
import { TrackSource } from 'livekit-server-sdk';

const next = (socket, event) => Promise.race([
  once(socket, event).then(([value]) => value),
  new Promise((_, reject) => setTimeout(() => reject(Error(`timeout: ${event}`)), 2500).unref()),
]);

test('双方向屏幕邀请复用已有语音、停屏保留语音、挂断结束', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙');
    async function invite(from, to, kind, offer = false) {
      const waiting = next(to, 'request'); from.emit('request', { target: to.id, kind, offer });
      const request = await waiting;
      const accepted = next(from, 'session'); to.emit('respond', { id: request.id, accept: true });
      return accepted;
    }
    const voice = await invite(a, b, 'voice');
    assert.match(voice.room, /^call-/); assert.equal(voice.kind, 'voice');
    a.emit('sharing', true);
    const offer = await invite(a, b, 'screen', true);
    assert.equal(offer.id, voice.id); assert.equal(offer.room, voice.room);
    assert.deepEqual(offer.screenOwners, [a.id]);
    b.emit('sharing', true);
    const requested = await invite(a, b, 'screen');
    assert.equal(requested.id, voice.id);
    assert.deepEqual(requested.screenOwners, [b.id]);
    a.emit('sharing', false);
    const stoppedB = next(a, 'session'); b.emit('sharing', false);
    const remaining = await stoppedB;
    assert.equal(remaining.kind, 'voice'); assert.equal(remaining.id, voice.id);
    const ended = next(b, 'session-end'); a.emit('end', voice.id);
    assert.equal(await ended, voice.id);
  });
});

test('每对用户独立授权，第三人不能加入；语音不会获得屏幕发布权限', () => {
  const ab = { id: 'ab', room: 'call-ab', kind: 'screen', peers: ['a', 'b'], screenOwners: ['a'] };
  const ac = { id: 'ac', room: 'call-ac', kind: 'voice', peers: ['a', 'c'], screenOwners: [] };
  const sessions = new Map([['ab', ab], ['ac', ac]]);
  const people = new Map(['a', 'b', 'c'].map(id => [id, { id }]));
  const grant = (socketId, requested) => grantRoom({ socketId, requested, people, sessions });
  assert.equal(grant('c', 'call-ab'), null); assert.equal(grant('b', 'call-ac'), null);
  assert.equal(grant('a', 'call-ab'), 'call-ab');
  assert.deepEqual(privateSources('call-ab', 'a', sessions), [TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE]);
  assert.deepEqual(privateSources('call-ab', 'b', sessions), [TrackSource.MICROPHONE]);
  assert.deepEqual(privateSources('call-ac', 'a', sessions), [TrackSource.MICROPHONE]);
  sessions.delete('ab'); assert.equal(grant('a', 'call-ab'), null);
});

test('第三人不能接受或挂断，取消邀请不能迟到接受', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙'), c = await connect('丙');
    const requested = next(b, 'request'); a.emit('request', { target: b.id, kind: 'voice' });
    const invite = await requested;
    c.emit('respond', { id: invite.id, accept: true });
    const cancel = next(b, 'request-expired'); a.emit('cancel-request', invite.id);
    assert.equal(await cancel, invite.id);
    let created = false; a.on('session', () => { created = true; });
    b.emit('respond', { id: invite.id, accept: true });
    await new Promise(r => setTimeout(r, 80)); assert.equal(created, false);
  });
});
