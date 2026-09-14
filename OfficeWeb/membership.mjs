/** Who is a member of the space right now, and who has been shown out.
 *
 * The chat conversation list is built from the account roster, so a colleague stays
 * listable while offline (you can leave them a message). Somebody the administrator
 * showed out of the space is different: they leave the member list, the chat list,
 * and lose the session they still hold, so they cannot walk straight back in
 * (user, 2026-09-15). Logging in again puts them back on the roster.
 *
 * Kept in its own module because `server.mjs` is at the project's 500 line ceiling.
 */
export function createMembership({ io, accounts }) {
  const ejected = new Set();
  return {
    /** Roster for the chat lists, or undefined to use the online people instead. */
    contacts: accounts
      ? () => accounts.listContacts().filter((contact) => !ejected.has(contact.id))
      : undefined,
    /** Account ids every conversation list must hide. */
    hidden: () => [...ejected],
    /** A fresh login clears the mark: they are a member again. */
    login: (accountId) => ejected.delete(accountId),
    /** Show somebody out: hide them, drop their session, close their sockets. */
    eject: (accountId) => {
      ejected.add(accountId);
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
