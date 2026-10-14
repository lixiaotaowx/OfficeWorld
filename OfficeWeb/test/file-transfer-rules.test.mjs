// 文件直传的网页侧纯规则 + 几条"别再退化"的源码断言（用户 2026-09-22 要求的功能）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// 和别的纯规则测试一样：把 .ts 转译出来再 import（Node 不直接认 TypeScript）。
const js = ts.transpileModule(
  readFileSync(fileURLToPath(new URL('../src/fileTransferRules.ts', import.meta.url)), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const {
  DONE_KEEP_MS, MAX_FINISHED, barPercent, byteLengthOf, describeBinary, dockTransfers,
  formatBytes, headline, isActive, orderRows, percentOf, readableError, sameTransferRows,
  statusText, toBytes,
} = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));

const read = name => readFileSync(fileURLToPath(new URL(`../src/${name}`, import.meta.url)), 'utf8');

function row(overrides = {}) {
  return {
    id: 't1', direction: 'send', status: 'sending', peerId: 'b', peerName: '乙',
    name: '方案.pdf', size: 1000, transferred: 250, path: '', folder: '', url: '',
    error: '', at: 0, endedAt: 0, handle: 'f1', ...overrides,
  };
}

test('字节数人话：B / KB / MB / GB', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(999), '999 B');
  assert.equal(formatBytes(1024), '1.0 KB');
  assert.equal(formatBytes(1536), '1.5 KB');
  assert.equal(formatBytes(20 * 1024), '20 KB');
  assert.equal(formatBytes(5 * 1024 ** 2), '5.0 MB');
  assert.equal(formatBytes(3 * 1024 ** 3), '3.0 GB');
  assert.equal(formatBytes(-5), '0 B');
});

test('进度：0..1，且大小未知也不会除出 NaN', () => {
  assert.equal(percentOf({ transferred: 250, size: 1000 }), 0.25);
  assert.equal(percentOf({ transferred: 2000, size: 1000 }), 1, '超出也夹到 1');
  assert.equal(percentOf({ transferred: 10, size: 0 }), 0);
});

test('状态是否"还在传"：只有发送中/接收中算', () => {
  assert.equal(isActive(row()), true);
  assert.equal(isActive(row({ status: 'receiving' })), true);
  for (const status of ['done', 'failed', 'cancelled']) assert.equal(isActive(row({ status })), false);
});

test('文案说清方向、进度和落点', () => {
  assert.match(headline(row()), /正在发送给 乙/);
  assert.match(headline(row({ direction: 'receive' })), /乙 发来的文件/);
  assert.match(statusText(row()), /正在发送 · 250 B \/ 1000 B/);
  assert.match(statusText(row({ direction: 'receive', status: 'receiving' })), /正在接收/);
  assert.match(statusText(row({ status: 'done' })), /已送达/);
  assert.match(statusText(row({ status: 'done', direction: 'receive', folder: 'D:\\收' })),
    /已存到 D:\\收/);
  assert.match(statusText(row({ status: 'done', direction: 'receive' })), /已下载/);
  assert.equal(statusText(row({ status: 'failed', error: '磁盘满了' })), '磁盘满了');
  assert.equal(statusText(row({ status: 'failed' })), '传输中断');
  assert.equal(statusText(row({ status: 'cancelled' })), '已取消');
});

test('任务栏那条进度：同时传的按字节合并；传完还留一小会儿满格', () => {
  assert.equal(barPercent([]), 0);
  const one = [row({ transferred: 250, size: 1000 })];
  assert.equal(barPercent(one), 0.25);
  const two = [row({ id: 'a', transferred: 100, size: 200 }), row({ id: 'b', transferred: 0, size: 200 })];
  assert.equal(barPercent(two), 0.25, '按字节数合并，不是简单取平均');
  // 刚传完：满格，而且不会在最后一片到位的同一瞬间就消失。
  const done = [row({ status: 'done', transferred: 1000, endedAt: 100 })];
  assert.equal(barPercent(done, 100), 1);
  assert.equal(barPercent(done, 100 + DONE_KEEP_MS - 1), 1);
  assert.equal(barPercent(done, 100 + DONE_KEEP_MS), 0);
  assert.equal(barPercent([row({ status: 'failed' })]), 0, '失败不留满格');
});

