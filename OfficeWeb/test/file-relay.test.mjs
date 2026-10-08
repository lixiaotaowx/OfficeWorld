// 文件直传的服务端中继（file-relay.mjs）：转发、校验、窗口、取消、断线清理。
//
// 需求原话（用户 2026-09-22）：「把文件拖至状态栏某人头像，就会开始发送，不需要对方同意，
// 直接就发送到设置好的位置」。服务器在这条链路上**只转发、不落盘**——所以这里除了转发规则，
// 还有一条源码级断言盯着"它不许碰文件系统"。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MAX_FILE_BYTES, WINDOW, createFileRelay } from '../file-relay.mjs';

const SOURCE = readFileSync(fileURLToPath(new URL('../file-relay.mjs', import.meta.url)), 'utf8');

/** 一整套假 io / 假 socket：只实现中继真正用到的那几个方法。 */
function harness(rows = [{ id: 'a', clientId: 'acc-a', name: '甲' },
  { id: 'b', clientId: 'acc-b', name: '乙' }]) {
  const people = new Map(rows.map(row => [row.id, { character: '', ...row }]));
  const handlers = new Map();
  const pushed = [];
  const receiver = new Map();
  const io = {
    to: id => ({
      emit: (event, payload) => pushed.push({ to: id, event, payload }),
      timeout: () => ({
        emitWithAck: async (event, payload) => {
          // 转发出去的东西也要记下来：大部分断言看的就是"对方到底收到了什么"。
          pushed.push({ to: id, event, payload, acked: true });
          const handler = receiver.get(id)?.[event];
          if (!handler) throw Error('timeout');       // 对端不在/不认这个事件
          // **必须回数组**：真的 socket.io 里 `io.to(room).timeout().emitWithAck()` 是
          // **广播操作符**，即使 room 里只有一个 socket，解析出来也是 `[ack]`。
          // 以前这个假 io 直接回单个对象，于是"服务端把数组当对象读"的 Bug 完全测不出来
          // （2026-09-21 真机排了大半天）。**别把它简化回单个对象。**
          return [await handler(payload)];
        },
      }),
    }),
  };
  const relay = createFileRelay({ io, people });
  const attach = id => relay.attach({ id, on: (event, fn) => handlers.set(`${id}|${event}`, fn) });
  for (const id of people.keys()) attach(id);
  return {
    relay, people, pushed, receiver, attach,
    /** 收端（真客户端那一侧）怎么应答。 */
    answer(id, event, fn) {
      const map = receiver.get(id) || {};
      map[event] = fn;
      receiver.set(id, map);
    },
    /** 立刻断开某个 socket：走它自己的 disconnect 处理。 */
    disconnect: id => handlers.get(`${id}|disconnect`)(),
    call: (id, event, data) => new Promise(resolve => {
      const handler = handlers.get(`${id}|${event}`);
      assert.ok(handler, `${id} 没有监听 ${event}`);
      handler(data, resolve);
    }),
  };
}

/** 接收方全部接受、原样回执（大多数用例只关心发送这一侧）。 */
function acceptAll(h, id = 'b') {
  h.answer(id, 'file-in', () => ({ ok: true }));
  h.answer(id, 'file-in-part', payload => ({ ok: true }));
  h.answer(id, 'file-in-end', () => ({ ok: true, path: 'C:\\收\\x.txt', savedName: 'x.txt' }));
}

const bytes = length => new Uint8Array(length).fill(7);

