// 文件直传的**端到端**测试：真的用 file-relay.mjs 做服务器，两端各挂一个
// createFileTransferChannel，并且**按浏览器的样子投递**二进制。
//
// 为什么必须这么写（用户 2026-09-21 报障：「对方无法接收文件，接收方出现了进度条显示没有进度」）：
// `socket.io-client` 的浏览器构建（页面和 Electron 渲染进程用的就是它）默认
// `binaryType = "arraybuffer"`，所以收端拿到的是 **ArrayBuffer**；而它的 `.length` 是
// `undefined`。谁要是用 `.length` 判分片长度，就会把每一片都判成"无效"，进度条永远停在 0。
// 这个套件专门把"投递时转成 ArrayBuffer"写进 harness，并断言转换确实发生过——
// 否则测试会在不知不觉中失去覆盖（退回 Buffer，Bug 就藏起来了）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { createFileRelay } from '../file-relay.mjs';
import { loadTs } from './helpers.mjs';

// 引擎自己 import 了 fileTransferRules / downloadStream，交给共享的转译助手递归处理
// （data URL 模块解析不了 `./x`）。
const { createFileTransferChannel } = await import(await loadTs('fileTransfer.ts'));

const SIZE = 300 * 1024;                       // 跨两片（CHUNK_BYTES = 256 KB）
const SOURCE = Buffer.alloc(SIZE);
for (let index = 0; index < SIZE; index += 1) SOURCE[index] = (index * 31 + 7) & 0xff;

/** 模拟浏览器收到的二进制：视图 → ArrayBuffer（引擎的 mapBinary 就是这么做的）。 */
function toArrayBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
  return value;
}

function harness() {
  const clients = new Map();
  const delivered = { arrayBuffers: 0 };
  const sockets = new Map();

  function socketFor(id) {
    const handlers = new Map();
    const socket = {
      id, connected: true,
      on: (event, fn) => handlers.set(event, fn),
      emit: (event, payload, ack) => {
        // 客户端 → 服务器的事件（比如 file-cancel）。有 ack 就立刻回一句。
        const handler = handlers.get(event);
        if (handler && ack) handler(payload, ack);
      },
      // 客户端 → 服务器的 emitWithAck
      timeout: () => ({
        emitWithAck: (event, payload) => new Promise((resolve, reject) => {
          const handler = handlers.get(event);
          if (!handler) return reject(Error(`no handler for ${event}`));
          handler(payload, resolve);
        }),
      }),
      handlers,
    };
    sockets.set(id, socket);
    return socket;
  }

  const people = new Map([
    ['a', { id: 'a', clientId: 'acc-a', name: '甲', character: '' }],
    ['b', { id: 'b', clientId: 'acc-b', name: '乙', character: '' }],
  ]);

  const io = {
    to: targetId => ({
      emit: (event, payload) => { void deliver(targetId, event, payload); },
      // **必须回数组**：真的 socket.io 里广播操作符的 `emitWithAck` 解析出来是 `[ack]`，
      // 哪怕 room 里只有一个 socket。以前这里回单个对象，于是"服务端把数组当对象读"
      // 这个 Bug 一点都测不出来（2026-09-21 真机上才查出来）。别简化回单个对象。
      timeout: () => ({ emitWithAck: async (event, payload) =>
        [await deliver(targetId, event, payload)] }),
    }),
  };

  /** 服务器 → 客户端：**按浏览器的形状**投递（二进制转 ArrayBuffer）。 */
  function deliver(targetId, event, payload) {
    clients.set(targetId, true);
    return new Promise((resolve, reject) => {
      const handler = sockets.get(targetId)?.handlers.get(event);
      if (!handler) return reject(Error(`no client handler for ${event}`));
      const shaped = payload && typeof payload === 'object' ? { ...payload } : payload;
      if (shaped?.bytes) {
        const before = shaped.bytes;
        shaped.bytes = toArrayBuffer(before);
        if (shaped.bytes instanceof ArrayBuffer && !(before instanceof ArrayBuffer)) {
          delivered.arrayBuffers += 1;
        }
      }
      handler(shaped, resolve);
    });
  }

  const relay = createFileRelay({ io, people });
  return { relay, socketFor, sockets, delivered, people };
}

/**
 * 一台机器的假桥：**同时**提供发送方和接收方两边的方法。
 *
 * 真实世界里两端各是一台机器、各有自己的 `window.officeDesktop.files`；测试里只有一个
 * `globalThis.window`，所以必须合成一个对象——分成两个的话，接收方在取消/收尾时会拿到
 * 发送方那个缺少 `receiveCancel` 的桥（第一版就是这么写错的）。
 */
