import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { withServer } from './helpers.mjs';

// Loopback server with temporary storage. Never connects to the live office.
test('游客及无工位成员可以双向语音、看屏幕和分享屏幕，仍须对方同意', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const visitor = await connect('测试游客', { role: 'visitor' });
    const member = await connect('测试无工位成员');
    for (const person of peopleOf(member)) assert.equal(person.seat, null);
    assert.equal(peopleOf(member).find(p => p.id === visitor.id).role, 'visitor');
    for (const [from, to] of [[visitor, member], [member, visitor]]) {
      for (const [kind, offer] of [['voice', false], ['screen', false], ['screen', true]]) {
        let established = false;
        const onSession = () => { established = true; };
        from.on('session', onSession);
        const received = once(to, 'request');
        const sent = once(from, 'request-sent');
        from.emit('request', { target: to.id, kind, offer });
        const [invite] = await received;
        assert.equal((await sent)[0].id, invite.id);
        assert.equal(invite.from, from.id);
        assert.equal(invite.kind, kind);
        assert.equal(invite.offer, offer);
        assert.equal(established, false, '发邀请不能自动接通');
        if (kind === 'screen') {
          const owner = offer ? from : to;
          owner.emit('sharing', true);
          // Round trip orders the screen-state update before accepting the invite.
          await owner.timeout(1000).emitWithAck('sit', null);
        }
        const started = once(from, 'session');
        const reply = await to.timeout(1500).emitWithAck('respond', { id: invite.id, accept: true });
        assert.equal(reply.ok, true);
        const [session] = await started;
        assert.equal(session.kind, kind);
        const ended = once(to, 'session-end');
        from.emit('end', session.id);
        await ended;
        from.off('session', onSession);
      }
    }
  });
});
