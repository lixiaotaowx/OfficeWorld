import { mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { canReadChat } from './chat-access.mjs';

export const RETENTION = 7 * 24 * 60 * 60 * 1000;

// One record per file: atomic writes, no deployment-owned data or oversized files.
export function createChatStore(directory, now = Date.now) {
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const records = new Map();
  let last = 0;
  // One truncated or hand-edited record must not stop the whole service from
  // booting (systemd would restart it in a loop). Skip the bad file, keep every
  // readable one, and leave the file on disk for inspection.
  for (const file of readdirSync(directory)) {
    if (!file.endsWith(".json")) continue;
    let row;
    try {
      row = JSON.parse(readFileSync(join(directory, file), "utf8"));
      if (!row || !row.id || !Number.isFinite(row.time) || typeof row.text !== "string")
        throw Error("字段缺失");
    } catch (error) {
      console.error("OfficeWeb: 跳过损坏的聊天存档", file, error?.message || error);
      continue;
    }
    records.set(row.id, row);
    last = Math.max(last, Number(row.id.split("-")[0]) || 0);
  }
  function prune() {
    for (const [id, row] of records) {
      if (row.time < now() - RETENTION) {
        unlinkSync(join(directory, id + ".json"));
        records.delete(id);
      }
    }
  }
  prune();
  return {
    prune,
    all() { prune(); return [...records.values()]; },
    append(person, text, requestId, attachment, recipient = null) {
      prune();
      const existing = [...records.values()].find(r =>
        r.senderId === person.clientId && r.requestId === requestId);
      if (existing) {
        if ((existing.recipientId || null) !== (recipient?.id || null)) throw Error('请求的会话不一致');
        return existing;
      }
      const time = now();
      last = Math.max(time, last + 1);
      const row = { id: `${last}-${randomUUID()}`, time, name: person.name,
        senderId: person.clientId, text, requestId, ...(attachment ? { attachment } : {}),
        ...(recipient ? { recipientId: recipient.id, recipientName: recipient.name } : {}) };
      const path = join(directory, row.id + ".json");
      writeFileSync(path + ".next", JSON.stringify(row) + "\n", { mode: 0o600, flush: true });
      renameSync(path + ".next", path);
      records.set(row.id, row);
      return row;
    },
    page(after = "", accountId, visitor = false) {
      prune();
      const rows = [...records.values()].filter(r => r.id > after &&
        (accountId === undefined || canReadChat(r, accountId, visitor)))
        .sort((a, b) => a.id.localeCompare(b.id));
      const messages = rows.slice(0, 200);
      return { ok: true, messages, more: rows.length > 200,
        cursor: messages.at(-1)?.id || after };
    },
  };
}
