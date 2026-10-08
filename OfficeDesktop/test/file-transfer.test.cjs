// 文件直传的主进程那一半：接收文件夹设置、发送读盘、接收写盘、系统进度条、打开/打开文件夹。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createFileTransfer, safeName, freeName } = require('../file-transfer.cjs');

function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iruler-ft-'));
  const userData = path.join(root, 'userData');
  const downloads = path.join(root, 'Downloads');
  fs.mkdirSync(userData, { recursive: true });
  fs.mkdirSync(downloads, { recursive: true });
  const shellCalls = [];
  const progress = [];
  const picked = path.join(root, '我的接收');
  const deps = {
    app: { getPath: name => (name === 'userData' ? userData
      : name === 'downloads' ? downloads : root) },
    dialog: { showOpenDialog: async () => ({ canceled: false, filePaths: [picked] }) },
    shell: {
      openPath: target => { shellCalls.push({ open: target }); return Promise.resolve(''); },
      showItemInFolder: target => { shellCalls.push({ reveal: target }); },
    },
    getWindow: () => ({ isDestroyed: () => false, setProgressBar: value => progress.push(value) }),
  };
  return { root, userData, downloads, picked, shellCalls, progress,
    transfer: createFileTransfer(deps) };
}

const wait = () => new Promise(resolve => setTimeout(resolve, 0));

test('文件名清洗：目录成分、非法字符、保留设备名都不会跑到文件夹外面', () => {
  assert.equal(safeName('..\\..\\Windows\\System32\\x.dll'), 'x.dll');
  assert.equal(safeName('a/b/c.txt'), 'c.txt');
  assert.equal(safeName('报告:2026?.pdf'), '报告_2026_.pdf');
  assert.equal(safeName('..'), '文件');
  assert.equal(safeName(''), '文件');
  assert.equal(safeName('  '), '文件');
  assert.equal(safeName('CON.txt'), '_CON.txt', 'Windows 保留名要躲开');
  assert.equal(safeName('lpt1'), '_lpt1');
  assert.equal(safeName('name.  '), 'name', 'Windows 不喜欢结尾的点和空格');
  const long = safeName('a'.repeat(300) + '.txt');
  assert.ok(long.length <= 150, `${long.length} 应该被截到 150 以内`);
  assert.ok(long.endsWith('.txt'), '扩展名要留着');
});

test('重名往后排，绝不覆盖对方已有的文件', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iruler-name-'));
  fs.writeFileSync(path.join(root, '报告.pdf'), 'x');
  assert.equal(freeName(root, '报告.pdf', new Set()), '报告 (1).pdf');
  assert.equal(freeName(root, '报告.pdf', new Set(['报告 (1).pdf'])), '报告 (2).pdf');
  assert.equal(freeName(root, '全新.txt', new Set()), '全新.txt');
});

test('默认就有一个能用的接收文件夹：系统下载目录下的 iruler dream', () => {
  const h = harness();
  const settings = h.transfer.settings();
  assert.equal(settings.receiveDir, path.join(h.downloads, 'iruler dream'));
  assert.equal(settings.custom, false);
  // 收第一个文件时它会被建出来，用户没设过也能直接收。
  const opened = h.transfer.openReceive({ transferId: 't1', name: 'a.txt', size: 3 });
  assert.equal(opened.ok, true);
  assert.equal(fs.existsSync(settings.receiveDir), true);
  h.transfer.cancelReceive('t1');
});

test('设置里可以改接收文件夹，改了会记住（用户："设置里面可以改"）', async () => {
  const h = harness();
  const next = await h.transfer.chooseFolder();
  assert.equal(next.receiveDir, h.picked);
  assert.equal(next.custom, true);
  // 换一个实例（= 重启客户端）读到的还是这个文件夹。
  const again = createFileTransfer({
    app: { getPath: name => (name === 'userData' ? h.userData
      : name === 'downloads' ? h.downloads : h.root) },
    dialog: {}, shell: {}, getWindow: () => undefined,
  });
  assert.equal(again.settings().receiveDir, h.picked);
});

