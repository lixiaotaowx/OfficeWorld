// 文件直传的**网页侧引擎**：拖到任务栏头像上就开始发，直接落进对方设置好的接收文件夹。
//
// 分工（和项目里其它功能一致）：
//   * 小窗（头像条）只把**路径**交出来，它不碰 socket、也不碰文件系统；
//   * 主窗口（这里）持有唯一的 socket，负责分片、确认、进度；
//   * 主进程（OfficeDesktop/file-transfer.cjs）持有真实文件句柄：读源文件、写接收文件夹，
//     并且负责 Windows 任务栏上那条**系统级进度条**。
//
// 不需要对方同意：服务端的 `file-in` 不是"询问"，只是确认对方那端接得住（能开文件、有地方放）。
import type { Socket } from 'socket.io-client';
import { streamResponse } from './downloadStream';
import { createFileSender } from './fileSend';
import {
  BROWSER_MAX_BYTES, CHUNK_BYTES, FLUSH_MS, MAX_FINISHED, WINDOW,
  byteLengthOf, describeBinary, dockTransfers, downloadTimeoutMs, formatBytes,
  isActive, readableError, sameTransferRows, toBytes,
  type DockTransferRow, type FileTransferRow,
} from './fileTransferRules';

export interface FileTransferChannelOptions {
  /** 说一句话给底部状态栏 / 弹窗（和别的功能共用）。 */
  notify: (message: string) => void;
}

/** 主进程那一侧的桥；浏览器里没有（网页版只能收成浏览器下载）。 */
const bridge = () => window.officeDesktop?.files;