test('推给头像条的那一份：正在传的一直在，完事的只留一小会儿，最多 8 条', () => {
  const rows = [
    row({ id: 'active' }),
    row({ id: 'just-done', status: 'done', endedAt: 100 }),
    row({ id: 'old-done', status: 'done', endedAt: 0 }),
    row({ id: 'cancelled', status: 'cancelled', endedAt: 100 }),
  ];
  const summary = dockTransfers(rows, 100 + DONE_KEEP_MS - 1).map(item => item.id);
  assert.deepEqual(summary, ['active', 'just-done']);
  assert.deepEqual(dockTransfers(rows, 100 + DONE_KEEP_MS).map(item => item.id), ['active']);
  assert.equal(dockTransfers(Array.from({ length: 20 }, (_, index) =>
    row({ id: `t${index}` })), 0).length, 8);
  const failed = dockTransfers([row({ status: 'failed', endedAt: 100 })], 100)[0];
  assert.deepEqual({ percent: failed.percent, failed: failed.failed, done: failed.done },
    { percent: 0.25, failed: true, done: false });
});

test('内容没变就认定没变：进度一动才算变（省掉大量无谓渲染）', () => {
  const left = [row()];
  assert.equal(sameTransferRows(left, [row()]), true);
  assert.equal(sameTransferRows(left, [row({ transferred: 251 })]), false);
  assert.equal(sameTransferRows(left, [row({ status: 'done' })]), false);
  assert.equal(sameTransferRows(left, [row(), row({ id: 't2' })]), false);
  assert.equal(sameTransferRows(left, left), true);
});

test('面板排序：正在传的排前面，完事的只留最近几条', () => {
  const rows = [
    row({ id: 'd1', status: 'done' }), row({ id: 'a1' }),
    row({ id: 'd2', status: 'done' }), row({ id: 'a2', status: 'receiving' }),
  ];
  assert.deepEqual(orderRows(rows).map(item => item.id), ['a1', 'a2', 'd1', 'd2']);
  const many = Array.from({ length: MAX_FINISHED + 3 }, (_, index) => row({ id: `d${index}`, status: 'done' }));
  assert.equal(orderRows(many).length, MAX_FINISHED);
});

test('二进制分片：ArrayBuffer / Uint8Array / Buffer 形状都要认（别再读 .length）', async () => {
  // 用户 2026-09-21 报障「对方无法接收文件，接收方出现了进度条显示没有进度」的**根因**：
  // socket.io-client 的浏览器构建（页面和客户端渲染进程用的就是它）默认
  // `binaryType = "arraybuffer"`，收端拿到的是 `ArrayBuffer` —— 它**只有 `byteLength`，
  // 没有 `.length`**。谁读 `.length` 判长度，就会把每一片都判成"无效分片"。
  const payload = Uint8Array.from([1, 2, 3, 4]);
  const shapes = [
    ['Uint8Array', payload, 'Uint8Array'],
    ['ArrayBuffer', payload.buffer.slice(0), 'ArrayBuffer'],
    ['DataView', new DataView(payload.buffer.slice(0)), 'DataView'],
    ['Blob', new Blob([payload]), 'Blob'],
    ['socket.io 老式 Buffer 形状', { type: 'Buffer', data: [1, 2, 3, 4] }, 'object'],
  ];
  for (const [label, value, kind] of shapes) {
    const bytes = await toBytes(value);
    assert.deepEqual([...bytes], [1, 2, 3, 4], `${label} 要能取出正确的字节`);
    assert.equal(byteLengthOf(value), 4, `${label} 的字节数要量得出来`);
    assert.equal(describeBinary(value), kind, `${label} 的类型要说得清`);
  }
  // ArrayBuffer 上确实没有 .length：这条断言就是"为什么必须走 toBytes"。
  assert.equal(payload.buffer.length, undefined,
    'ArrayBuffer 没有 .length —— 读它必然判成"无效分片"');
  // 脏数据不抛异常，交给调用方报错。
  for (const junk of [null, undefined, 0, 'x', {}]) {
    assert.deepEqual([...(await toBytes(junk))], [], `${String(junk)} 应当退化成空数组`);
  }
  // 子视图只取它自己那一段，别把整个底层 buffer 端出来。
  const sliced = new Uint8Array(payload.buffer, 1, 2);
  assert.deepEqual([...(await toBytes(sliced))], [2, 3]);
});