function bridgeFor(overrides = {}) {
  const chunks = [];
  let written = 0;
  let sequence = 0;
  return {
    /** 收进来的字节，用来逐字节核对。 */
    chunks,
    get written() { return written; },
    // ---- 发送方 ----
    sendOpen: async () => {
      sequence += 1;
      return { id: `h${sequence}`, name: 'demo.bin', size: SOURCE.length, path: 'C:\\demo.bin' };
    },
    sendRead: async (_id, offset, length) =>
      new Uint8Array(SOURCE.subarray(offset, offset + length)),
    sendClose: async () => true,
    // ---- 接收方 ----
    receiveOpen: async ({ name }) => ({ ok: true, savedName: String(name), folder: 'D:\\接收' }),
    receiveWrite: async (_id, bytes) => {
      chunks.push(Buffer.from(bytes));
      written += bytes.length;
      return { ok: true, written };
    },
    receiveEnd: async () => ({ ok: true, path: 'D:\\接收\\demo.bin',
      savedName: 'demo.bin', folder: 'D:\\接收' }),
    receiveCancel: async () => true,
    // ---- 其它 ----
    settings: async () => ({ receiveDir: 'D:\\接收' }),
    progress: async () => true,
    alert: async () => true,
    open: async () => true,
    reveal: async () => true,
    openFolder: async () => true,
    ...overrides,
  };
}

/** 装一个假 window（引擎从它上面取 officeDesktop.files）。 */
function installWindow(files) {
  const previous = globalThis.window;
  globalThis.window = { officeDesktop: { files, alert: async () => true } };
  return () => { globalThis.window = previous; };
}

const settle = async (times = 60) => {
  for (let index = 0; index < times; index += 1) await new Promise(resolve => setImmediate(resolve));
};

/** 把两端都装好，返回这次要核对的东西。 */
function connected(files, notes = []) {
  const h = harness();
  const restore = installWindow(files);
  const sender = createFileTransferChannel({ notify: message => notes.push(message) });
  sender.attach(h.socketFor('a'));
  h.relay.attach(h.sockets.get('a'));
  const receiver = createFileTransferChannel({ notify: message => notes.push(message) });
  receiver.attach(h.socketFor('b'));
  h.relay.attach(h.sockets.get('b'));
  return { h, sender, receiver, restore };
}

test('端到端：拖一下就把文件发完，接收方按 ArrayBuffer 收片也能逐字节对上', async () => {
  const files = bridgeFor();
  const { h, sender, receiver, restore } = connected(files);
  await sender.sendFiles('b', ['C:\\demo.bin'], '乙');
  await settle();
  restore();

  // harness 必须真的按浏览器那样投过 ArrayBuffer，否则这条测试就白测了。
  assert.ok(h.delivered.arrayBuffers >= 2,
    `应该至少有两片是以 ArrayBuffer 投递的，实际 ${h.delivered.arrayBuffers}`);

  const sent = sender.snapshot()[0];
  assert.equal(sent.status, 'done', `发送方应当成功，实际 ${sent.status}：${sent.error}`);
  assert.equal(sent.transferred, SOURCE.length);

  const got = receiver.snapshot()[0];
  assert.equal(got.status, 'done', `接收方应当成功，实际 ${got.status}：${got.error}`);
  assert.equal(got.transferred, SOURCE.length);
  assert.equal(got.folder, 'D:\\接收');

  const joined = Buffer.concat(files.chunks);
  assert.equal(joined.length, SOURCE.length, '收到的字节数要和源文件一致');
  assert.ok(joined.equals(SOURCE), '收到的内容要逐字节等于源文件');
  assert.ok(files.chunks.length >= 2, '应当分成了多片传输');
});

test('端到端：整个传输过程都不会出现"无效的文件分片"', async () => {
  const notes = [];
  const files = bridgeFor();
  const { sender, restore } = connected(files, notes);
  await sender.sendFiles('b', ['C:\\demo.bin'], '乙');
  await settle();
  restore();

  const complaints = [...notes, ...sender.snapshot().map(row => row.error)]
    .filter(text => text && /无效的文件分片|无法接收|没有响应/.test(text));
  assert.deepEqual(complaints, [], `不该有任何分片/接收失败：${complaints.join(' | ')}`);
});

test('端到端：接收方打不开接收文件夹时，发送方**立刻**收到原因（不再干等 60 秒）', async () => {
  const notes = [];
  // 这是最可能让接收方"有进度条但零进度"的真实故障之一：接收文件夹不可用。
  const files = bridgeFor({ receiveOpen: async () => ({ ok: false,
    error: '接收文件夹不可用，请在设置里重新选择' }) });
  const { sender, receiver, restore } = connected(files, notes);
  await sender.sendFiles('b', ['C:\\demo.bin'], '乙');
  await settle();
  restore();

  const sent = sender.snapshot()[0];
  assert.equal(sent.status, 'failed');
  assert.match(sent.error, /接收文件夹不可用/);
  assert.ok(notes.some(text => /接收文件夹不可用/.test(text)), '发送方要看到对方给的具体原因');
  // 接收方那张卡片也要写明原因，而不是永远停在 0%。
  assert.equal(receiver.snapshot()[0].status, 'failed');
  assert.match(receiver.snapshot()[0].error, /接收文件夹不可用/);
});

