// 文件直传在**网页这一层**的纯规则：进度、文案、要推给任务栏头像条的那一小段摘要。
// 规则和视图分开，`test/file-transfer-rules.test.mjs` 直接测这里（用户 2026-09-22 要求）。
//
// 需求原话：「新增文件发送功能，就是把文件拖至状态栏某人头像，就会开始发送，不需要对方同意，
// 直接就发送到设置好的位置，设置里面可以改，双方要显示系统级进度条，完事有打开和打开文件夹的功能」。

/** 一片多大（和 OfficeDesktop/file-transfer.cjs 的读取上限、file-relay.mjs 的分片上限对齐）。 */
export const CHUNK_BYTES = 256 * 1024;
/** 同时在路上的片数（服务端 file-relay.mjs 的 WINDOW 也是 4）：太少被 RTT 拖死，太多就是灌对方。 */
export const WINDOW = 4;
/** 网页版接收：先在内存里攒、收完再交给浏览器下载，所以有个上限（客户端是直接写盘的，没这个限制）。 */
export const BROWSER_MAX_BYTES = 512 * 1024 * 1024;
/** 进度多久往 React 推一次。一片一个 setState 会把整个页面拖垮（和 motion 的批量一个道理）。 */
export const FLUSH_MS = 200;
/** 传完之后头像条上那条进度线还留多久。 */
export const DONE_KEEP_MS = 8000;
/** 面板里最多留几条"已经完事"的记录。 */
export const MAX_FINISHED = 6;

export type TransferStatus = 'sending' | 'receiving' | 'done' | 'failed' | 'cancelled';
export type TransferDirection = 'send' | 'receive';

export interface FileTransferRow {
  id: string;
  direction: TransferDirection;
  status: TransferStatus;
  /** 对方的 socket id（发送时是我们拖过去的那个头像）。 */
  peerId: string;
  peerName: string;
  name: string;
  size: number;
  transferred: number;
  /** 客户端：源文件 / 收到的文件在磁盘上的位置。完事的两个按钮要用它。 */
  path: string;
  /** 接收方落在哪个文件夹（设置里那个）。 */
  folder: string;
  /** 网页版收下的文件（Blob URL）——浏览器没有接收文件夹可写。 */
  url: string;
  error: string;
  /** 开始/结束时间：头像条只在这之后的一小段时间里还画进度线。 */
  at: number;
  endedAt: number;
  /** 主进程交回来的发送句柄 id（发完要还回去）。 */
  handle: string;
  /** 这一趟从哪来（缺省当头像直传）。 */
  source?: TransferSource;
}

/**
 * 这一趟是从哪来的：
 *   * `peer`——头像直传（别人拖到我头像上的）；
 *   * `chat`——聊天记录里的附件，我自己点了「下载」（用户 2026-09-21 要求复用同一套）。
 * 两者共用同一条通道，所以进度、任务栏、卡片和「打开 / 打开文件夹」全都不用再写一遍。
 */
export type TransferSource = 'peer' | 'chat';

/**
 * 下载/接收一条流的期限。**`AbortSignal.timeout` 卡的是整条请求，不是"空闲"**——
 * 所以它必须随文件大小放大：写死 60 秒的话 2 GB 永远下不完（上限提到 2 GB 后这条就成了必须一起改的地方）。
 * 按**最低 64 KB/s** 估算，最少 2 分钟，最多 6 小时。
 */
export function downloadTimeoutMs(size: number): number {
  const bytes = Math.max(0, Number(size) || 0);
  return Math.min(6 * 60 * 60 * 1000, Math.max(120000, Math.ceil(bytes / (64 * 1024)) * 1000));
}

/** 还没结束的（发送中 / 接收中）。 */
export function isActive(row: FileTransferRow): boolean {
  return row.status === 'sending' || row.status === 'receiving';
}