export function createFileTransferChannel(options: FileTransferChannelOptions) {
  let socket: Socket | undefined;
  let rows: FileTransferRow[] = [];
  /** 发布出去的快照：`useSyncExternalStore` 要求同一个数据返回同一个引用。 */
  let snapshot: FileTransferRow[] = [];
  const listeners = new Set<() => void>();
  /** 网页版接收：片先在内存里攒着，收完合成 Blob 交给浏览器下载。 */
  const parts = new Map<string, Uint8Array[]>();
  const urls = new Map<string, string>();
  let flush: ReturnType<typeof setTimeout> | undefined;
  let barTimer: ReturnType<typeof setTimeout> | undefined;
  let lastBar = -2;

  const publish = () => {
    if (sameTransferRows(snapshot, rows)) return;
    snapshot = rows.slice();
    for (const listener of listeners) listener();
  };
  /** 进度类改动：攒一会儿再渲染（一片一次 setState 会把整个页面拖垮）。 */
  const soon = () => {
    if (flush) return;
    flush = setTimeout(() => { flush = undefined; publish(); }, FLUSH_MS);
  };
  /** 状态翻转：立刻渲染，不让人等那 200ms。 */
  const commit = () => {
    if (flush) { clearTimeout(flush); flush = undefined; }
    publish();
  };

  const row = (id: string) => rows.find(item => item.id === id);

  function place(next: FileTransferRow, front = true) {
    rows = front ? [next, ...rows] : [...rows, next];
    commit();
  }

  /** 只留最近几条"已经完事"的，不然面板会一直长。 */
  function trim() {
    const finished = rows.filter(item => !isActive(item));
    if (finished.length <= MAX_FINISHED) return;
    const drop = new Set(finished.slice(MAX_FINISHED).map(item => item.id));
    rows = rows.filter(item => !drop.has(item.id));
    for (const id of drop) release(id);
  }

  function release(id: string) {
    const url = urls.get(id);
    if (url) { try { URL.revokeObjectURL(url); } catch { /* 已经释放了 */ } urls.delete(id); }
    parts.delete(id);
  }

  /**
   * 网页版的收尾：网页没有可以静默写入的文件夹，把攒下来的片合成一个 Blob 直接交给浏览器下载。
   * 返回那个 Blob URL（"打开"按钮用得上）。
   *
   * 两条路都用它——别人发来的文件（`file-in-end`）和我自己点的聊天下载
   * （`downloadAttachment`）——所以只留这一份，别再各写一遍。
   * 片现在统一是 `Uint8Array`（见 `toBytes`），`Blob` 直接就能吃。
   */
  function saveViaBrowser(id: string, name: string, chunks: Uint8Array[]): string {
    const url = URL.createObjectURL(new Blob(chunks, { type: 'application/octet-stream' }));
    urls.set(id, url);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.rel = 'noopener';
    document.body.append(link);
    link.click();
    link.remove();
    return url;
  }

  /**
   * Windows 任务栏上那条进度：同时传好几个就按字节数合并。
   * 传完不立刻清掉，先把满格亮一小会儿——不然最后一片到位的同一瞬间进度条就没了。
   */
  function taskbar() {
    const active = rows.filter(isActive);
    const set = (value: number) => {
      if (value === lastBar) return;
      lastBar = value;
      void bridge()?.progress(value).catch(() => undefined);
    };
    if (active.length) {
      if (barTimer) { clearTimeout(barTimer); barTimer = undefined; }
      const total = active.reduce((sum, item) => sum + Math.max(1, item.size), 0);
      const done = active.reduce((sum, item) => sum + Math.min(item.transferred, item.size), 0);
      set(Math.max(0, Math.min(1, done / total)));
      return;
    }
    if (lastBar >= 0 && lastBar < 1) {
      set(1);
      if (!barTimer) barTimer = setTimeout(() => { barTimer = undefined; set(-1); }, 1500);
    }
  }

  /** 走系统通知：窗口收在托盘里的时候，只有它能告诉用户"传完了"。 */
  function toast(title: string, body: string) {
    void window.officeDesktop?.alert?.({ title, body, section: 'files' })?.catch?.(() => undefined);
  }

  function fail(id: string, error: string) {
    const current = row(id);
    if (!current) return;
    current.status = 'failed';
    current.error = error;
    current.endedAt = Date.now();
    commit();
    taskbar();
  }

  /** 这一趟没了（对方取消、出错、自己取消）：把两端的句柄都收掉。 */
  function cancelLocal(id: string, reason: string) {
    const current = row(id);
    if (!current) return;
    if (current.direction === 'receive') {
      void bridge()?.receiveCancel(id).catch(() => undefined);
    }
    if (current.handle) {
      void bridge()?.sendClose(current.handle).catch(() => undefined);
      current.handle = '';
    }
    release(id);
    fail(id, reason);
    options.notify(reason);
    trim();
  }

  // ---- 发送 ----
  // 读盘与分片那半边住在 `fileSend.ts`（见那里的注释：`fileTransfer.ts` 一度贴着 500 行上限）。
  const sender = createFileSender({
    bridge, socket: () => socket, place: (next) => place(next), row, fail,
    soon, commit, taskbar, trim, notify: options.notify, toast,
  });

  // ---- 接收 ----

  function attachReceive(s: Socket) {
    s.on('file-in', async (payload, reply) => {
      if (typeof reply !== 'function') return;
      const id = String(payload?.transferId || '');
      const name = String(payload?.name || '文件');
      const size = Number(payload?.size) || 0;
      const peerName = String(payload?.fromName || '同事');
      if (!id || row(id)) return reply({ ok: false, error: '重复的传输' });
      if (size < 1) return reply({ ok: false, error: '文件大小无效' });
      const local = bridge();
      if (!local && size > BROWSER_MAX_BYTES)
        return reply({ ok: false, error: `网页版最多接收 ${formatBytes(BROWSER_MAX_BYTES)}，请让对方装桌面客户端接收` });
      place({
        id, direction: 'receive', status: 'receiving', peerId: String(payload?.fromId || ''),
        peerName, name, size, transferred: 0, path: '', folder: '', url: '', error: '',
        at: Date.now(), endedAt: 0, handle: '',
      });
      // **必须包住**：这里一抛，`reply` 就永远不会被调用，发送方会白等 60 秒才知道失败
      // （2026-09-21 报障的另一个可能入口）。失败也要立刻把原因交回去。
      try {
        if (local) {
          const opened = await local.receiveOpen({ transferId: id, name, size });
          if (!opened?.ok) throw Error(opened?.error || '无法接收文件');
          const current = row(id);
          if (current) current.folder = opened.folder || '';
        } else {
          parts.set(id, []);
        }
      } catch (error) {
        const message = readableError(error) || '无法接收文件';
        s.emit('file-cancel', { transferId: id, reason: message });
        cancelLocal(id, message);
        return reply({ ok: false, error: message });
      }
      toast('正在接收文件', `${peerName} 发来 ${name}`);
      return reply({ ok: true });
    });

    s.on('file-in-part', async (payload, reply) => {
      if (typeof reply !== 'function') return;
      const id = String(payload?.transferId || '');
      const current = row(id);
      if (!current || current.status !== 'receiving') return reply({ ok: false, error: '传输已失效' });
      // **别读 `.length`**：浏览器那一侧拿到的是 `ArrayBuffer`，它只有 `byteLength`（见 toBytes）。
      const bytes = await toBytes(payload?.bytes);
      if (!bytes.length) {
        const seen = byteLengthOf(payload?.bytes);
        return reply({ ok: false, error: seen < 0
          ? `无效的文件分片（收到 ${describeBinary(payload?.bytes)}）`
          : '无效的文件分片（长度为 0）' });
      }
      const local = bridge();
      try {
        if (local) {
          const saved = await local.receiveWrite(id, bytes);
          if (!saved?.ok) throw Error(saved?.error || '写入接收文件夹失败');
          current.transferred = Number(saved.written) || current.transferred + bytes.length;
        } else {
          const list = parts.get(id);
          if (!list) throw Error('传输已失效');
          list.push(bytes);
          current.transferred += bytes.length;
        }
        soon();
        taskbar();
        return reply({ ok: true });
      } catch (error) {
        const message = readableError(error) || '写入接收文件夹失败';
        s.emit('file-cancel', { transferId: id, reason: message });
        cancelLocal(id, message);
        return reply({ ok: false, error: message });
      }
    });

    s.on('file-in-end', async (payload, reply) => {
      if (typeof reply !== 'function') return;
      const id = String(payload?.transferId || '');
      const current = row(id);
      if (!current || current.status !== 'receiving') return reply({ ok: false, error: '传输已失效' });
      const local = bridge();
      // 同样必须包住：收尾失败也要立刻回一句，不能让发送方干等 60 秒。
      try {
        if (!local) {
          // 网页版：没有可以静默写入的文件夹，攒完的片合成一个 Blob 直接交给浏览器下载。
          current.url = saveViaBrowser(id, current.name, parts.get(id) || []);
          parts.delete(id);
          current.status = 'done';
          current.transferred = current.size;
          current.endedAt = Date.now();
          commit(); taskbar(); trim();
          toast('文件已收到', `${current.name} 已下载`);
          return reply({ ok: true, savedName: current.name });
        }
        const saved = await local.receiveEnd(id);
        if (!saved?.ok) throw Error(saved?.error || '文件保存失败');
        current.status = 'done';
        current.transferred = current.size;
        current.endedAt = Date.now();
        current.path = saved.path || '';
        current.folder = saved.folder || current.folder;
        current.name = saved.savedName || current.name;
        commit(); taskbar(); trim();
        toast('文件已收到', `${current.name} 已保存到 ${current.folder || '接收文件夹'}`);
        return reply({ ok: true, path: current.path, savedName: current.name });
      } catch (error) {
        const message = readableError(error) || '文件保存失败';
        s.emit('file-cancel', { transferId: id, reason: message });
        cancelLocal(id, message);
        return reply({ ok: false, error: message });
      }
    });

    // 对方那边结束了这一趟（取消、出错、断线都是它）。
    s.on('file-in-cancel', (payload: { transferId?: string; reason?: string }) => {
      const id = String(payload?.transferId || '');
      const current = row(id);
      if (!current || !isActive(current)) return;
      cancelLocal(id, String(payload?.reason || '对方取消了传输'));
    });
  }

  function attach(next: Socket) {
    socket = next;
    attachReceive(next);
  }

  /**
   * 把**聊天里的一个附件**下载下来（用户 2026-09-21：「整理一下聊天框里面的文件下载，
   * 要带进度条，要软件内设置好下载位置，下载好了也还是有几个按钮 打开等，复用」）。
   *
   * 完全复用头像直传那一套：同一个接收文件夹、同一份 `receiveOpen/Write/End`、同一条被限流的
   * 进度、同一个任务栏进度条、同一张卡片和同样的「打开 / 打开文件夹」按钮。
   * 唯一不同的是数据来源——那边是 socket 分片，这边是 HTTP 流（`/api/chat/files/:id`）。
   *
   * **行 id 就用附件 id**：聊天里那一条和传输通道里那一条是同一个东西，界面据此显示自己的进度，
   * 重复点「下载」也不会开出第二趟。
   */
  async function downloadAttachment(input: { id: string; name: string; size: number; url: string }) {
    const id = String(input?.id || '');
    if (!id || !input?.url) return;
    const existing = row(id);
    if (existing && isActive(existing)) return;          // 正在下，别再开一趟
    if (existing && existing.status === 'done') return;  // 已经下好了，"打开"就够了
    if (existing) { release(id); rows = rows.filter(item => item.id !== id); }

    const size = Math.max(0, Number(input.size) || 0);
    const local = bridge();
    place({
      id, direction: 'receive', status: 'receiving', peerId: '', peerName: '聊天',
      name: input.name || '文件', size, transferred: 0, path: '', folder: '', url: '', error: '',
      at: Date.now(), endedAt: 0, handle: '', source: 'chat',
    });
    const current = row(id);
    if (!current) return;
    try {
      if (local) {
        const opened = await local.receiveOpen({ transferId: id, name: current.name, size });
        if (!opened?.ok) throw Error(opened?.error || '无法保存文件');
        current.folder = opened.folder || '';
      } else {
        // 网页版没有可以静默写入的文件夹：攒起来，下完交给浏览器下载（进度照样有）。
        parts.set(id, []);
      }
      const response = await streamResponse({
        url: input.url,
        timeoutMs: downloadTimeoutMs(size),
        // 服务端给了 Content-Length 就以它为准（附件记录里的大小可能是旧值）。
        onStart: ({ declared }) => { if (declared) current.size = declared; },
        onChunk: async value => {
          if (local) {
            const saved = await local.receiveWrite(id, value);
            if (!saved?.ok) throw Error(saved?.error || '写入接收文件夹失败');
            current.transferred = Number(saved.written) || current.transferred + value.length;
          } else {
            parts.get(id)?.push(value);
            current.transferred += value.length;
          }
          soon();
          taskbar();
        },
      });
      if (!response.received) throw Error('下载到 0 字节，请重试');
      if (local) {
        const saved = await local.receiveEnd(id);
        if (!saved?.ok) throw Error(saved?.error || '文件保存失败');
        current.status = 'done';
        current.transferred = current.size;
        current.endedAt = Date.now();
        current.path = saved.path || '';
        current.folder = saved.folder || current.folder;
        current.name = saved.savedName || current.name;
        commit(); taskbar(); trim();
        toast('文件已下载', `${current.name} 已保存到 ${current.folder || '接收文件夹'}`);
        options.notify(`已下载到 ${current.folder || '接收文件夹'}：${current.name}`);
        return;
      }
      // 网页版没有可以静默写入的文件夹：攒起来的手交成 Blob 直接交给浏览器下载。
      current.url = saveViaBrowser(id, current.name, parts.get(id) || []);
      parts.delete(id);
      current.status = 'done';
      current.transferred = current.size;
      current.endedAt = Date.now();
      commit(); taskbar(); trim();
      toast('文件已下载', `${current.name} 已下载`);
      options.notify(`已开始下载：${current.name}`);
    } catch (error) {
      const message = readableError(error);
      if (local) void bridge()?.receiveCancel(id).catch(() => undefined);
      release(id);
      fail(id, message);
      options.notify(`下载失败：${message}`);
    }
  }

  return {
    attach,
    sendFiles: sender.sendFiles,
    downloadAttachment,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    snapshot: () => snapshot,
    /** 头像条要的那一份摘要（主窗口每秒推一次）。 */
    dockRows: (now = Date.now()): DockTransferRow[] => dockTransfers(rows, now),
    open(id: string) {
      const current = row(id);
      if (!current) return;
      if (current.url) { window.open(current.url, '_blank', 'noopener'); return; }
      if (current.path) void bridge()?.open(current.path).catch(() => undefined);
    },
    reveal(id: string) {
      const current = row(id);
      if (!current) return;
      // 有具体文件就在资源管理器里选中它；只有文件夹时才整个打开。
      if (current.path) void bridge()?.reveal(current.path).catch(() => undefined);
      else if (current.folder) void bridge()?.openFolder(current.folder).catch(() => undefined);
    },
    cancel(id: string) {
      const current = row(id);
      if (!current || !isActive(current)) return;
      socket?.emit('file-cancel', { transferId: id, reason: '已取消' });
      cancelLocal(id, '已取消');
    },
    dismiss(id: string) {
      const current = row(id);
      if (!current) return;
      if (isActive(current)) { socket?.emit('file-cancel', { transferId: id, reason: '已取消' }); cancelLocal(id, '已取消'); }
      rows = rows.filter(item => item.id !== id);
      release(id);
      commit();
    },
    dismissAll() {
      for (const item of rows) if (isActive(item)) socket?.emit('file-cancel', { transferId: item.id, reason: '已取消' });
      for (const item of rows) release(item.id);
      rows = [];
      commit();
      lastBar = -2;
      void bridge()?.progress(-1).catch(() => undefined);
    },
  };
}

export type FileTransferChannel = ReturnType<typeof createFileTransferChannel>;