test('发送方：按句柄读自己拖进来的那个文件，目录和空文件都发不了', () => {
  const h = harness();
  const source = path.join(h.root, 'source.bin');
  const payload = Buffer.from(Array.from({ length: 700 }, (_, index) => index % 251));
  fs.writeFileSync(source, payload);
  const opened = h.transfer.openSend(source);
  assert.equal(opened.name, 'source.bin');
  assert.equal(opened.size, payload.length);
  assert.equal(opened.path, source);
  // 分片读：偏移正确、末尾一片会短。
  const first = h.transfer.readSend(opened.id, 0, 256);
  assert.equal(first.length, 256);
  assert.deepEqual(Buffer.from(first), payload.subarray(0, 256));
  const last = h.transfer.readSend(opened.id, 512, 256);
  assert.equal(last.length, payload.length - 512);
  assert.deepEqual(Buffer.from(last), payload.subarray(512));
  // 一次最多 512 KB（脏参数会被夹住，不会让页面要到一大块内存）。
  assert.ok(h.transfer.readSend(opened.id, 0, 50 * 1024 * 1024).length <= 512 * 1024);
  assert.equal(h.transfer.closeSend(opened.id), true);
  assert.throws(() => h.transfer.readSend(opened.id, 0, 16), /发送已结束/);
  assert.throws(() => h.transfer.openSend(h.root), /文件夹/);
  assert.throws(() => h.transfer.openSend(path.join(h.root, 'nope.bin')), /找不到/);
  const empty = path.join(h.root, 'empty.bin');
  fs.writeFileSync(empty, '');
  assert.throws(() => h.transfer.openSend(empty), /空文件/);
});

test('接收方：静默写进接收文件夹，写完才改名，中途没有半个成品', async () => {
  const h = harness();
  const opened = h.transfer.openReceive({ transferId: 't1', name: '收到.txt', size: 5 });
  assert.equal(opened.ok, true);
  const folder = h.transfer.settings().receiveDir;
  const final = path.join(folder, '收到.txt');
  await h.transfer.writeReceive('t1', Uint8Array.from([1, 2]));
  assert.equal(fs.existsSync(final), false, '没写完不许出现成品文件');
  assert.equal(fs.existsSync(final + '.part'), true);
  await h.transfer.writeReceive('t1', Uint8Array.from([3, 4, 5]));
  const ended = await h.transfer.endReceive('t1');
  assert.equal(ended.ok, true);
  assert.equal(ended.path, final);
  assert.equal(ended.folder, folder);
  assert.equal(fs.existsSync(final + '.part'), false, '临时文件要收掉');
  assert.deepEqual([...fs.readFileSync(final)], [1, 2, 3, 4, 5]);
});

test('收不完 / 对方改名成路径 / 重名都不会伤到别人的文件', async () => {
  const h = harness();
  const folder = h.transfer.settings().receiveDir;
  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path.join(folder, '同名.txt'), '原来的');
  const opened = h.transfer.openReceive({ transferId: 't1', name: '..\\..\\同名.txt', size: 2 });
  assert.equal(opened.ok, true);
  assert.equal(opened.savedName, '同名 (1).txt', '既躲开重名，也没跑到文件夹外面');
  assert.equal(path.dirname(path.join(folder, opened.savedName)), folder);
  await h.transfer.writeReceive('t1', Uint8Array.from([9, 9]));
  assert.equal((await h.transfer.endReceive('t1')).ok, true);
  assert.equal(fs.readFileSync(path.join(folder, '同名.txt'), 'utf8'), '原来的');
  assert.equal(fs.readFileSync(path.join(folder, '同名 (1).txt')).length, 2);

  // 少了一片就结束：不认，也不留半个文件。
  const short = h.transfer.openReceive({ transferId: 't2', name: 'short.bin', size: 10 });
  await h.transfer.writeReceive('t2', Uint8Array.from([1, 2, 3]));
  const ended = await h.transfer.endReceive('t2');
  assert.equal(ended.ok, false);
  assert.match(ended.error, /没有收完/);
  assert.equal(fs.existsSync(path.join(folder, short.savedName)), false);
  assert.equal(fs.existsSync(path.join(folder, short.savedName + '.part')), false);

  // 取消：临时文件清掉。
  h.transfer.openReceive({ transferId: 't3', name: 'cancel.bin', size: 10 });
  await h.transfer.writeReceive('t3', Uint8Array.from([1]));
  assert.equal(h.transfer.cancelReceive('t3'), true);
  assert.equal(fs.existsSync(path.join(folder, 'cancel.bin.part')), false);

  // 脏 id / 脏大小：拒绝。
  assert.equal(h.transfer.openReceive({ transferId: '', name: 'a', size: 1 }).ok, false);
  assert.equal(h.transfer.openReceive({ transferId: 't4', name: 'a', size: 0 }).ok, false);
  assert.equal(h.transfer.openReceive({ transferId: 't5', name: 'a', size: 5 * 1024 ** 3 }).ok, false);
  assert.equal((await h.transfer.writeReceive('nope', Uint8Array.from([1]))).ok, false);
});

