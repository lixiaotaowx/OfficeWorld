

import { readFileSync, renameSync, writeFileSync } from "node:fs";

function load(path) {
  if (!path) return [];
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {

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
      console.error("OfficeWeb: Could not save removal list", error?.message || error);
    }
  };
  return {

    contacts: accounts
      ? () => accounts.listContacts().filter((contact) => !ejected.has(contact.id))
      : undefined,

    hidden: () => [...ejected],

    login: (accountId) => {
      if (!ejected.delete(accountId)) return;
      save();
    },

    eject: (accountId) => {
      if (ejected.has(accountId)) return;
      ejected.add(accountId);
      save();
      accounts?.revokeSessions(accountId);
      for (const socket of io.sockets.sockets.values()) {
        if (socket.data.account?.id === accountId) socket.disconnect(true);
      }

      io.emit("chat-directory", { hidden: [...ejected] });
    },
  };
}
