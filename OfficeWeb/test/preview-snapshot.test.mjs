// 低清工位预览在**真服务端**上的接线：谁推了一帧、谁能收到、以及"最后一张"能不能
// 交给后来的人（用户 2026-09-18：「不在的话用最后一张 不要在办公室还关着屏幕」）。
//
// 这是 `preview-relay.test.mjs` 之外的端到端一版：那个测的是中继自己的规则，这里测的是
// server.mjs 有没有把中继接对（join 快照、ambient-sharing、访客兜底、限速）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { io } from 'socket.io-client';
import { withServer, wait } from './helpers.mjs';

const JPEG = 'data:image/jpeg;base64,AAAA';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 收集某个 socket 收到的 preview 事件。 */
function watchPreview(socket) {
  const seen = [];
  socket.on('preview', (payload) => seen.push(payload));
  return seen;
}

/** 员工得有工位才会广播低清预览（服务端就是这么判的），所以先占一个。 */
async function sitDown(socket, seat) {
  const reply = await socket.emitWithAck('seat', seat);
  assert.equal(reply.ok, true, '测试夹具要拿到工位：' + JSON.stringify(reply));
  socket.emit('ambient-sharing', true);
  await wait(30);
}

test('推一帧：自己收到回显、开着接收的人也收到；关掉接收的人不打扰', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('甲');
    const b = await connect('乙');
    const c = await connect('丙');
    await sitDown(a, 0);
    c.emit('preview-allowed', false);
    await wait(50);
    const seenA = watchPreview(a), seenB = watchPreview(b), seenC = watchPreview(c);
    a.emit('preview', JPEG);
    await wait(80);
    const idOf = (name) => peopleOf(a).find(person => person.name === name)?.id;
    assert.deepEqual(seenA.map(row => row.id), [idOf('甲')], '自己的工位显示器也要亮');
    assert.deepEqual(seenB.map(row => row.id), [idOf('甲')]);
    assert.deepEqual(seenC, [], '关掉接收的人不该收到');
    assert.equal(seenB[0].image, JPEG);
  });
});

test('后来的人一进来就拿到别人的最后一张（不用等下一个人采集）', async () => {
  await withServer(async ({ connect, port }) => {
    const a = await connect('甲');
    await sitDown(a, 0);
    a.emit('preview', JPEG);
    await wait(80);
    // 甲走开了：客户端暂停采集，什么都不发（既不发帧，也不发 ambient-sharing:false）。
    // 这时候乙才进来——监听要在 join 之前挂好，因为快照是 join 那一刻就推的。
    const b = io(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
    const seenB = watchPreview(b);
    try {
      await new Promise((resolve) => b.on('connect', () => {
        b.emit('join', { name: '乙' });
        resolve();
      }));
      await wait(150);
      assert.equal(seenB.length, 1, '刚进来的客户端该立刻看到甲的最后一张，而不是黑屏');
      assert.equal(seenB[0].image, JPEG);
      assert.equal(seenB[0].id, a.id, 'id 是甲现在的 socket id');
    } finally {
      b.disconnect();
    }
  });
});

test('走开/采集失败（ambient-sharing:false）之后，最后一张仍然补给后来的人', async () => {
  await withServer(async ({ connect, port }) => {
    const a = await connect('甲');
    await sitDown(a, 0);
    a.emit('preview', JPEG);
    await wait(80);
    // 采集失败（比如显示器关掉了）会让客户端发 ambient-sharing:false；这时不能把画面
    // 丢掉——用户 2026-09-18：「不在的话用最后一张 不要在办公室还关着屏幕」。
    a.emit('ambient-sharing', false);
    await wait(80);
    const b = io(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
    const seenB = watchPreview(b);
    try {
      await new Promise((resolve) => b.on('connect', () => {
        b.emit('join', { name: '乙' });
        resolve();
      }));
      await wait(150);
      assert.deepEqual(seenB.filter(row => row.image).map(row => row.image), [JPEG],
        '甲现在没在广播，但最后那一张还在');
    } finally {
      b.disconnect();
    }
  });
});

test('访客推来的帧服务端直接丢掉（只允许"清空"过去）', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲');
    const visitor = await connect('访客丁', { role: 'visitor' });
    const seenA = watchPreview(a);
    visitor.emit('ambient-sharing', true);
    await wait(50);
    visitor.emit('preview', JPEG);
    await wait(80);
    assert.equal(seenA.filter(row => row.image).length, 0, '访客永远不广播低清预览');
  });
});

test('限速：400ms 内只收一帧', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲');
    const b = await connect('乙');
    await sitDown(a, 0);
    const seenB = watchPreview(b);
    a.emit('preview', JPEG);
    await delay(20);
    a.emit('preview', JPEG);
    await wait(80);
    assert.equal(seenB.length, 1, '连推两帧只转发第一帧');
  });
});

test('有人来看我了：被看的人收到 watched（带名字和外观），别人收不到', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲');
    const look = { color: 'navy', accessories: { glasses: 'black', hair: 'short', beard: 'none', hat: 'none' } };
    const b = await connect('乙', { appearance: look });
    await sitDown(a, 0);
    await sitDown(b, 1);
    const watchedA = [], watchedB = [];
    a.on('watched', payload => watchedA.push(payload));
    b.on('watched', payload => watchedB.push(payload));
    b.emit('preview-watch', { target: a.id });
    await wait(80);
    assert.equal(watchedA.length, 1, '甲该看到"有人来看我了"');
    assert.equal(watchedA[0].name, '乙', '顺便告诉他是谁');
    assert.deepEqual(watchedA[0].appearance, look, '还要带配色与配件：小窗要照他的样子把他拉出来演动作');
    assert.deepEqual(watchedB, [], '看的人自己不该收到');
    // 自己看自己：不该有任何人收到。
    a.emit('preview-watch', { target: a.id });
    await wait(80);
    assert.equal(watchedA.length, 1);
  });
});