test('系统级进度条：0..1 夹住，负数清掉，大于 1 当作"不确定"', () => {
  const h = harness();
  h.transfer.progress(0.42);
  h.transfer.progress(1.7);
  h.transfer.progress(-1);
  h.transfer.progress(0);
  assert.deepEqual(h.progress, [0.42, 2, -1, 0]);
});

test('打开 / 打开文件夹只认我们交出去过的路径', () => {
  const h = harness();
  const source = path.join(h.root, 'source.bin');
  fs.writeFileSync(source, 'x');
  assert.equal(h.transfer.openPath('C:\\Windows\\System32\\cmd.exe'), false, '别人构造的路径一律拒绝');
  assert.equal(h.transfer.revealPath('C:\\Windows'), false);
  const opened = h.transfer.openSend(source);
  assert.equal(h.transfer.openPath(source), true);
  assert.equal(h.transfer.revealPath(source), true);
  h.transfer.closeSend(opened.id);
  assert.deepEqual(h.shellCalls, [{ open: source }, { reveal: source }]);
  // 接收文件夹里的东西任何时候都能打开（重启后 known 是空的）。
  const folder = h.transfer.settings().receiveDir;
  fs.mkdirSync(folder, { recursive: true });
  assert.equal(h.transfer.openPath(path.join(folder, 'a.txt')), true);
  assert.equal(h.transfer.openFolder(folder), true);
  assert.equal(h.transfer.openFolder('C:\\Windows'), false, '只能打开接收文件夹');
});

test('单个文件上限是 2 GB，和服务端 file-relay.mjs 保持一致', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'file-transfer.cjs'), 'utf8');
  assert.match(source, /const MAX_BYTES = 2 \* 1024 \*\* 3;/,
    '上限必须正好是 2 GB（2026-09-21 用户要求，原为 4 GB）');
  assert.match(source, /文件不能超过 2 GB/, '提示文案要跟上');
  assert.equal(/MAX_BYTES = 4 \* 1024/.test(source), false, '旧的 4 GB 不许残留');
  // 行为：刚好 2 GB 收，多一个字节就拒（服务端的硬门也是这个数）。
  const h = harness();
  const limit = 2 * 1024 ** 3;
  assert.equal(h.transfer.openReceive({ transferId: 't1', name: 'border.bin', size: limit }).ok, true);
  h.transfer.cancelReceive('t1');
  assert.equal(h.transfer.openReceive({ transferId: 't2', name: 'over.bin', size: limit + 1 }).ok, false);
});

test('退出时把还在的句柄都收掉（不拖慢关机）', async () => {
  const h = harness();
  const source = path.join(h.root, 's.bin');
  fs.writeFileSync(source, 'hello');
  h.transfer.openSend(source);
  h.transfer.openReceive({ transferId: 't1', name: 'a.bin', size: 9 });
  assert.deepEqual(h.transfer.openHandles(), { sends: 1, receives: 1 });
  h.transfer.reset();
  assert.deepEqual(h.transfer.openHandles(), { sends: 0, receives: 0 });
  assert.equal(h.transfer.closeSend('anything'), false);
});
