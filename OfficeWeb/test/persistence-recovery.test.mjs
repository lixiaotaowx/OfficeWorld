// A broken runtime file must never stop the service from booting, and a failed
// roster write must never silently free a permanent desk. These cover the two
// failure modes found in the 2026-09-14 audit.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { io } from "socket.io-client";
import { createChatStore } from "../chat-store.mjs";
import { createOfficeServer } from "../server.mjs";

const ADMIN_PASSWORD = "isolated-persistence-test";

/** `console.error` is expected on the recovery paths; keep the test output clean. */
async function quiet(run) {
  const original = console.error;
  console.error = () => {};
  try {
    return await run();
  } finally {
    console.error = original;
  }
}

function connectTo(port, sockets, name, id) {
  return new Promise((resolve) => {
    const socket = io(`http://127.0.0.1:${port}`, { transports: ["websocket"] });
    sockets.push(socket);
    socket.on("connect", () => {
      socket.emit("join", { name, id });
      socket.on("people", (people) => {
        if (people.length) resolve(socket);
      });
    });
  });
}

test("损坏的聊天存档被跳过，服务仍能启动并读到完好的记录", async () => {
  const dir = mkdtempSync(join(tmpdir(), "office-chat-recovery-"));
  try {
    const now = Date.now();
    writeFileSync(join(dir, "1000-ok.json"), JSON.stringify(
      { id: "1000-ok", time: now, text: "hi", name: "同事", senderId: "s" }));
    writeFileSync(join(dir, "1500-truncated.json"), '{"id":"1500-truncated","time":');
    writeFileSync(join(dir, "2000-fields.json"), JSON.stringify({ id: "2000-fields" }));
    const store = await quiet(() => createChatStore(dir));
    assert.deepEqual(store.all().map((row) => row.id), ["1000-ok"]);
    assert.deepEqual(store.page("").messages.map((row) => row.text), ["hi"]);
    // The unreadable files stay on disk for inspection instead of being deleted.
    assert.ok(readFileSync(join(dir, "1500-truncated.json"), "utf8").startsWith("{"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("工位无法持久化时拒绝认领，管理员释放失败时不丢工位", async () => {
  // The save path logs every failure on purpose; keep the test output readable.
  const originalError = console.error;
  console.error = () => {};
  const dir = mkdtempSync(join(tmpdir(), "office-state-recovery-"));
  const stateDir = join(dir, "state");
  const movedDir = join(dir, "state-ok");
  mkdirSync(stateDir);
  const sockets = [];
  const { http } = createOfficeServer({
    authentication: false,
    statePath: join(stateDir, "state.json"),
    adminPassword: ADMIN_PASSWORD,
  });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  const port = http.address().port;
  try {
    const person = await connectTo(port, sockets, "owner", "owner-persist");
    assert.equal((await person.emitWithAck("seat", 2)).ok, true);
    // Break persistence without touching the running process: the state
    // directory becomes a plain file, so every later write fails (ENOTDIR).
    renameSync(stateDir, movedDir);
    writeFileSync(stateDir, "blocked");
    const refused = await person.emitWithAck("seat", 3);
    assert.equal(refused.ok, false);
    assert.match(refused.error, /保存/);
    const denied = await person.emitWithAck("admin", { seat: 2, password: ADMIN_PASSWORD });
    assert.equal(denied.ok, false);
    assert.match(denied.error, /保存/);
    // The desk is still owned on disk, so a restart cannot resurrect or lose it.
    const onDisk = JSON.parse(readFileSync(join(movedDir, "state.json"), "utf8"));
    assert.equal(onDisk.seats[2].id, "owner-persist");
    // Restore the filesystem and confirm the in-memory roster rolled back too.
    rmSync(stateDir, { force: true });
    renameSync(movedDir, stateDir);
    const freed = await person.emitWithAck("admin", { seat: 2, password: ADMIN_PASSWORD });
    assert.equal(freed.ok, true);
    assert.equal(freed.name, "owner");
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    http.close();
    rmSync(dir, { recursive: true, force: true });
    console.error = originalError;
  }
});

test("管理员密码连续猜错会被限流", async () => {
  const dir = mkdtempSync(join(tmpdir(), "office-admin-throttle-"));
  const sockets = [];
  const { http } = createOfficeServer({
    authentication: false,
    statePath: join(dir, "state.json"),
    adminPassword: ADMIN_PASSWORD,
  });
  await new Promise((resolve) => http.listen(0, "127.0.0.1", resolve));
  try {
    const person = await connectTo(http.address().port, sockets, "owner", "owner-throttle");
    await person.emitWithAck("seat", 1);
    for (let attempt = 0; attempt < 5; attempt++) {
      const wrong = await person.emitWithAck("admin", { seat: 1, password: `wrong-${attempt}` });
      assert.equal(wrong.ok, false);
      assert.match(wrong.error, /不正确/);
    }
    const blocked = await person.emitWithAck("admin", { seat: 1, password: ADMIN_PASSWORD });
    assert.equal(blocked.ok, false);
    assert.match(blocked.error, /频繁/);
  } finally {
    sockets.forEach((socket) => socket.disconnect());
    http.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
