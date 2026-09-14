import { mkdirSync, readdirSync, writeFileSync, appendFileSync, renameSync,
  rmSync, createReadStream } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { canReadChat, recipientFor, publishChat } from './chat-access.mjs';

export const MAX_FILE_SIZE = 20 * 1024 * 1024;
const CHUNK = 128 * 1024;
const validId = id => typeof id === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(id);

// Chunks stay below the existing Socket.IO/proxy limit. Only acknowledged,
// complete files become messages; abandoned uploads never enter chat history.
export function createChatFiles(directory, store) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const pending = new Map();
  const path = id => join(directory, id);
  const discard = upload => {
    rmSync(path(upload.id + ".part"), { force: true });
    pending.delete(upload.owner);
  };
  function prune() {
    for (const upload of pending.values()) {
      if (upload.updated < Date.now() - 120000) discard(upload);
    }
    const keep = new Set(store.all().map(row => row.attachment?.id).filter(Boolean));
    for (const upload of pending.values()) keep.add(upload.id + ".part");
    for (const file of readdirSync(directory)) {
      if (!keep.has(file)) rmSync(path(file), { force: true });
    }
  }
  prune();
  function attach(io, socket, people, contacts = () =>
    [...people.values()].map(p => ({ id: p.clientId, name: p.name }))) {
    socket.on("chat-file", (data, reply) => {
      if (typeof reply !== "function") return;
      try {
        const person = people.get(socket.id);
        if (!person || !validId(data?.requestId)) throw Error("请先进入空间");
        const recipient = recipientFor(data.recipientId, person, contacts());
        // File messages follow the same rule as text: no public channel for visitors.
        if (!recipient && person.role === "visitor")
          throw Error("访客不能发公共聊天，请私聊同事");
        const existing = store.all().find(row => row.senderId === person.clientId &&
          row.requestId === data.requestId);
        if (existing) {
          if ((existing.recipientId || null) !== (recipient?.id || null)) throw Error('请求的会话不一致');
          return reply({ ok: true, message: existing });
        }
        if (!Buffer.isBuffer(data.bytes) || data.bytes.length > CHUNK ||
            !Number.isSafeInteger(data.offset) || data.offset < 0)
          throw Error("无效的文件分片");
        let upload = pending.get(person.clientId);
        if (upload && upload.requestId !== data.requestId) {
          if (upload.updated > Date.now() - 120000) throw Error("请等待当前文件发送完成");
          discard(upload); upload = undefined;
        }
        if (!upload) {
          if (data.offset !== 0 || !Number.isSafeInteger(data.size) ||
              data.size < 1 || data.size > MAX_FILE_SIZE ||
              typeof data.name !== "string" || !data.name.trim() || data.name.length > 200)
            throw Error("文件需为 1 字节至 20 MB，文件名不超过 200 字");
          if (pending.size >= 20) throw Error("上传繁忙，请稍后重试");
          upload = { id: randomUUID(), owner: person.clientId, socketId: socket.id,
            requestId: data.requestId, name: data.name.replace(/[\\/\x00-\x1f\x7f]/g, "_"),
            size: data.size, offset: 0, updated: Date.now(), recipient };
          writeFileSync(path(upload.id + ".part"), Buffer.alloc(0), { mode: 0o600 });
          pending.set(person.clientId, upload);
        }
        if ((upload.recipient?.id || null) !== (recipient?.id || null)) throw Error('文件接收人不能中途改变');
        if (data.offset < upload.offset && data.offset + data.bytes.length <= upload.offset)
          return reply({ ok: true, offset: upload.offset });
        if (data.offset !== upload.offset || !data.bytes.length ||
            upload.offset + data.bytes.length > upload.size) throw Error("文件分片顺序错误");
        appendFileSync(path(upload.id + ".part"), data.bytes,
          { flush: upload.offset + data.bytes.length === upload.size });
        upload.offset += data.bytes.length;
        upload.updated = Date.now();
        if (upload.offset < upload.size) return reply({ ok: true, offset: upload.offset });
        const attachment = { id: upload.id, name: upload.name, size: upload.size };
        renameSync(path(upload.id + ".part"), path(upload.id));
        pending.delete(person.clientId);
        let message;
        try { message = store.append(person, "", data.requestId, attachment, upload.recipient); }
        catch (error) { rmSync(path(upload.id), { force: true }); throw error; }
        publishChat(io, people, message);
        reply({ ok: true, message });
      } catch (error) { reply({ ok: false, error: error.message || "文件发送失败" }); }
    });
    socket.on("chat-file-cancel", () => {
      for (const upload of pending.values()) if (upload.socketId === socket.id) discard(upload);
    });
    socket.on("disconnect", () => {
      for (const upload of pending.values()) if (upload.socketId === socket.id) discard(upload);
    });
  }
  function handle(req, res, accounts) {
    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/api/chat/files/")) return false;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const account = accounts?.authenticate(req);
    if (!account) { res.writeHead(401); res.end(); return true; }
    if (req.method !== "GET") { res.writeHead(405); res.end(); return true; }
    const id = url.pathname.slice("/api/chat/files/".length);
    let attachment;
    try {
      const row = store.all().find(row => row.attachment?.id === id);
      if (row && !canReadChat(row, account.id, account.role === "visitor")) { res.writeHead(403); res.end(); return true; }
      attachment = row?.attachment;
    }
    catch { res.writeHead(503); res.end(); return true; }
    if (!attachment) { res.writeHead(410); res.end(); return true; }
    res.setHeader("Content-Type", "application/octet-stream");
    const name = Buffer.from(attachment.name, "utf8").toString("utf8");
    res.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodeURIComponent(name));
    res.setHeader("Content-Length", attachment.size);
    const stream = createReadStream(path(attachment.id));
    stream.on("error", () => {
      if (!res.headersSent) { res.removeHeader("Content-Length"); res.writeHead(404); res.end(); }
      else res.destroy();
    });
    res.on("close", () => stream.destroy());
    stream.pipe(res);
    return true;
  }
  return { attach, handle, prune };
}
