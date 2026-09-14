// An attachment the server no longer has must be marked permanently gone, so the
// chat client stops re-fetching it every 30 seconds (audit finding 2026-09-14).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const js = ts.transpileModule(readFileSync(new URL("../src/chatAttachments.ts", import.meta.url), "utf8"),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { AttachmentGoneError, createAttachmentCache } =
  await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

/** Minimal stand-in for the IndexedDB objects the cache touches. */
function fakeDatabase() {
  const store = new Map();
  const objectStore = {
    get(key) {
      const request = {};
      queueMicrotask(() => { request.result = store.get(key); request.onsuccess?.(); });
      return request;
    },
    put(value, key) {
      store.set(key, value);
      queueMicrotask(() => transaction.oncomplete?.());
      return {};
    },
  };
  const transaction = { objectStore: () => objectStore, oncomplete: undefined, onabort: undefined, onerror: undefined };
  return { database: { transaction: () => transaction }, store };
}

const attachment = (id, size) => ({ id, name: "文件.bin", size });

test("410/404 会把附件标记为永久失效，且不再发出第二次请求", async () => {
  const { database } = fakeDatabase();
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { ok: false, status: 410, blob: async () => new Blob() }; };
  const load = createAttachmentCache(async () => database);
  const file = attachment("gone-1", 3);
  await assert.rejects(() => load(file), (error) => error instanceof AttachmentGoneError);
  assert.equal(load.isGone(file.id), true);
  await assert.rejects(() => load(file), (error) => error instanceof AttachmentGoneError);
  assert.equal(calls, 1, "失效的附件不应再次联网");
});

test("可重试的失败不会被标记为永久失效", async () => {
  const { database } = fakeDatabase();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) return { ok: false, status: 503, blob: async () => new Blob() };
    // Second attempt is a truncated body: a deterministic mismatch, not a
    // transient failure, so it must not stay in the retry loop forever.
    if (calls === 2) return { ok: true, status: 200, blob: async () => new Blob([new Uint8Array(2)]) };
    return { ok: true, status: 200, blob: async () => new Blob([new Uint8Array(3)]) };
  };
  const load = createAttachmentCache(async () => database);
  const file = attachment("retry-1", 3);
  await assert.rejects(() => load(file), (error) => !(error instanceof AttachmentGoneError));
  assert.equal(load.isGone(file.id), false);
  await assert.rejects(() => load(file), /无法完整接收/);
  assert.equal(calls, 2);
  const stored = createAttachmentCache(async () => database);
  assert.deepEqual(await stored(file), new Blob([new Uint8Array(3)]));
});

test("已保存到本机的附件直接返回，不再联网", async () => {
  const { database, store } = fakeDatabase();
  store.set("saved-1", new Blob([new Uint8Array(2)]));
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { ok: false, status: 410, blob: async () => new Blob() }; };
  const load = createAttachmentCache(async () => database);
  assert.deepEqual(await load(attachment("saved-1", 2)), new Blob([new Uint8Array(2)]));
  assert.equal(calls, 0);
});
