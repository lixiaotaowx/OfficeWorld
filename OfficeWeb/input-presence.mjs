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
  person.onlineSince ??= Date.now();
  if (typeof person.atDesk !== "boolean") person.atDesk = true;
  if (person.atDesk) person.awaySince = null;
  else if (!person.awaySince) person.awaySince = Date.now();
  return person;
}

export function automaticExpression(person, now = Date.now()) {
  if (person.atDesk === false) return now - person.awaySince >= 300_000 ? 'sleepy' : 'away';
  if (person.busy === true) return 'busy';
  return now - person.onlineSince > 600_000 ? 'happy' : 'focused';
}

/**
 * How long the client says input had already stopped when it reported 离桌.
 * Clamped: never negative, never more than a day, and a missing value means the
 * clock starts now. The client sends it so 离座 reads from the moment the person
 * really stopped rather than from the 10 second threshold.
 */
function idleOf(data) {
  const idle = Number(data?.idleMs);
  if (!Number.isFinite(idle) || idle <= 0) return 0;
  return Math.min(idle, 24 * 60 * 60 * 1000);
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
      const busy = atDesk && data?.busy === true;
      // Only transitions are worth a broadcast: a client that keeps saying
      // "still here" must not turn into a room-wide repaint.
      if (person.atDesk === atDesk && (person.busy === true) === busy) return;
      person.busy = busy;
      person.atDesk = atDesk;
      person.awaySince = atDesk ? null : Date.now() - idleOf(data);
      publish();
    });
  });
  return {
    refresh() {
      if ([...people.values()].some(person =>
        automaticExpression(settle(person)) !== person.autoExpression)) publish();
    },
    /** The `people` payload: live records plus `atDesk` and how long away. */
    view() {
      const now = Date.now();
      return [...people.values()].map((person) => {
        settle(person);
        person.autoExpression = automaticExpression(person, now);
        const { awaySince, onlineSince, ...rest } = person;
        return { ...rest, atDesk: person.atDesk, awayFor: person.atDesk ? 0 : now - awaySince };
      });
    },
  };
}