test('拖进来的东西读不了：也要留下**带原因的卡片**，不能什么都没有', async () => {
  // 用户 2026-09-21 报障「头像拖拽上去发送的功能不行」：小窗说"正在发给 XX"，但左下角
  // 什么都不出现。原因就是原来先 `sendOpen`、失败了连一条记录都不建——真正的原因只闪在
  // 底部状态栏里。现在顺序反过来：先立卡片，再开文件。
  const notes = [];
  const files = bridgeFor({ sendOpen: async () => { throw Error('暂时不能发送文件夹，请打包后再发'); } });
  const { sender, restore } = connected(files, notes);
  await sender.sendFiles('b', ['C:\\某个文件夹'], '乙');
  await settle();
  restore();

  const rows = sender.snapshot();
  assert.equal(rows.length, 1, '读不了也要有一条记录，好让人看见发生了什么');
  assert.equal(rows[0].status, 'failed');
  assert.match(rows[0].error, /文件夹/, '卡片上要写明原因');
  assert.equal(rows[0].name, '某个文件夹', '拿不到真名就先用路径最后一段');
  assert.equal(rows[0].path, 'C:\\某个文件夹');
  assert.ok(notes.some(text => /发送失败/.test(text)), '底部状态栏也要说');
});

test('端到端：分片大小不是 4 的倍数也不会错位（ArrayBuffer 切片边界）', async () => {
  const notes = [];
  const files = bridgeFor();
  const { sender, receiver, restore } = connected(files, notes);
  await sender.sendFiles('b', ['C:\\demo.bin'], '乙');
  await settle();
  restore();
  const joined = Buffer.concat(files.chunks);
  assert.ok(joined.equals(SOURCE), '任何切片边界下内容都要一致');
  assert.equal(receiver.snapshot()[0].transferred, SOURCE.length);
});

// ---- 聊天附件下载：复用同一条通道（用户 2026-09-21
//      「整理一下聊天框里面的文件下载，要带进度条，要软件内设置好下载位置，下载好了也还是有几个按钮 打开等 复用」）----

/** 假的聊天附件响应：分片吐出来，用来验证流式接收。 */
function stubFetch(bytes, { ok = true, status = 200, chunk = 64 * 1024 } = {}) {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => {
    if (!ok) return new Response(null, { status });
    let offset = 0;
    const stream = new ReadableStream({
      pull(controller) {
        if (offset >= bytes.length) { controller.close(); return; }
        controller.enqueue(new Uint8Array(bytes.subarray(offset, offset + chunk)));
        offset += chunk;
      },
    });
    return new Response(stream, { status: 200, headers: { 'content-length': String(bytes.length) } });
  };
  return () => { globalThis.fetch = previous; };
}

test('聊天附件下载：落到接收文件夹、进度走完、行 id 就是附件 id、还能拿到打开按钮', async () => {
  const files = bridgeFor();
  const restore = installWindow(files);
  const notes = [];
  const channel = createFileTransferChannel({ notify: message => notes.push(message) });
  const restoreFetch = stubFetch(SOURCE);
  const attachment = { id: 'att-1', name: '方案.pdf', size: SOURCE.length,
    url: '/api/chat/files/att-1' };
  await channel.downloadAttachment(attachment);
  restoreFetch();
  restore();

  const rows = channel.snapshot();
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(row.id, 'att-1', '行 id 就是附件 id：聊天那一条和传输那一条是同一个东西');
  assert.equal(row.source, 'chat');
  assert.equal(row.status, 'done', `应当成功，实际 ${row.status}：${row.error}`);
  assert.equal(row.folder, 'D:\\接收', '落到设置里的接收文件夹');
  assert.equal(row.path, 'D:\\接收\\demo.bin', '完事要有路径才能「打开 / 打开文件夹」');
  assert.ok(Buffer.concat(files.chunks).equals(SOURCE), '收到的内容逐字节等于服务器那一份');
  assert.ok(notes.some(text => /已下载到/.test(text)), '要告诉用户存到哪了');
});

test('聊天附件下载：服务器没有这个副本时，卡片写清原因（不是永远转圈）', async () => {
  const files = bridgeFor();
  const restore = installWindow(files);
  const notes = [];
  const channel = createFileTransferChannel({ notify: message => notes.push(message) });
  const restoreFetch = stubFetch(SOURCE, { ok: false, status: 410 });
  await channel.downloadAttachment({ id: 'att-gone', name: 'x.bin', size: 10, url: '/api/chat/files/x' });
  restoreFetch();
  restore();
  const row = channel.snapshot()[0];
  assert.equal(row.status, 'failed');
  assert.match(row.error, /7 天|过期/);
  assert.ok(notes.some(text => /下载失败/.test(text)));
});

test('聊天附件下载：下好之后再点不会重下一遍', async () => {
  const files = bridgeFor();
  const restore = installWindow(files);
  const channel = createFileTransferChannel({ notify: () => {} });
  const restoreFetch = stubFetch(SOURCE);
  const attachment = { id: 'att-2', name: 'a.bin', size: SOURCE.length, url: '/api/chat/files/a' };
  await channel.downloadAttachment(attachment);
  const writes = files.chunks.length;
  await channel.downloadAttachment(attachment);      // 已完成：直接返回
  assert.equal(files.chunks.length, writes, '已经下好就不该再传一遍');
  assert.equal(channel.snapshot().length, 1, '也不该多出一条记录');
  restoreFetch();
  restore();
});

