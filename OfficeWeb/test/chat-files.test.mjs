import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventEmitter } from "node:events";
import { createChatStore, RETENTION } from "../chat-store.mjs";
import { createChatFiles, MAX_FILE_SIZE } from "../chat-files.mjs";

test("附件分片去重、取消、大小校验、持久化与七天实际清理", () => {
  const dir = mkdtempSync(join(tmpdir(), "chat-files-"));
  let now = Date.now();
  try {
    const store = createChatStore(dir, () => now);
    const files = createChatFiles(join(dir, "files"), store);
    const socket = new EventEmitter(); socket.id = "socket-a";
    const broadcast = [];
    // `to(socketId)` is what publishChat uses for the public channel, because a
    // visiting client is skipped there; the fake io mirrors both shapes.
    const io = {
      emit: (event, message) => broadcast.push(message),
      to: () => ({ emit: (event, message) => broadcast.push(message) }),
    };
    files.attach(io, socket,
      new Map([[socket.id, { clientId: "a", name: "同事" }]]));
    const send = data => { let reply; socket.emit("chat-file", data, answer => reply = answer); return reply; };
    const first = { requestId: "file-one", name: "../中文\r\n.txt", size: 6, offset: 0, bytes: Buffer.from("abc") };
    assert.equal(send({ ...first, size: MAX_FILE_SIZE + 1 }).ok, false);
    assert.equal(send(first).offset, 3);
    assert.equal(send(first).offset, 3, "重发已确认分片不会重复写入");
    assert.equal(store.all().length, 0, "不广播半个文件");
    assert.equal(send({ ...first, offset: 4 }).ok, false);
    const complete = send({ ...first, offset: 3, bytes: Buffer.from("def") });
    assert.equal(complete.ok, true);
    assert.equal(send(first).message.id, complete.message.id);
    assert.equal(broadcast.length, 1);
    const path = join(dir, "files", complete.message.attachment.id);
    assert.equal(readFileSync(path, "utf8"), "abcdef");
    assert.ok(!/[\/\r\n]/.test(complete.message.attachment.name));
    assert.equal(createChatStore(dir, () => now).all()[0].attachment.id, complete.message.attachment.id);
    send({ ...first, requestId: "cancel" });
    socket.emit("chat-file-cancel");
    files.prune();
    now += RETENTION;
    files.prune(); assert.equal(existsSync(path), true, "恰好七天可接收");
    now++;
    files.prune(); assert.equal(existsSync(path), false);
    assert.equal(store.all().length, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
