import type { Socket } from "socket.io-client";
import type { ChatAttachment, Message } from "./types";
// 下载期限的规则住在 fileTransferRules（聊天下载和头像直传共用同一条通道，规则只留一份）。
import { downloadTimeoutMs } from "./fileTransferRules";

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

/**
 * 单个聊天文件的上限：2 GB（用户 2026-09-21 要求，原为 20 MB）。
 * 服务端 `chat-files.mjs` 的 `MAX_FILE_SIZE` **必须和这个数一样**——那边才是硬门，这里只是早点报错。
 */
export const MAX_CHAT_FILE_BYTES = 2 * 1024 ** 3;

/**
 * 超过这个大小就不往 IndexedDB 里塞：浏览器的存储配额经不起几个 GB，
 * `put` 要么失败、要么卡住好几秒；缓存本来就只是"下次不用重下"的便利——
 * 服务器保留 7 天，跳过缓存不会让下载失败，只是下次要重新拉一遍。
 */
export const CACHE_MAX_BYTES = 256 * 1024 * 1024;

/**
 * **后台自动预取**的上限：只有不超过这个大小的附件才会在后台悄悄抓下来缓存 + 判断是不是图片。
 *
 * 原来是"所有附件都在后台自动收"，上限提到 2 GB 之后那就成了灾难——打开一次聊天会静默拉几个 GB。
 * 超过这个大小的附件改成**点了「下载」才走**（走 `fileTransfer` 那条通道，落到接收文件夹，
 * 有进度条和「打开 / 打开文件夹」，用户 2026-09-21 要求）。聊天图片基本都在这个尺寸以内。
 */
export const PREFETCH_MAX_BYTES = 4 * 1024 * 1024;

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
      { credentials: "same-origin", signal: AbortSignal.timeout(downloadTimeoutMs(attachment.size)) });
    if (response.status === 404 || response.status === 410) {
      gone.add(attachment.id);
      throw new AttachmentGoneError("服务器副本已过期，此设备未保存该文件");
    }
    if (!response.ok) throw Error("文件接收失败，请重试");
    const blob = await response.blob();
    if (blob.size !== attachment.size) throw new AttachmentGoneError("文件无法完整接收，可能已损坏");
    // 大文件不进 IndexedDB（见 CACHE_MAX_BYTES）：直接把手里的 Blob 交出去下载。
    if (blob.size > CACHE_MAX_BYTES) return blob;
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
  if (!file.size || file.size > MAX_CHAT_FILE_BYTES) throw Error("单个文件需为 1 字节至 2 GB");
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
