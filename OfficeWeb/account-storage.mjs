import { readFileSync, writeFileSync, renameSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** One small file per account, so persistent text files do not grow unbounded. */
export function loadAccounts(path) {
  let legacy = { users: [], sessions: [] };
  try { legacy = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  if (!Array.isArray(legacy.users) || !Array.isArray(legacy.sessions)) throw Error("账号文件格式错误");
  const users = new Map(legacy.users.map(u => [u.id, u]));
  const sessions = new Map(legacy.users.map(u => [u.id, legacy.sessions.filter(s => s.userId === u.id)]));
  let files = [];
  try { files = readdirSync(path + ".d").filter(f => f.endsWith(".json")); }
  catch (e) { if (e.code !== "ENOENT") throw e; }
  for (const file of files) {
    const entry = JSON.parse(readFileSync(join(path + ".d", file), "utf8"));
    if (!entry.user?.id || !Array.isArray(entry.sessions)) throw Error("账号文件格式错误");
    users.set(entry.user.id, entry.user);
    sessions.set(entry.user.id, entry.sessions);
  }
  return { users: [...users.values()], sessions: [...sessions.values()].flat() };
}

export function saveAccounts(path, data) {
  const folder = path + ".d";
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  for (const user of data.users) {
    if (!/^[a-f0-9-]{36}$/.test(user.id)) throw Error("账号 ID 无效");
    const sessions = data.sessions.filter(s => s.userId === user.id && s.expires > Date.now()).slice(-12);
    const body = JSON.stringify({ user, sessions }, null, 2) + "\n";
    if (body.split("\n").length > 500) throw Error("账号文件超过行数限制");
    const file = join(folder, user.id + ".json");
    writeFileSync(file + ".next", body, { mode: 0o600 });
    renameSync(file + ".next", file);
  }
}
