import type { Message } from "./types";

export function openChatArchive(accountId: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`office-chat-${accountId}`, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("messages"))
        request.result.createObjectStore("messages", { keyPath: "id" });
      if (!request.result.objectStoreNames.contains("meta")) request.result.createObjectStore("meta");
      request.result.createObjectStore("files");
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error("本地存储被其他页面占用"));
  });
}

export function readArchive(db: IDBDatabase): Promise<{ messages: Message[]; cursor: string }> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["messages", "meta"], "readonly");
    const messages = tx.objectStore("messages").getAll();
    const cursor = tx.objectStore("meta").get("cursor");
    tx.oncomplete = () => resolve({ messages: messages.result, cursor: cursor.result || "" });
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
  });
}

// The history cursor only advances in the transaction saving that complete page.
// Live messages never advance it: a disconnect may have skipped earlier messages.
export function saveArchive(db: IDBDatabase, messages: Message[], cursor?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["messages", "meta"], "readwrite");
    for (const message of messages) tx.objectStore("messages").put(message);
    if (cursor !== undefined) tx.objectStore("meta").put(cursor, "cursor");
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
  });
}

export function mergeMessages(old: Message[], incoming: Message[]) {
  const rows = new Map(old.map(row => [row.id, row]));
  for (const row of incoming) rows.set(row.id, row);
  return [...rows.values()].sort((a, b) => a.id.localeCompare(b.id));
}
