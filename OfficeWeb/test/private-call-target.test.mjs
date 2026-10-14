import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { withServer } from './helpers.mjs';

test('三客户端连续交替邀请只送达指定 socket ID，第三人不收到来电', async () => {
  await withServer(async ({ connect }) => {
    const caller = await connect('发起人', { role: 'visitor' });
    const a = await connect('目标甲'), b = await connect('目标乙');
    const inbox = new Map([[a.id, []], [b.id, []]]);
    a.on('request', request => inbox.get(a.id).push(request));
    b.on('request', request => inbox.get(b.id).push(request));
    for (const target of [a, b, b, a, b, a]) {
      for (const [kind, offer] of [['voice', false], ['screen', false], ['screen', true]]) {
        const other = target === a ? b : a;
        const targetCount = inbox.get(target.id).length;
        const otherCount = inbox.get(other.id).length;
        const sent = once(caller, 'request-sent');
        caller.emit('request', { target: target.id, kind, offer });
        const [invite] = await sent;
        // Round trips flush both receivers' preceding server messages.
        await Promise.all([a, b].map(s => s.timeout(1500).emitWithAck('sit', null)));
        assert.equal(invite.target, target.id);
        assert.equal(inbox.get(target.id).length, targetCount + 1);
        assert.equal(inbox.get(target.id).at(-1).id, invite.id);
        assert.equal(inbox.get(other.id).length, otherCount, '不得向第三人广播邀请');
        const cancelled = once(target, 'request-expired');
        caller.emit('cancel-request', invite.id);
        assert.equal((await cancelled)[0].id, invite.id);
      }
    }
  });
});
