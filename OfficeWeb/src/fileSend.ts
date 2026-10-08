// 文件直传的**发送那一半**：把拖到头像上的文件读出来、分片发出去。
//
// 从 `fileTransfer.ts` 里搬出来的（那个文件已经贴着 500 行上限，AGENTS.md 里也记着"下一次改它
// 之前先把发送拆出去"）。这里只管"怎么把一条文件送走"；"这条记录在通道里是什么状态"
// 仍然归 `fileTransfer.ts`，通过下面这个 `SendContext` 显式借过来——依赖写在类型上，不靠闭包猜。
import type { Socket } from 'socket.io-client';
import { CHUNK_BYTES, WINDOW, readableError, type FileTransferRow } from './fileTransferRules';

/** 主进程那一侧的桥（浏览器里没有）。 */
type FilesBridge = NonNullable<NonNullable<Window['officeDesktop']>['files']>;
/** 主进程交回来的发送句柄。 */
type OpenedFile = { id: string; name: string; size: number; path: string };

export interface SendContext {
  bridge: () => FilesBridge | undefined;
  socket: () => Socket | undefined;
  /** 把一条新记录放到最前面（并立刻渲染）。 */
  place: (row: FileTransferRow) => void;
  row: (id: string) => FileTransferRow | undefined;
  /** 标成失败并写明原因。 */
  fail: (id: string, error: string) => void;
  soon: () => void;
  commit: () => void;
  taskbar: () => void;
  trim: () => void;
  notify: (message: string) => void;
  toast: (title: string, body: string) => void;
}

export function createFileSender(ctx: SendContext) {
  async function sendOne(active: Socket, personId: string, peerName: string, path: string) {
    const id = crypto.randomUUID();
    const fallbackName = String(path).split(/[\\/]/).pop() || '文件';
    // **先立卡片、再开文件**（2026-09-21 用户报障「头像拖拽上去发送的功能不行」）：
    // 原来是先 `sendOpen`，它一抛（拖进来的是文件夹、路径读不到、超过 2 GB、空文件…）
    // 连一条记录都没有 —— 左下角什么都不出现，看起来就是"拖上去了、然后没有然后了"，
    // 而真正的原因只闪在底部状态栏里，没人看得到。现在任何失败都会留下带原因的卡片。
    ctx.place({
      id, direction: 'send', status: 'sending', peerId: personId,
      peerName: peerName || '同事', name: fallbackName, size: 0,
      transferred: 0, path, folder: '', url: '', error: '',
      at: Date.now(), endedAt: 0, handle: '',
    });
    let opened: OpenedFile | undefined;
    try {
      opened = await ctx.bridge()?.sendOpen(path);
      if (!opened?.id) throw Error('无法读取这个文件');
      const current = ctx.row(id);
      if (current) {
        current.name = opened.name || fallbackName;
        current.size = opened.size || 0;
        current.path = opened.path || path;
        current.handle = opened.id;
      }
      ctx.commit();
      const offer = await active.timeout(20000)
        .emitWithAck('file-offer', { transferId: id, targetId: personId, name: opened.name, size: opened.size });
      if (!offer?.ok) throw Error(offer?.error || '文件未发送');
      const pending: Promise<void>[] = [];
      for (let offset = 0; offset < opened.size; offset += CHUNK_BYTES) {
        const length = Math.min(CHUNK_BYTES, opened.size - offset);
        // **按顺序读**：分片的到位顺序必须和偏移一致，服务端会拒收乱序的片。
        const bytes = await ctx.bridge()!.sendRead(opened.id, offset, length);
        if (!bytes?.length) throw Error('读取文件失败');
        // `emitWithAck` 在这里是**同步排队**的，所以并发发出去的片仍然按顺序到达服务端。
        const task = active.timeout(90000)
          .emitWithAck('file-chunk', { transferId: id, offset, bytes })
          .then(answer => {
            if (!answer?.ok) throw Error(answer?.error || '文件发送失败');
            const row = ctx.row(id);
            if (row) row.transferred += bytes.length;
            ctx.soon();
            ctx.taskbar();
          });
        task.catch(() => undefined);   // 真错误仍由下面的 await 抛出，这里只是别报"未处理的拒绝"
        pending.push(task);
        while (pending.length >= WINDOW) await pending.shift();
      }
      await Promise.all(pending);
      const ended = await active.timeout(90000).emitWithAck('file-end', { transferId: id });
      if (!ended?.ok) throw Error(ended?.error || '对方没有保存成功');
      if (current) {
        current.status = 'done';
        current.transferred = current.size;
        current.endedAt = Date.now();
      }
      ctx.notify(`已发送给 ${peerName || '同事'}：${opened.name}`);
      ctx.toast('文件已送达', `${opened.name} 已发送给 ${peerName || '同事'}`);
    } catch (error) {
      // 剥掉 Electron 那层 `Error invoking remote method 'x': Error: ` 外壳，
      // 卡片和通知上要显示"空文件无法发送"这种能看懂的话。
      const message = readableError(error);
      active.emit('file-cancel', { transferId: id, reason: message });
      ctx.fail(id, message);
      ctx.notify(`发送失败：${message}`);
      ctx.toast('文件发送失败', `${fallbackName}：${message}`);
    } finally {
      if (opened?.id) void ctx.bridge()?.sendClose(opened.id).catch(() => undefined);
      ctx.commit();
      ctx.taskbar();
      ctx.trim();
    }
  }

  /** 拖到头像上的文件：一个一个来（同时发多个只会互相抢带宽，进度也看不清）。 */
  async function sendFiles(personId: string, paths: string[], peerName = '') {
    if (!personId || !paths?.length) return;
    if (!ctx.bridge()) { ctx.notify('拖拽发送需要桌面客户端'); return; }
    const active = ctx.socket();
    if (!active?.connected) { ctx.notify('连接已断开，文件未发送'); return; }
    // 底部状态栏先应一声：小窗那句"正在发给 XX"是小窗自己说的，这里才是主窗口真的收到了。
    ctx.notify(`正在发送 ${paths.length} 个文件给 ${peerName || '同事'}…`);
    for (const path of paths.slice(0, 20)) {
      if (!active.connected) { ctx.notify('连接已断开，文件未发送'); return; }
      try { await sendOne(active, personId, peerName, path); }
      catch (error) { ctx.notify(`发送失败：${readableError(error)}`); }
    }
  }

  return { sendOne, sendFiles };
}
