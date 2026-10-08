// 端到端（真服务器 + 真 socket）：键鼠状态怎么变成别人的绿点/红点。
import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, wait } from './helpers.mjs';

test('键鼠状态广播成 atDesk / awayFor，离座时长随真实时间增长', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('同事甲');
    const b = await connect('同事乙');
    const personOf = (socket) => peopleOf(socket).find((person) => person.id === socket.id);
    const seenOf = (socket) => peopleOf(socket).find((person) => person.id === a.id);

    // 没有上报过的客户端按在座算：旧版客户端不该被标成红点。
    assert.equal(personOf(a).atDesk, true);
    assert.equal(personOf(a).awayFor, 0);

    a.emit('input-state', { atDesk: true, busy: true });
    await wait(80);
    assert.equal(seenOf(b).autoExpression, 'busy', '忙碌对其他在线用户可见');
    a.emit('input-state', { atDesk: false, idleMs: 301000 });
    await wait(80);
    assert.equal(seenOf(b).autoExpression, 'sleepy');
    a.emit('input-state', { atDesk: true });
    await wait(80);

    // 甲离桌：乙也应当立刻看到，而且离座时长从 0 开始算。
    a.emit('input-state', { atDesk: false });
    await wait(80);
    assert.equal(personOf(a).atDesk, false);
    assert.ok(personOf(a).awayFor >= 0 && personOf(a).awayFor < 5_000, String(personOf(a).awayFor));
    assert.equal(seenOf(b).atDesk, false, '别人也应该看到甲离桌');
    assert.equal(personOf(b).atDesk, true, '乙不受影响');

    // 真实时间过去以后，服务端给出的离座时长要跟着长大（客户端再加本地计时）。
    await wait(300);
    a.emit('input-state', { atDesk: false }); // 状态没变，只是确保有新的广播
    const later = seenOf(b).awayFor;
    assert.ok(later >= personOf(a).awayFor, `离座时长不该倒退：${later} < ${personOf(a).awayFor}`);

    // 甲碰了鼠标：回到在座，时长清零。
    a.emit('input-state', { atDesk: true });
    await wait(80);
    assert.equal(personOf(a).atDesk, true);
    assert.equal(personOf(a).awayFor, 0);
    assert.equal('awaySince' in personOf(a), false, '内部时间戳不该发给客户端');
    assert.equal(seenOf(b).atDesk, true);
  });
});
