/** Who is a member of the space right now, and who has been shown out.
 *
 * The chat conversation list used to be built from the whole account roster, so a
 * colleague stays listable while offline (you can leave them a message). Somebody
 * the administrator showed out of the space is different: they leave the member
 * list, the chat list, and lose the session they still hold, so they cannot walk
 * straight back in (user, 2026-09-15). Logging in again puts them back on the
 * roster. The mark is kept on disk, or every restart would quietly forgive them.
 *
 * Kept in its own module because `server.mjs` is at the project's 500 line ceiling.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";

function load(path) {
  if (!path) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    // Missing or hand-edited file: nobody is shown out, which is the safe default.
    return [];
  }
}

export function createMembership({ io, accounts, path }) {
  const ejected = new Set(load(path));
  const save = () => {
    if (!path) return;
    try {
      writeFileSync(path + ".next", JSON.stringify([...ejected]) + "\n", { mode: 0o600 });
      renameSync(path + ".next", path);
    } catch (error) {
      console.error("OfficeWeb: 保存请出名单失败", error?.message || error);
    }
  };
  return {
    /** Roster for the chat lists, or undefined to use the online people instead. */
    contacts: accounts
      ? () => accounts.listContacts().filter((contact) => !ejected.has(contact.id))
      : undefined,
    /** Account ids every conversation list must hide. */
    hidden: () => [...ejected],
    /** A fresh login clears the mark: they are a member again. */
    login: (accountId) => {
      if (!ejected.delete(accountId)) return;
      save();
    },
    /** Show somebody out: hide them, drop their session, close their sockets. */
    eject: (accountId) => {
      if (ejected.has(accountId)) return;
      ejected.add(accountId);
      save();
      accounts?.revokeSessions(accountId);
      for (const socket of io.sockets.sockets.values()) {
        if (socket.data.account?.id === accountId) socket.disconnect(true);
      }
      // Tell everybody at once, so the conversation disappears now rather than at
      // the next periodic directory sync.
      io.emit("chat-directory", { hidden: [...ejected] });
    },
  };
}