/**
 * 把 socket.io 送来的二进制附件**统一成 `Uint8Array`**。
 *
 * 这是踩过的坑，别再退回"读 `.length`"（2026-09-21 用户报障：
 * 「对方无法接收文件，接收方出现了进度条显示没有进度」）：
 *   * `socket.io-client` 的**浏览器**构建（页面和客户端渲染进程用的就是它）
 *     默认 `binaryType = "arraybuffer"`（engine.io-client 的 `globals.js`），
 *     所以收端拿到的是 **`ArrayBuffer`**；
 *   * 而 Node 构建是 `"nodebuffer"`，服务端和测试里收到的是 **`Buffer`**。
 * `ArrayBuffer` **没有 `.length`，只有 `byteLength`** —— 于是每一片都在接收端被判成
 * "无效的文件分片"，进度条永远停在 0，发送方只看到"对方收不了"。
 *
 * 顺手兼容 `Blob`（有的传输层给 blob）和 socket.io 的老式
 * `{ type: 'Buffer', data: [...] }` 形状。拿不到字节就返回空数组，由调用方报错。
 */
export async function toBytes(value: unknown): Promise<Uint8Array> {
  if (!value) return new Uint8Array(0);
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) {
    const view = value as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return new Uint8Array(await value.arrayBuffer());
  }
  const shaped = value as { type?: string; data?: number[] };
  if (shaped.type === 'Buffer' && Array.isArray(shaped.data)) return Uint8Array.from(shaped.data);
  return new Uint8Array(0);
}

/**
 * 二进制附件的**字节数**：读得到就返回长度，读不到返回 -1。
 * 专门用来在错误信息里说清"到底收到了什么"，免得下次又是靠猜。
 */
export function byteLengthOf(value: unknown): number {
  if (!value) return -1;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return (value as ArrayBufferView).byteLength;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value.size;
  const shaped = value as { type?: string; data?: number[] };
  if (shaped.type === 'Buffer' && Array.isArray(shaped.data)) return shaped.data.length;
  return -1;
}

/** 收到的东西到底是什么类型：只给错误信息用。 */
export function describeBinary(value: unknown): string {
  if (!value) return String(value);
  if (value instanceof ArrayBuffer) return 'ArrayBuffer';
  if (ArrayBuffer.isView(value)) return (value as ArrayBufferView).constructor?.name || 'TypedArray';
  if (typeof Blob !== 'undefined' && value instanceof Blob) return 'Blob';
  return typeof value;
}

/** 0..1 的进度。 */
export function percentOf(row: { transferred: number; size: number }): number {
  if (!row.size) return 0;
  return Math.max(0, Math.min(1, row.transferred / row.size));
}

