import type { Socket } from "socket.io-client";
import type { Message, ChatContact } from "./types";
import { openChatArchive, readArchive, saveArchive, mergeMessages } from "./chatLocal";
import { AttachmentGoneError, PREFETCH_MAX_BYTES, createAttachmentCache, uploadChatFile } from "./chatAttachments";

type Page = { ok: boolean; error?: string; messages: Message[]; cursor: string; more: boolean };

export function attachChatClient(socket: Socket, accountId: string,
  update: (fn: (old: Message[]) => Message[]) => void, notice: (text: string) => void,
  contacts: (people: ChatContact[], hidden: string[]) => void = () => {}) {
  let disposed = false, syncing = false, cursor = "";
  let db: IDBDatabase | undefined;
  /** Last directory the server sent, kept so a pushed hidden-list can be applied. */
  let directory: ChatContact[] = [];
  const pendingFiles = new Map<string, NonNullable<Message["attachment"]>>();
  let savingFiles = false, sendingFile = false, reportedFileError = false;
  const loadFile = createAttachmentCache(async () => {
    await ready;
    if (!db || disposed) throw Error("本地存储不可用");
    return db;
  });
  async function saveFiles() {
    if (savingFiles || disposed) return;
    savingFiles = true;
    try {
      for (const [id, file] of pendingFiles) {
        if (disposed) break;
        try { await loadFile(file); pendingFiles.delete(id); }
        catch (error) {
          // An expired or damaged server copy can never be fetched again, so
          // drop it instead of re-requesting it every 30 seconds forever.
          if (error instanceof AttachmentGoneError) { pendingFiles.delete(id); continue; }
          if (!disposed && !reportedFileError) {
            reportedFileError = true;
            notice("部分附件尚未保存到本机，将自动重试；请在 7 天内保持连接完成接收。");
          }
        }
      }
      if (!pendingFiles.size) reportedFileError = false;
    } finally { savingFiles = false; }
  }
  const show = (messages: Message[]) => {
    if (!disposed) update(old => mergeMessages(old, messages));
    for (const message of messages) {
      const attachment = message.attachment;
      if (!attachment || loadFile.isGone(attachment.id)) continue;
      // **只后台预取小附件**（图片预览和"离线也能看"靠它）。上限提到 2 GB 之后，
      // "所有附件都自动收"会在打开聊天时静默拉几个 GB；大文件改成点了「下载」才走
      // （落到接收文件夹、有进度条和「打开 / 打开文件夹」，用户 2026-09-21 要求）。
      if (attachment.size > PREFETCH_MAX_BYTES) continue;
      pendingFiles.set(attachment.id, attachment);
    }
    void saveFiles();
  };
  const storageError = () => {
    if (!disposed) notice("聊天未能保存到本地，请检查浏览器存储空间或权限；服务器仅保留 7 天。");
  };
  const ready = (async () => {
    try {
      db = await openChatArchive(accountId);
      if (disposed) { db.close(); return; }
      const saved = await readArchive(db);
      cursor = saved.cursor;
      show(saved.messages);
      // Request eviction protection when the browser supports it; no deletion fallback.
      void navigator.storage?.persist?.().catch(() => false);
    } catch { storageError(); }
  })();
  async function receive(message: Message) {
    await ready;
    if (disposed) return;
    show([message]);
    try {
      if (!db) throw Error("存储不可用");
      await saveArchive(db, [message]);
    } catch { storageError(); }
  }
  async function sync() {
    await ready;
    if (disposed || syncing || !socket.connected) return;
    syncing = true;
    try {
      const reply = await socket.timeout(10000).emitWithAck('chat-contacts');
      // `hidden` lists accounts shown out of the space: their conversations must not
      // be offered, even though their older messages are still in the archive.
      if (!disposed && reply?.ok) {
        directory = reply.contacts || [];
        contacts(directory, Array.isArray(reply.hidden) ? reply.hidden : []);
      }
      let after = cursor;
      do {
        const page: Page = await socket.timeout(10000).emitWithAck("chat-history", after);
        if (disposed) return;
        if (!page.ok) throw Error(page.error);
        show(page.messages);
        if (db) {
          try {
            await saveArchive(db, page.messages, page.cursor);
            cursor = page.cursor;
          } catch { storageError(); return; }
        }
        after = page.cursor;
        if (!page.more) break;
      } while (socket.connected && !disposed);
    } catch {
      if (!disposed) notice("历史消息补收暂未完成，连接恢复后会自动重试。");
    } finally { syncing = false; }
  }
  socket.on("chat", receive);
  socket.on("connect", sync);
  // Pushed when somebody is shown out of the space, so the conversation disappears
  // immediately instead of at the next sync.
  const applyDirectory = (payload: { hidden?: string[] }) => {
    if (disposed || !Array.isArray(payload?.hidden)) return;
    contacts(directory, payload.hidden);
  };
  socket.on("chat-directory", applyDirectory);
  // Retry gaps and failed history requests even without a fresh connection event.
  const retry = window.setInterval(() => { void sync(); void saveFiles(); }, 30000);
  return {
    loadFile,
    async sendFile(file: File, progress: (percent: number) => void, recipientId?: string) {
      if (sendingFile) { notice("请等待当前文件发送完成"); return false; }
      sendingFile = true;
      try {
        await receive(await uploadChatFile(socket, file, progress, recipientId));
        return true;
      } catch (error) {
        socket.emit("chat-file-cancel");
        notice(error instanceof Error ? error.message : "文件发送失败");
        return false;
      } finally { sendingFile = false; }
    },
    async send(text: string, recipientId?: string) {
      if (!socket.connected) { notice("连接已断开，请恢复后发送"); return false; }
      const payload = { text, requestId: crypto.randomUUID(), recipientId };
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const answer = await socket.timeout(10000).emitWithAck("chat", payload);
          if (!answer?.ok) { notice(answer?.error || "发送失败"); return false; }
          await receive(answer.message);
          return true;
        } catch {
          if (!socket.connected) break;
        }
      }
      notice("未收到发送确认，内容已保留在输入框；请先检查聊天记录再重试。");
      return false;
    },
    dispose() {
      disposed = true;
      clearInterval(retry);
      socket.off("chat", receive);
      socket.off("connect", sync);
      socket.off("chat-directory", applyDirectory);
      db?.close();
    },
  };
}
