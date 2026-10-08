// 「谁正在通话里」：服务端每次广播 `people` 时从 `sessions` 现算 `inCall`，头像条靠它画那个
// 话筒标记（用户 2026-09-23：「需要加上语音通话中的人都有语音的图标」）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { withServer, wait } from './helpers.mjs';
import { markCallPresence } from '../call-presence.mjs';

test('markCallPresence：只标在通话里的人，且不动原对象（纯函数）', () => {
  const people = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const sessions = new Map([['s1', { id: 's1', kind: 'voice', peers: ['a', 'b'] }]]);
  assert.deepEqual(markCallPresence(people, sessions).map((p) => [p.id, p.inCall]),
    [['a', true], ['b', true], ['c', false]]);
  assert.equal('inCall' in people[0], false, '不许就地写回原对象');
  assert.deepEqual(markCallPresence(people, new Map()).map((p) => p.inCall), [false, false, false]);
  // 脏会话（没有 peers）不该把谁标上，也不该抛。
  assert.deepEqual(markCallPresence(people, new Map([['x', {}]])).map((p) => p.inCall),
    [false, false, false]);
});

test('通话打通后第三个人也看得到"他们在通话里"，挂断就收掉', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('甲'), b = await connect('乙'), c = await connect('丙');
    const inCallOf = (socket, id) => peopleOf(socket).find((p) => p.id === id)?.inCall;
    const until = async (check, why) => {
      const deadline = Date.now() + 4000;
      while (Date.now() < deadline) { if (check()) return; await wait(20); }
      assert.fail('等不到：' + why);
    };
    assert.equal(inCallOf(c, a.id), false, '还没通话就不该标');
    const requested = once(b, 'request');
    a.emit('request', { target: b.id, kind: 'voice' });
    const [invite] = await requested;
    b.emit('respond', { id: invite.id, accept: true });
    await once(a, 'session');
    await until(() => inCallOf(c, a.id) === true && inCallOf(c, b.id) === true,
      '通话双方要出现在每个人的名单里（不是只有当事人看得到）');
    await until(() => inCallOf(c, c.id) === false, '没通话的人不许被标上');
    const ended = once(b, 'session-end');
    a.emit('end', invite.id);
    await ended;
    await until(() => inCallOf(c, a.id) === false && inCallOf(c, b.id) === false, '挂断后要收掉');
  });
});
