// 流式下载的小核心：一块一块地搬、顺序对、错误分得清。
// 聊天下载（`/api/chat/files/:id`）走的就是它（用户 2026-09-21 要求"下载要带进度条"）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

// 走共享的转译助手，不要直接 `import '../src/x.ts'`：那要靠 Node 的类型剥离，
// 版本不同行为就不同（项目里其它测试一律自己转译）。
const { DownloadGoneError, streamResponse } = await import(await loadTs('downloadStream.ts'));

/** 假响应：按 `chunk` 切块吐出来。 */
function respond(bytes, { status = 200, chunk = 7, headers = {} } = {}) {
  return async () => {
    if (status !== 200) return new Response(null, { status });
    let offset = 0;
    const body = new ReadableStream({
      pull(controller) {
        if (offset >= bytes.length) { controller.close(); return; }
        controller.enqueue(new Uint8Array(bytes.subarray(offset, offset + chunk)));
        offset += chunk;
      },
    });
    return new Response(body, {
      status, headers: { 'content-length': String(bytes.length), ...headers } });
  };
}

test('按块搬完整：顺序正确、块边界不影响内容、返回收到的字节数', async () => {
  const source = Buffer.from(Array.from({ length: 100 }, (_, index) => index));
  const chunks = [];
  const result = await streamResponse({
    url: '/api/chat/files/x', fetchImpl: respond(source, { chunk: 7 }),
    onChunk: bytes => { chunks.push(Buffer.from(bytes)); },
  });
  assert.equal(result.received, 100);
  assert.equal(result.declared, 100);
  assert.equal(chunks.length, 15, '100 字节按 7 字节切：14 个满块 + 1 个剩 2 字节');
  assert.ok(Buffer.concat(chunks).equals(source), '拼起来要逐字节等于源');
});

test('回调是 await 的：写盘慢会拖慢读取（天然背压），不会先把整条流吞进内存', async () => {
  const source = Buffer.alloc(50, 1);
  const order = [];
  await streamResponse({
    url: '/x', fetchImpl: respond(source, { chunk: 10 }),
    onChunk: async bytes => {
      order.push(`start:${bytes.length}`);
      await new Promise(resolve => setTimeout(resolve, 1));
      order.push('end');
    },
  });
  // 每次回调都必须先结束，下一次才会开始——这就是背压。
  assert.deepEqual(order.slice(0, 4), ['start:10', 'end', 'start:10', 'end']);
});

test('服务器没有这一份（404/410）单独报错：这是"过期了"，重试也没用', async () => {
  for (const status of [404, 410]) {
    await assert.rejects(
      streamResponse({ url: '/x', fetchImpl: respond(null, { status }), onChunk: () => {} }),
      error => error instanceof DownloadGoneError && /7 天/.test(error.message));
  }
});

test('其它 HTTP 错误如实报出来（带上状态码），不冒充"过期"', async () => {
  await assert.rejects(
    streamResponse({ url: '/x', fetchImpl: respond(null, { status: 500 }), onChunk: () => {} }),
    error => !(error instanceof DownloadGoneError) && /500/.test(error.message));
});

test('没有 Content-Length 也照搬（declared 为 0，进度条退回按已知大小算）', async () => {
  const source = Buffer.alloc(20, 2);
  const chunks = [];
  const result = await streamResponse({
    url: '/x', fetchImpl: respond(source, { headers: { 'content-length': '' } }),
    onChunk: bytes => { chunks.push(bytes); },
  });
  assert.equal(result.declared, 0);
  assert.equal(Buffer.concat(chunks.map(Buffer.from)).length, 20);
});

test('响应头先回调一次：调用方据此校正进度条总量', async () => {
  let declared = -1;
  await streamResponse({
    url: '/x', fetchImpl: respond(Buffer.alloc(33, 3)),
    onStart: info => { declared = info.declared; },
    onChunk: () => {},
  });
  assert.equal(declared, 33);
});
