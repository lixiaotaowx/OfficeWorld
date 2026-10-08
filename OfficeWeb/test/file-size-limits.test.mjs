// 文件大小上限的**唯一事实来源检查**（用户 2026-09-21 要求把两条路都改成 2 GB）。
//
// 这些数字散在三个仓库文件里（网页侧、服务端中继、桌面主进程），任何一处单独改动都会变成
// "界面说能发、服务端拒收"这种最难查的毛病。这个套件把它们钉在一起：
//   * 头像直传：`OfficeWeb/file-relay.mjs` 的 `MAX_FILE_BYTES`
//               == `OfficeDesktop/file-transfer.cjs` 的 `MAX_BYTES`
//   * 聊天附件：`OfficeWeb/chat-files.mjs` 的 `MAX_FILE_SIZE`
//               == `OfficeWeb/src/chatAttachments.ts` 的 `MAX_CHAT_FILE_BYTES`
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MAX_FILE_BYTES } from '../file-relay.mjs';
import { MAX_FILE_SIZE } from '../chat-files.mjs';
import { loadTs } from './helpers.mjs';

const GB = 1024 ** 3;
const read = relative => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

test('头像直传上限 = 2 GB，服务端与桌面端一致', () => {
  assert.equal(MAX_FILE_BYTES, 2 * GB, '服务端中继的上限');
  const desktop = read('../../OfficeDesktop/file-transfer.cjs');
  assert.match(desktop, /const MAX_BYTES = 2 \* 1024 \*\* 3;/,
    '桌面主进程的上限必须也是 2 GB（两处不一致时大文件会走到发送一半才被服务端拒收）');
  assert.match(desktop, /文件不能超过 2 GB/, '桌面端的提示要和上限一致');
  const relay = read('../file-relay.mjs');
  assert.match(relay, /文件需为 1 字节至 2 GB/, '服务端的提示要和上限一致');
  assert.equal(/至 4 GB/.test(relay), false, '旧的 4 GB 文案不许残留');
});

test('聊天附件上限 = 2 GB，服务端与网页端一致', () => {
  assert.equal(MAX_FILE_SIZE, 2 * GB, '聊天服务端的上限');
  const web = read('../src/chatAttachments.ts');
  assert.match(web, /export const MAX_CHAT_FILE_BYTES = 2 \* 1024 \*\* 3;/,
    '网页端的上限必须和服务端一样');
  assert.match(web, /单个文件需为 1 字节至 2 GB/, '网页端的提示要和上限一致');
  assert.equal(/至 20 MB/.test(web), false, '旧的 20 MB 文案不许残留');
  const server = read('../chat-files.mjs');
  assert.match(server, /文件需为 1 字节至 2 GB/, '服务端的提示要和上限一致');
  assert.equal(/至 20 MB/.test(server), false, '旧的 20 MB 文案不许残留');
  // 界面上的那行说明也得跟着改，不然用户看到的还是旧限制。
  assert.match(read('../src/ChatPanel.tsx'), /单个不超过 2 GB/);
});

test('2 GB 的附件必须能下完：整条请求的期限要随大小放大，不能还是 60 秒', async () => {
  const rules = await import(await loadTs('fileTransferRules.ts'));
  const chat = await import(await loadTs('chatAttachments.ts'));
  // `AbortSignal.timeout` 卡的是**整条请求**，写死 60 秒的话 2 GB 永远下不完。
  assert.ok(rules.downloadTimeoutMs(2 * GB) > 60 * 60 * 1000,
    '2 GB 的下载期限要给到小时级');
  assert.equal(rules.downloadTimeoutMs(0), 120000, '小文件也至少给 2 分钟');
  assert.equal(rules.downloadTimeoutMs(1024 * 1024), 120000, '1 MB 按最低速率算不到 2 分钟，取下限');
  assert.equal(rules.downloadTimeoutMs(20 * 1024 * 1024), 320000, '20 MB 按最低 64 KB/s 估 5 分钟出头');
  assert.ok(rules.downloadTimeoutMs(2 * GB) <= 6 * 60 * 60 * 1000, '最长不超过 6 小时');
  // 大文件不进 IndexedDB（配额经不起几个 GB）。
  assert.ok(chat.CACHE_MAX_BYTES < 2 * GB, '缓存上限必须小于文件上限');
  assert.match(read('../src/chatAttachments.ts'), /blob\.size > CACHE_MAX_BYTES\) return blob/,
    '超过缓存上限就直接把 Blob 交出去下载');
  // **后台只预取小附件**：上限提到 2 GB 之后，"所有附件都自动收"会静默拉几个 GB。
  assert.ok(chat.PREFETCH_MAX_BYTES <= 16 * 1024 * 1024, '后台预取上限要小');
  assert.match(read('../src/chatClient.ts'),
    /attachment\.size > PREFETCH_MAX_BYTES\) continue/,
    '大附件不许在后台自动拉，必须点了「下载」才走');
});