test('拖一下就发：offer 转成 file-in、分片按偏移转发、end 带回对方保存的路径', async () => {
  const h = harness();
  acceptAll(h);
  assert.deepEqual(await h.call('a', 'file-offer', { transferId: 't1', targetId: 'b', name: 'x.txt', size: 20 }),
    { ok: true });
  const offer = h.pushed.find(row => row.event === 'file-in');
  assert.deepEqual(offer.payload,
    { transferId: 't1', name: 'x.txt', size: 20, fromId: 'a', fromName: '甲', fromCharacter: '' });
  assert.equal(await h.call('a', 'file-chunk', { transferId: 't1', offset: 0, bytes: bytes(10) })
    .then(reply => reply.ok), true);
  const first = h.pushed.find(row => row.event === 'file-in-part');
  assert.equal(first.to, 'b');
  assert.equal(first.payload.offset, 0);
  assert.equal(first.payload.bytes.length, 10);
  assert.equal(await h.call('a', 'file-chunk', { transferId: 't1', offset: 10, bytes: bytes(10) })
    .then(reply => reply.ok), true);
  assert.deepEqual(await h.call('a', 'file-end', { transferId: 't1' }),
    { ok: true, path: 'C:\\收\\x.txt', savedName: 'x.txt' });
  assert.equal(h.relay.size(), 0, '传完就从表里删掉，不会泄漏');
});

test('对方不在线 / 发给自己 / 文件太大 / 名字无效都发不出去', async () => {
  const h = harness();
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'nobody', name: 'a', size: 1 })).error,
    /不在线/);
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'a', name: 'a', size: 1 })).error,
    /自己/);
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 0 })).error,
    /1 字节/);
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 5 * 1024 ** 3 })).error,
    /2 GB/);
  // 刚好超过 2 GB 就不收（上限是硬门，不是"大概"）。
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a',
    size: MAX_FILE_BYTES + 1 })).error, /2 GB/);
  assert.match((await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: '   ', size: 1 })).error,
    /文件名/);
  // 没进入空间的人（不在 people 里）连 offer 都不行。
  h.attach('ghost');
  assert.match((await h.call('ghost', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 1 })).error,
    /进入空间/);
});

test('对方那端收不下就如实回绝（不是征求同意，是确认接得住）', async () => {
  const h = harness();
  h.answer('b', 'file-in', () => ({ ok: false, error: '接收文件夹不可用' }));
  assert.deepEqual(await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 5 }),
    { ok: false, error: '接收文件夹不可用' });
  assert.equal(h.relay.size(), 0);
});

test('乱序、超大分片、超出窗口都被挡掉', async () => {
  const h = harness();
  acceptAll(h);
  await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 40 });
  assert.match((await h.call('a', 'file-chunk', { transferId: 't', offset: 10, bytes: bytes(10) })).error,
    /顺序/);
  assert.match((await h.call('a', 'file-chunk', { transferId: 't', offset: 0, bytes: bytes(600 * 1024) })).error,
    /分片/);
  assert.match((await h.call('a', 'file-chunk', { transferId: 't', offset: 0, bytes: bytes(41) })).error,
    /超出大小/);
  // 窗口：一条都不等回执、连着塞第 5 片，第 5 片要被拒（前 4 片还在路上）。
  // 收端 20ms 后才回，所以前 4 片的确认一定还在路上。
  h.answer('b', 'file-in-part', () => new Promise(resolve => {
    setTimeout(() => resolve({ ok: true }), 20);
  }));
  const sends = [];
  for (let index = 0; index < WINDOW + 1; index += 1) {
    sends.push(h.call('a', 'file-chunk', { transferId: 't', offset: index * 5, bytes: bytes(5) }));
  }
  const replies = await Promise.all(sends);
  assert.equal(replies.filter(reply => reply.ok).length, WINDOW);
  assert.match(replies.at(-1).error, /过快/);
});

test('接收方中途出错：发送方立刻知道，对方也收到"这一趟没了"', async () => {
  const h = harness();
  h.answer('b', 'file-in', () => ({ ok: true }));
  h.answer('b', 'file-in-part', () => ({ ok: false, error: '磁盘满了' }));
  await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 10 });
  assert.deepEqual(await h.call('a', 'file-chunk', { transferId: 't', offset: 0, bytes: bytes(10) }),
    { ok: false, error: '磁盘满了' });
  assert.equal(h.relay.size(), 0);
  assert.deepEqual(h.pushed.find(row => row.event === 'file-in-cancel').payload,
    { transferId: 't', reason: '磁盘满了' });
});

