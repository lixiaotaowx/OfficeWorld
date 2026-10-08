// 低清工位预览中继：校验、限速、转发，以及**记住每个人的最后一张**。
//
// 最后那一条是用户 2026-09-18 的要求：「不在的话用最后一张 不要在办公室还关着屏幕」——
// 人走开时客户端什么都不发（采集被暂停），看的人和新登录的人都该看到最后那一张。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewRelay } from '../preview-relay.mjs';

const JPEG = 'data:image/jpeg;base64,AAAA';

function harness(rows) {
  const people = new Map(rows.map(row => [row.id, { previewAllowed: true, role: 'employee',
    seat: 1, sharing: false, previewSharing: true, ...row }]));
  const sent = [];
  const io = { to: id => ({ emit: (channel, payload) => sent.push({ to: id, channel, payload }) }) };
  const relay = createPreviewRelay({ io, people });
  return { people, sent, relay, socket: id => ({ id }),
    framesFor: id => sent.filter(row => row.to === id && row.payload?.image) };
}

test('正常一帧：转发给能看的人，连分享者自己也有一份（他桌上那块屏要亮）', () => {
  const h = harness([{ id: 'a', clientId: 'acc-a' }, { id: 'b', clientId: 'acc-b' },
    { id: 'c', clientId: 'acc-c', previewAllowed: false }]);
  assert.equal(h.relay.push(h.socket('a'), JPEG), true);
  assert.deepEqual(h.sent.map(row => row.to), ['a', 'b'], '自己和开着接收的人都收到，关掉接收的人不打扰');
  assert.deepEqual(h.sent[0].payload, { id: 'a', image: JPEG });
  assert.equal(h.relay.size(), 1);
});

test('访客、没在广播的、脏数据、太密的都被挡掉', () => {
  const h = harness([{ id: 'v', clientId: 'acc-v', role: 'visitor' },
    { id: 'n', clientId: 'acc-n', previewSharing: false, sharing: false },
    { id: 'a', clientId: 'acc-a' }]);
  assert.equal(h.relay.push(h.socket('v'), JPEG), false, '访客永不广播低清预览');
  assert.equal(h.relay.push(h.socket('n'), JPEG), false, '没在广播就不收');
  assert.equal(h.relay.push(h.socket('a'), 'data:image/png;base64,AAAA'), false, '只认 JPEG');
  assert.equal(h.relay.push(h.socket('a'), 'x'.repeat(250001)), false, '体积封顶');
  assert.equal(h.relay.push(h.socket('a'), JPEG), true);
  assert.equal(h.relay.push(h.socket('a'), JPEG), false, '400ms 内只收一帧');
  assert.equal(h.relay.size(), 1);
  // 高清共享时也允许广播低清预览。
  const shared = harness([{ id: 's', clientId: 'acc-s', previewSharing: false, sharing: true }]);
  assert.equal(shared.relay.push(shared.socket('s'), JPEG), true);
});

test('人走开（客户端什么都不发）时，最后一张留着：新来的人也能看到', () => {
  const h = harness([{ id: 'a', clientId: 'acc-a' }, { id: 'b', clientId: 'acc-b' }]);
  h.relay.push(h.socket('a'), JPEG);
  h.relay.push(h.socket('b'), JPEG);
  h.sent.length = 0;
  // a 离开电脑：客户端暂停采集，什么都不发（既不发帧，也不发 ambient-sharing:false）。
  h.relay.forget('a');                       // 断线/限速表的清理，人还在、最后一张还在
  // 新登录的 c 进来：join 之后拿一份快照，不该是黑的。
  h.people.set('c', { id: 'c', clientId: 'acc-c', previewAllowed: true, role: 'employee' });
  h.relay.snapshot('c');
  assert.deepEqual(h.sent.map(row => row.to), ['c', 'c']);
  assert.deepEqual(h.sent.map(row => row.payload.id), ['a', 'b'], '别人的最后一张都给他');
  assert.equal(h.sent.every(row => row.payload.image === JPEG), true);
  assert.equal(h.sent.some(row => row.payload.id === 'c'), false, '不用把自己"最后一张"发给自己');
});

test('明说停止广播：当场告诉别人"没有实时画面"，但最后一张留着（用户要的就是这一张）', () => {
  const h = harness([{ id: 'a', clientId: 'acc-a' }, { id: 'b', clientId: 'acc-b' }]);
  h.relay.push(h.socket('a'), JPEG);
  h.relay.push(h.socket('b'), JPEG);
  h.sent.length = 0;
  h.relay.stop('a');
  assert.deepEqual(h.sent.at(-1).payload, { id: 'a', image: null }, '当下要告诉别人"没有实时画面了"');
  h.sent.length = 0;
  h.people.set('c', { id: 'c', clientId: 'acc-c', previewAllowed: true, role: 'employee' });
  h.relay.snapshot('c');
  assert.deepEqual(h.sent.filter(row => row.payload.image).map(row => row.payload.id), ['a', 'b'],
    'a 走开/采集失败之后，那张画面还要留给后来的人——这正是"用最后一张"');
  assert.equal(h.relay.size(), 2);
});

test('按账号记：换了个 socket（重连）也还是同一个人的最后一张', () => {
  const h = harness([{ id: 'a1', clientId: 'acc-a' }]);
  h.relay.push(h.socket('a1'), JPEG);
  h.relay.forget('a1');
  h.people.delete('a1');
  h.people.set('a2', { id: 'a2', clientId: 'acc-a', previewAllowed: true, role: 'employee' });
  h.sent.length = 0;
  h.people.set('c', { id: 'c', clientId: 'acc-c', previewAllowed: true, role: 'employee' });
  h.relay.snapshot('c');
  assert.deepEqual(h.sent.map(row => row.payload), [{ id: 'a2', image: JPEG }],
    '用新的 socket id 发出去，图还是那张');
  assert.equal(h.relay.size(), 1, '不会因为重连多攒一份');
});

test('有人来看我了：只转给被看的那个人，看自己/访客/没工位的不算', () => {
  const look = { color: 'rose', accessories: { glasses: 'black', hair: 'long', beard: 'none', hat: 'none' } };
  const h = harness([{ id: 'me', clientId: 'acc-me', name: '甲', appearance: look },
    { id: 'you', clientId: 'acc-you' },
    { id: 'guest', clientId: 'acc-guest', role: 'visitor', seat: null },
    { id: 'seatless', clientId: 'acc-seatless', seat: null }]);
  h.sent.length = 0;
  assert.equal(h.relay.watch(h.socket('me'), { target: 'you' }), true);
  assert.deepEqual(h.sent.at(-1), { to: 'you', channel: 'watched',
    payload: { from: 'me', name: '甲', appearance: look } },
    '被看的人收到"有人来看我了"，带上名字和外观（小窗要照他的样子拉出模型）');
  assert.equal(h.relay.watch(h.socket('me'), { target: 'me' }), false, '看自己不算');
  assert.equal(h.relay.watch(h.socket('me'), { target: 'guest' }), false, '访客没有工位预览');
  assert.equal(h.relay.watch(h.socket('me'), { target: 'seatless' }), false, '没工位就没有工位预览');
  assert.equal(h.relay.watch(h.socket('nobody'), { target: 'you' }), false, '不在空间里的人不算');
  // 小窗悬停时每 800ms 会问一次，所以同一对 700ms 内只转一次，别刷屏。
  assert.equal(h.relay.watch(h.socket('me'), { target: 'you' }), false, '太密的不转发');
  h.relay.forgetWatch('me');
  assert.equal(h.relay.watch(h.socket('me'), { target: 'you' }), true, '断线清理之后能重新算');
});
