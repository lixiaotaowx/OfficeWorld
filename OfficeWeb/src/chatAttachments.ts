import type { Socket } from "socket.io-client";
import type { ChatAttachment, Message } from "./types";

/**
 * A copy that the server no longer has (it keeps files for seven days) or that
 * cannot arrive intact. Retrying can never succeed, so callers must stop the
 * background loop instead of re-fetching it forever.
 */
export class AttachmentGoneError extends Error {}

export interface AttachmentLoader {
  (attachment: ChatAttachment): Promise<Blob>;
  /** True once a fetch proved the server copy is unusable. */
  isGone(id: string): boolean;
}

export function createAttachmentCache(database: () => Promise<IDBDatabase>): AttachmentLoader {
  const inflight = new Map<string, Promise<Blob>>();
  const gone = new Set<string>();
  async function load(attachment: ChatAttachment): Promise<Blob> {
    const db = await database();
    const saved = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("files").objectStore("files").get(attachment.id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (saved) return saved;
    if (gone.has(attachment.id)) throw new AttachmentGoneError("服务器副本已过期，此设备未保存该文件");
    const response = await fetch(`/api/chat/files/${encodeURIComponent(attachment.id)}`,
      { credentials: "same-origin", signal: AbortSignal.timeout(60000) });
    if (response.status === 404 || response.status === 410) {
      gone.add(attachment.id);
      throw new AttachmentGoneError("服务器副本已过期，此设备未保存该文件");
    }
    if (!response.ok) throw Error("文件接收失败，请重试");
    const blob = await response.blob();
    if (blob.size !== attachment.size) throw new AttachmentGoneError("文件无法完整接收，可能已损坏");
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(blob, attachment.id);
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(Error("文件未保存，请检查本地存储空间"));
      tx.onerror = () => reject(Error("文件未保存，请检查本地存储空间"));
    });
    return blob;
  }
  const cached = ((attachment: ChatAttachment) => {
    const existing = inflight.get(attachment.id);
    if (existing) return existing;
    const promise = load(attachment).finally(() => inflight.delete(attachment.id));
    inflight.set(attachment.id, promise);
    return promise;
  }) as AttachmentLoader;
  cached.isGone = (id: string) => gone.has(id);
  return cached;
}

export async function uploadChatFile(socket: Socket, file: File,
  progress: (percent: number) => void, recipientId?: string): Promise<Message> {
  if (!file.size || file.size > 20 * 1024 * 1024) throw Error("单个文件需为 1 字节至 20 MB");
  if (file.name.length > 200) throw Error("文件名不超过 200 字");
  const requestId = crypto.randomUUID();
  let offset = 0;
  while (offset < file.size) {
    const bytes = await file.slice(offset, offset + 128 * 1024).arrayBuffer();
    let answer;
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!socket.connected) throw Error("连接中断，请重新发送文件");
      try {
        answer = await socket.timeout(15000).emitWithAck("chat-file",
          { requestId, name: file.name, size: file.size, offset, bytes, recipientId });
        break;
      } catch { if (attempt === 1) throw Error("未收到文件发送确认，请检查记录后重试"); }
    }
    if (!answer?.ok) throw Error(answer?.error || "文件发送失败");
    if (answer.message) { progress(100); return answer.message; }
    if (answer.offset <= offset || answer.offset > file.size) throw Error("文件发送进度异常");
    offset = answer.offset;
    progress(Math.floor(offset / file.size * 100));
  }
  throw Error("服务器尚未确认文件保存");
}
