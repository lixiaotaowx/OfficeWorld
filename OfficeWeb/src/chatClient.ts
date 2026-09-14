import type { Socket } from "socket.io-client";
import type { Message, ChatContact } from "./types";
import { openChatArchive, readArchive, saveArchive, mergeMessages } from "./chatLocal";
import { AttachmentGoneError, createAttachmentCache, uploadChatFile } from "./chatAttachments";

type Page = { ok: boolean; error?: string; messages: Message[]; cursor: string; more: boolean };

export function attachChatClient(socket: Socket, accountId: string,
  update: (fn: (old: Message[]) => Message[]) => void, notice: (text: string) => void,
  contacts: (people: ChatContact[]) => void = () => {}) {
  let disposed = false, syncing = false, cursor = "";
  let db: IDBDatabase | undefined;
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
    for (const message of messages) if (message.attachment && !loadFile.isGone(message.attachment.id))
      pendingFiles.set(message.attachment.id, message.attachment);
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
      const directory = await socket.timeout(10000).emitWithAck('chat-contacts');
      if (!disposed && directory?.ok) contacts(directory.contacts);
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
      db?.close();
    },
  };
}