/** 人看的字节数：1023 B / 12.3 KB / 4.5 MB / 1.2 GB。 */
export function formatBytes(value: number): string {
  const size = Math.max(0, Number(value) || 0);
  if (size < 1024) return `${Math.round(size)} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let index = -1;
  let number = size;
  do { number /= 1024; index += 1; } while (number >= 1024 && index < units.length - 1);
  return `${number >= 10 ? Math.round(number) : number.toFixed(1)} ${units[index]}`;
}

/** 卡片抬头：这一趟是谁给谁（聊天附件是我自己点的下载，没有"对方"）。 */
export function headline(row: FileTransferRow): string {
  if (row.source === 'chat') return row.status === 'receiving' ? '正在下载聊天文件' : '聊天文件';
  const who = row.peerName || '同事';
  if (row.direction !== 'send') return `${who} 发来的文件`;
  if (row.status === 'done') return `已发送给 ${who}`;
  // 失败/取消的行**不许再说"正在发送"**——那和卡片上的红字自相矛盾（2026-09-21 真机实测）。
  if (isActive(row)) return `正在发送给 ${who}`;
  return `发送给 ${who}`;
}

/** 卡片上那一行状态说明。 */
export function statusText(row: FileTransferRow): string {
  const done = `${formatBytes(row.size)}`;
  if (row.status === 'failed') return row.error || '传输中断';
  if (row.status === 'cancelled') return '已取消';
  if (row.status === 'done') {
    if (row.direction === 'send') return `${done} · 已送达`;
    return row.folder ? `${done} · 已存到 ${row.folder}` : `${done} · 已下载`;
  }
  const progress = `${formatBytes(row.transferred)} / ${done}`;
  return row.status === 'receiving' ? `正在接收 · ${progress}` : `正在发送 · ${progress}`;
}

/**
 * 把一坨错误变成用户看得懂的一句话。
 *
 * Electron 的 `ipcRenderer.invoke` 在 `ipcMain.handle` 抛错时会把错误**包一层**：
 *   `Error invoking remote method 'office:file-send-open': Error: 空文件无法发送`
 * 这行字直接显示在卡片上没人看得懂（2026-09-21 真机实测就是这个样子）。
 * 把外壳剥掉，只留我们自己写的那句；实在剥不出来就原样返回。
 */
export function readableError(error: unknown): string {
  const raw = error instanceof Error ? error.message
    : typeof error === 'string' ? error : '';
  const wrapped = /^Error invoking remote method '[^']*':\s*(?:Error:\s*)?([\s\S]*)$/.exec(raw.trim());
  return ((wrapped ? wrapped[1] : raw) || '').trim() || '操作失败';
}

/**
 * 任务栏那条系统进度线要画什么。
 *
 * 传完之后**还要留一小会儿**（`DONE_KEEP_MS`）画成满格，不然进度条会在最后一片到位的
 * 同一瞬间消失，看起来像"没传完就没了"。同时传好几个就按字节数合并成一条。
 */
export function barPercent(rows: FileTransferRow[], now = Date.now()): number {
  const active = rows.filter(isActive);
  if (active.length) {
    const total = active.reduce((sum, row) => sum + Math.max(1, row.size), 0);
    const done = active.reduce((sum, row) => sum + Math.min(row.transferred, row.size), 0);
    return Math.max(0, Math.min(1, done / total));
  }
  const fresh = rows.filter(row => row.status === 'done' && now - (row.endedAt || row.at) < DONE_KEEP_MS);
  return fresh.length ? 1 : 0;
}

/** 推给任务栏头像条的那一份摘要（小窗只画一条细线，不认业务）。 */
export interface DockTransferRow {
  id: string;
  name: string;
  percent: number;
  direction: TransferDirection;
  done: boolean;
  failed: boolean;
}

export function dockTransfers(rows: FileTransferRow[], now = Date.now()): DockTransferRow[] {
  return rows
    .filter(row => isActive(row) ||
      (row.status !== 'cancelled' && now - (row.endedAt || row.at) < DONE_KEEP_MS))
    .slice(0, 8)
    .map(row => ({
      id: row.id,
      name: row.name,
      percent: row.status === 'done' ? 1 : percentOf(row),
      direction: row.direction,
      done: row.status === 'done',
      failed: row.status === 'failed',
    }));
}

/**
 * 同一批记录内容没变就沿用原对象：`useSyncExternalStore` 和 React 都靠这个
 * 跳过没必要的渲染（和 `unreadCounts.ts` 里那条规则一个道理）。
 */
export function sameTransferRows(left: FileTransferRow[], right: FileTransferRow[]): boolean {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a.id !== b.id || a.status !== b.status || a.transferred !== b.transferred ||
        a.path !== b.path || a.folder !== b.folder || a.error !== b.error) return false;
  }
  return true;
}

/** 面板里那一串记录：正在传的排前面，然后按时间倒序；完事的只留最近几条。 */
export function orderRows(rows: FileTransferRow[], max = MAX_FINISHED): FileTransferRow[] {
  const active = rows.filter(isActive);
  const finished = rows.filter(row => !isActive(row)).slice(0, max);
  return [...active, ...finished];
}
