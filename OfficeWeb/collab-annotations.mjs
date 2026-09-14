// Annotation relay: whiteboard-style drawing over somebody's shared screen.
//
// Membership is the same rule the LiveKit token endpoint uses, so a stroke can
// only reach the peers of one private call (`call-<session id>`) or one meeting
// (`meeting-<id>`). Points arrive normalised to the shared image (0..1), never in
// pixels, so a stroke lands in the same place for every window size and for the
// sharer's own desktop overlay.
const MAX_POINTS_PER_MESSAGE = 64;
const MIN_INTERVAL_MS = 40;
const MAX_POINTS_PER_STROKE = 4000;

/** Who may see this scope: the other peer of one call, or the other members of one meeting. */
function peersOf(people, sessions, socketId, scope) {
  if (typeof scope !== "string") return [];
  if (scope.startsWith("call-")) {
    const session = sessions.get(scope.slice("call-".length));
    if (!session?.peers.includes(socketId)) return [];
    return session.peers.filter((id) => id !== socketId);
  }
  if (scope.startsWith("meeting-")) {
    const me = people.get(socketId);
    if (!me || me.meetingRoom !== scope) return [];
    return [...people.values()]
      .filter((person) => person.id !== socketId && person.meetingRoom === scope)
      .map((person) => person.id);
  }
  return [];
}

const clamp = (value) => Math.min(1, Math.max(0, Number(value)));
const cleanPoint = (point) => {
  if (!Array.isArray(point) || point.length < 2) return null;
  const x = Number(point[0]);
  const y = Number(point[1]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  return [clamp(x), clamp(y)];
};

export function createCollabAnnotations({ io, people, sessions }) {
  const lastSent = new Map();
  const strokeLength = new Map();

  function attach(socket) {
    socket.on("annotate", (data) => {
      const person = people.get(socket.id);
      if (!person) return;
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const stroke = typeof data?.stroke === "string" ? data.stroke.slice(0, 48) : "";
      if (!scope || !stroke) return;
      const now = Date.now();
      if (now - (lastSent.get(socket.id) || 0) < MIN_INTERVAL_MS) return;
      const points = Array.isArray(data?.points)
        ? data.points.slice(0, MAX_POINTS_PER_MESSAGE).map(cleanPoint).filter(Boolean)
        : [];
      const done = data?.done === true;
      if (!points.length && !done) return;
      const key = `${socket.id}:${stroke}`;
      const length = (strokeLength.get(key) || 0) + points.length;
      // A single stroke cannot grow without bound: stop relaying once it is huge.
      if (length > MAX_POINTS_PER_STROKE) return;
      if (done) strokeLength.delete(key);
      else strokeLength.set(key, length);
      const peers = peersOf(people, sessions, socket.id, scope);
      if (!peers.length) return;
      lastSent.set(socket.id, now);
      const message = {
        id: socket.id,
        clientId: person.clientId,
        name: String(person.name || "同事").slice(0, 24),
        scope,
        stroke,
        points,
        done,
      };
      for (const peer of peers) io.to(peer).emit("annotate", message);
    });
    // Clearing and undoing are drawing-board actions, so they follow the same
    // membership rule; the sender id lets each receiver drop only that person's work.
    socket.on("annotate-clear", (data) => {
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const person = people.get(socket.id);
      for (const peer of peersOf(people, sessions, socket.id, scope))
        io.to(peer).emit("annotate-clear", { id: socket.id, clientId: person?.clientId, scope });
    });
    socket.on("annotate-undo", (data) => {
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const person = people.get(socket.id);
      for (const peer of peersOf(people, sessions, socket.id, scope))
        io.to(peer).emit("annotate-undo", { id: socket.id, clientId: person?.clientId, scope });
    });
  }

  /** Called on disconnect so the throttle and stroke tables follow live sockets. */
  function forget(socketId) {
    lastSent.delete(socketId);
    for (const key of [...strokeLength.keys()])
      if (key.startsWith(`${socketId}:`)) strokeLength.delete(key);
  }

  return { attach, forget, peersOf: (socketId, scope) => peersOf(people, sessions, socketId, scope) };
}
