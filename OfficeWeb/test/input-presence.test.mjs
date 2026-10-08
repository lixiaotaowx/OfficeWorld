// 服务端的在座/离桌记录：默认在座、只在翻转时广播、内部时间戳不外发。
import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createInputPresence } from '../input-presence.mjs';

function harness() {
  const io = new EventEmitter();
  const people = new Map();
  let published = 0;
  const presence = createInputPresence({ io, people, publish: () => { published += 1; } });
  people.set('s1', { id: 's1', clientId: 'c1', name: '同事' });
  const socket = new EventEmitter();
  socket.id = 's1';
  io.emit('connection', socket);
  return { io, presence, people, socket, published: () => published };
}

test('没有上报过的客户端按在座，离座时长是 0', () => {
  const h = harness();
  const [view] = h.presence.view();
  assert.equal(view.atDesk, true);
  assert.equal(view.awayFor, 0);
  assert.equal('awaySince' in view, false, '内部时间戳不该发给客户端');
  assert.equal(view.name, '同事', '原有字段必须原样带上');
});

test('离桌和回到座位各广播一次，重复上报不再广播', () => {
  const h = harness();
  h.socket.emit('input-state', { atDesk: false });
  assert.equal(h.published(), 1);
  let view = h.presence.view()[0];
  assert.equal(view.atDesk, false);
  assert.ok(view.awayFor >= 0);
  h.socket.emit('input-state', { atDesk: false });
  assert.equal(h.published(), 1, '状态没变就不该广播');
  h.socket.emit('input-state', { atDesk: true });
  assert.equal(h.published(), 2);
  view = h.presence.view()[0];
  assert.equal(view.atDesk, true);
  assert.equal(view.awayFor, 0);
  h.socket.emit('input-state', { atDesk: true });
  assert.equal(h.published(), 2);
});

test('客户端报的"已经安静多久"决定离座起点，异常值会被夹住', () => {
  const h = harness();
  h.socket.emit('input-state', { atDesk: false, idleMs: 10_000 });
  assert.ok(h.presence.view()[0].awayFor >= 10_000, '离座时间要从停止操作那一刻算起');
  h.socket.emit('input-state', { atDesk: true });
  h.socket.emit('input-state', { atDesk: false, idleMs: -5 });
  assert.ok(h.presence.view()[0].awayFor < 1_000, '负数当成 0，不能倒扣时间');
  h.socket.emit('input-state', { atDesk: true });
  h.socket.emit('input-state', { atDesk: false, idleMs: 9e15 });
  assert.ok(h.presence.view()[0].awayFor <= 24 * 3600 * 1000 + 1_000, '超过一天要夹住');
});

test('还没 join 的 socket 上报被忽略，缺字段的上报按在座处理', () => {
  const h = harness();
  const stranger = new EventEmitter();
  stranger.id = 'nobody';
  h.io.emit('connection', stranger);
  const before = h.published();
  stranger.emit('input-state', { atDesk: false });
  assert.equal(h.published(), before, '没有 person 就什么都不做');
  assert.equal(h.people.size, 1);
  // 空载荷（老客户端）等于"在座"，不该把人标成离桌。
  h.socket.emit('input-state', undefined);
  assert.equal(h.presence.view()[0].atDesk, true);
  h.socket.emit('input-state', {});
  assert.equal(h.presence.view()[0].atDesk, true);
});