test('聊天框的下载复用同一条通道（用户 2026-09-21：「要带进度条…打开等 复用」）', () => {
  const panel = read('ChatPanel.tsx');
  // 下载走的是文件直传那条通道，所以进度条、任务栏、卡片、接收文件夹全都是现成的。
  assert.match(panel, /files\.downloadAttachment\(\{/, '聊天附件要靠传输通道下载');
  assert.match(panel, /files\.open\(file\.id\)/, '下完要有「打开」');
  assert.match(panel, /files\.reveal\(file\.id\)/, '下完要有「打开文件夹」');
  assert.match(panel, /files\.cancel\(file\.id\)/, '下到一半要能取消');
  assert.match(panel, /chat-file-bar/, '聊天里要有进度条');
  assert.match(panel, /\/api\/chat\/files\//, '数据来源是聊天附件的 HTTP 流');
  assert.match(panel, /<a href=\{url\} download=/, '小附件的「另存一份」保留');
  // 通道那边：行 id 用附件 id，才能让聊天那一条和传输那一条对上。
  const engine = read('fileTransfer.ts');
  assert.match(engine, /async function downloadAttachment/, '通道要提供下载');
  assert.match(engine, /peerId: '', peerName: '聊天'/, '下载也要登记成一条接收记录');
  assert.match(engine, /source: 'chat'/, '要标出来源是聊天');
  assert.match(read('useFileTransfers.ts'), /downloadAttachment: channel\.downloadAttachment/);
  assert.match(read('App.tsx'), /files=\{office\.files\}/, '页面要把这条通道传给聊天面板');
});

test('头像条拖拽失败必须说出来（用户 2026-09-21 报「头像拖拽上去发送的功能不行」后加）', () => {
  const dock = read('dock.tsx');
  // 原来做不到就静默 return，用户那边一点反应都没有，分不清是"拖拽没进来"还是"进来了发不出去"。
  assert.match(dock, /carriesFiles/, '要有一个"这一拖带没带文件"的判断');
  assert.match(dock, /dock-notice/, '条子上要有一句话说明结果');
  assert.match(dock, /客户端太旧/, '老客户端要有明确提示');
  assert.match(dock, /这一拖没有文件/, '没有真实路径也要说');
  assert.match(dock, /这是你自己/, '拖到自己头像上也要说');
  assert.match(dock, /请拖到同事的头像上/, '拖在空隙上也要说');
  // **高亮不看 `canDrop`**：连亮都不亮就说明拖拽根本没进到这个窗口——这条线索最值钱。
  assert.match(dock, /if \(!carriesFiles\(event\)\) return;\s*\n\s*event\.preventDefault\(\);[\s\S]{0,200}if \(row\.self\) return;/,
    '只要带着文件就先 preventDefault 并高亮，不能先判 canDrop');
  // 条子宽度变了要重报一次，否则那句话说出去会被窗口裁掉。
  assert.match(dock, /\}, \[hovered, state, greet, dropNotice, cardPx, meetingPerson, statusMenu\]\)/);
});

test('错误信息要能看懂：剥掉 Electron 的 invoke 外壳（真机实测它直接漏到卡片上了）', () => {
  // 实际见到的原文：Error invoking remote method 'office:file-send-open': Error: 空文件无法发送
  assert.equal(readableError(new Error(
    "Error invoking remote method 'office:file-send-open': Error: 空文件无法发送")), '空文件无法发送');
  assert.equal(readableError(new Error(
    "Error invoking remote method 'office:file-receive-open': Error: 接收文件夹不可用，请在设置里重新选择")),
  '接收文件夹不可用，请在设置里重新选择');
  // 没有外壳的原样返回；不是 Error 的也别炸。
  assert.equal(readableError(new Error('对方不在线，文件没有发出去')), '对方不在线，文件没有发出去');
  assert.equal(readableError('就是一句话'), '就是一句话');
  assert.equal(readableError(null), '操作失败');
  assert.equal(readableError(new Error('   ')), '操作失败');
});

test('失败的那条卡片不许再说"正在发送"（真机实测自相矛盾）', () => {
  assert.equal(headline(row({ status: 'sending' })), '正在发送给 乙');
  assert.equal(headline(row({ status: 'done' })), '已发送给 乙');
  assert.equal(headline(row({ status: 'failed', error: '空文件无法发送' })), '发送给 乙');
  assert.equal(headline(row({ status: 'cancelled' })), '发送给 乙');
  assert.equal(headline(row({ direction: 'receive', status: 'failed' })), '乙 发来的文件');
});

test('两端都由主窗口推进度：头像条只画、不连 socket（别退化）', () => {
  const dock = read('dock.tsx');
  assert.match(dock, /officeDock\?\.filePaths/, '小窗要能把拖进来的文件换成真路径');
  assert.match(dock, /officeDock\?\.dropFiles/, '小窗把路径交给主进程去发');
  assert.match(dock, /dock-progress/, '头像条底下要有那条进度线');
  for (const forbidden of ['socket.io', 'useOffice', 'getDisplayMedia']) {
    assert.equal(dock.includes(forbidden), false, `小窗不许出现 ${forbidden}`);
  }
  // 白名单清洗漏字段是这里踩过三次的坑：进度字段要在 dock-bridge 的清洗里。
  const bridge = readFileSync(fileURLToPath(new URL('../../OfficeDesktop/dock-bridge.cjs', import.meta.url)), 'utf8');
  assert.match(bridge, /transfers:/, 'dock-bridge 的白名单必须带上 transfers');
  assert.match(bridge, /office:dock-files/, '拖拽要能从主进程转给主窗口');
  assert.match(read('useDockBridge.ts'), /transfers: current\.transfers/, '主窗口要把进度推给小窗');
});

test('接收方没有"同意"这一步：直接开文件写盘（需求原话"不需要对方同意"）', () => {
  const engine = read('fileTransfer.ts');
  assert.match(engine, /receiveOpen/, '收到 file-in 就开文件，不弹确认');
  assert.equal(/(confirm|window\.confirm|accept\?)/.test(engine), false, '不许有"是否接收"的询问');
  // 发送那一半搬去了 fileSend.ts（fileTransfer.ts 一度贴着 500 行上限）。
  assert.match(read('fileSend.ts'), /file-offer/, '拖拽之后直接 offer');
  // **卡片先立、文件后开**：读不了也要留下带原因的一条（用户 2026-09-21 报障）。
  assert.match(read('fileSend.ts'),
    /ctx\.place\(\{[\s\S]{0,400}opened = await ctx\.bridge\(\)\?\.sendOpen\(/,
    '先 place 再 sendOpen，失败才不会什么都不显示');
  // 完事的两个按钮都要在面板上（用户："完事有打开和打开文件夹的功能"）。
  const panel = read('FileTransferPanel.tsx');
  assert.match(panel, />打开</);
  assert.match(panel, />打开文件夹</);
});

test('接收文件夹可以在设置里改（用户："设置里面可以改"）', () => {
  const setting = read('FileReceiveSetting.tsx');
  assert.match(setting, /chooseFolder/);
  assert.match(setting, /接收文件夹/);
  assert.match(read('SettingsDialog.tsx'), /<FileReceiveSetting \/>/);
});