test('文件没传完就 file-end：拒绝，不冒充成功', async () => {
  const h = harness();
  acceptAll(h);
  await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 30 });
  await h.call('a', 'file-chunk', { transferId: 't', offset: 0, bytes: bytes(10) });
  assert.match((await h.call('a', 'file-end', { transferId: 't' })).error, /没有传完/);
});

test('取消：哪一端取消，另一端都会收到通知', async () => {
  const h = harness();
  acceptAll(h);
  await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 10 });
  assert.deepEqual(await h.call('a', 'file-cancel', { transferId: 't', reason: '已取消' }), { ok: true });
  assert.deepEqual(h.pushed.find(row => row.event === 'file-in-cancel').payload,
    { transferId: 't', reason: '已取消' });
  // 反过来：接收方取消，发送方收到。
  await h.call('a', 'file-offer', { transferId: 't2', targetId: 'b', name: 'a', size: 10 });
  await h.call('b', 'file-cancel', { transferId: 't2' });
  assert.equal(h.pushed.filter(row => row.event === 'file-in-cancel').at(-1).to, 'a');
  assert.equal(h.relay.size(), 0);
});

test('断线：这一趟结束，另一端收到"对方已离线"，表里不留东西', async () => {
  const h = harness();
  acceptAll(h);
  await h.call('a', 'file-offer', { transferId: 't', targetId: 'b', name: 'a', size: 10 });
  h.disconnect('a');
  assert.equal(h.relay.size(), 0);
  assert.deepEqual(h.pushed.at(-1), { to: 'b', event: 'file-in-cancel',
    payload: { transferId: 't', reason: '对方已离线' } });
});

test('同时发太多会被挡住（有上限才不会被拿来当跳板）', async () => {
  const h = harness();
  acceptAll(h);
  assert.equal((await h.call('a', 'file-offer', { transferId: 't1', targetId: 'b', name: 'a', size: 10 })).ok, true);
  assert.equal((await h.call('a', 'file-offer', { transferId: 't2', targetId: 'b', name: 'a', size: 10 })).ok, true);
  assert.equal((await h.call('a', 'file-offer', { transferId: 't3', targetId: 'b', name: 'a', size: 10 })).ok, true);
  assert.match((await h.call('a', 'file-offer', { transferId: 't4', targetId: 'b', name: 'a', size: 10 })).error,
    /太多/);
});

test('广播操作符的回执是数组：服务端要取第一个，否则每一趟都被判成"对方无法接收文件"', async () => {
  // 2026-09-21 真机排出来的根因：`io.to(room).timeout().emitWithAck()` 解析出来是 `[ack]`，
  // 服务端原来直接读 `answer.ok` → `undefined` → 一律回「对方无法接收文件」，
  // 而对方其实每次都回了 `{ ok: true }`（服务端日志里 `isArray: true`）。
  const h = harness();
  acceptAll(h);
  assert.deepEqual(await h.call('a', 'file-offer',
    { transferId: 'arr', targetId: 'b', name: 'a.txt', size: 10 }), { ok: true },
  '回执是数组时也要认，不能因为读不到 .ok 就拒收');
  // 多个 ack（理论上一个 room 里多个 socket）也只认第一个，不该崩。
  h.answer('b', 'file-in', () => ({ ok: true }));
  assert.equal((await h.call('a', 'file-chunk',
    { transferId: 'arr', offset: 0, bytes: bytes(10) })).ok, true, '转发分片也要认数组回执');
  assert.deepEqual((await h.call('a', 'file-end', { transferId: 'arr' })).ok, true);
});

test('服务器不落盘：这条链路上没有任何文件系统调用', () => {
  for (const forbidden of ['node:fs', "require('fs')", 'createWriteStream', 'writeFileSync', 'mkdirSync']) {
    assert.equal(SOURCE.includes(forbidden), false, `服务器不该出现 ${forbidden}`);
  }
});
