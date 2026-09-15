// Who is actually at their desk?
//
// A browser tab and the desktop app both get exactly one honest signal: whether
// the mouse or the keyboard has been used recently. Each client watches its own
// input and reports the two transitions (在座 / 离桌); the server keeps the
// timestamp of the moment somebody went away and publishes how long that was,
// so every screen shows the same 离座 time without trusting each other's clocks.
//
// A client that never reports (an older build, or a browser that could not
// detect input) simply stays 在座 - the default has to be the friendly one.
//
// The module registers its own `connection` listener (socket.io allows several),
// so `server.mjs` only has to wrap its `people` broadcast with `view()`.

/** Give a person the two fields this module owns; defaults mean 在座. */
function settle(person) {
  if (typeof person.atDesk !== "boolean") person.atDesk = true;
  if (person.atDesk) person.awaySince = null;
  else if (!person.awaySince) person.awaySince = Date.now();
  return person;
}

/**
 * @param {{ io: import("socket.io").Server, people: Map<string, any>, publish: () => void }} deps
 */
export function createInputPresence({ io, people, publish }) {
  io.on("connection", (socket) => {
    socket.on("input-state", (data) => {
      const person = people.get(socket.id);
      // Before `join` there is no person yet; the report is simply dropped.
      if (!person) return;
      const atDesk = data?.atDesk !== false;
      // Only transitions are worth a broadcast: a client that keeps saying
      // "still here" must not turn into a room-wide repaint.
      if (person.atDesk === atDesk) return;
      person.atDesk = atDesk;
      person.awaySince = atDesk ? null : Date.now();
      publish();
    });
  });
  return {
    /** The `people` payload: live records plus `atDesk` and how long away. */
    view() {
      const now = Date.now();
      return [...people.values()].map((person) => {
        settle(person);
        const { awaySince, ...rest } = person;
        return { ...rest, atDesk: person.atDesk, awayFor: person.atDesk ? 0 : now - awaySince };
      });
    },
  };
}
