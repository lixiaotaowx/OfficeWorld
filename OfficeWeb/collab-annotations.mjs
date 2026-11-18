

const MAX_POINTS_PER_MESSAGE = 64;
const MIN_INTERVAL_MS = 40;
const MAX_POINTS_PER_STROKE = 4000;

const MAX_QUEUED_POINTS = 512;

const INK_COLORS = ['#e0524a', '#e8a33d', '#f0d274', '#5fb96a', '#4a9fd8', '#b46fd0', '#f4f2eb'];

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

  const queued = new Map();

  function drop(socketId) {
    const entry = queued.get(socketId);
    if (entry?.timer) clearTimeout(entry.timer);
    queued.delete(socketId);
  }

  function flush(socketId) {
    const entry = queued.get(socketId);
    const person = people.get(socketId);
    if (!entry || !person) { drop(socketId); return; }
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = undefined; }
    const points = entry.points.splice(0, MAX_POINTS_PER_MESSAGE);

    const done = entry.done === true && entry.points.length === 0;
    if (!points.length && !done) { drop(socketId); return; }
    if (done) entry.done = false;
    const key = `${socketId}:${entry.stroke}`;
    const length = (strokeLength.get(key) || 0) + points.length;

    if (length > MAX_POINTS_PER_STROKE) { drop(socketId); return; }
    if (done) strokeLength.delete(key);
    else strokeLength.set(key, length);
    lastSent.set(socketId, Date.now());
    const peers = peersOf(people, sessions, socketId, entry.scope);
    if (peers.length) {
      const message = {
        id: socketId,
        clientId: person.clientId,
        name: String(person.name || "Member").slice(0, 24),
        scope: entry.scope,
        stroke: entry.stroke,
        points,
        done,

        ...(entry.color ? { color: entry.color } : {}),
      };
      for (const peer of peers) io.to(peer).emit("annotate", message);
    }
    if (entry.points.length || entry.done) schedule(socketId);
    else drop(socketId);
  }

  function schedule(socketId) {
    const entry = queued.get(socketId);
    if (!entry || entry.timer) return;
    const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - (lastSent.get(socketId) || 0)));
    entry.timer = setTimeout(() => { entry.timer = undefined; flush(socketId); }, wait);
  }

  function drain(socketId) {
    for (let guard = 0; guard < 64; guard += 1) {
      const entry = queued.get(socketId);
      if (!entry) return;
      const pending = entry.points.length + (entry.done ? 1 : 0);
      flush(socketId);
      const after = queued.get(socketId);
      if (!after || after !== entry) return;
      if (after.points.length + (after.done ? 1 : 0) >= pending) return;
    }
  }

  function attach(socket) {
    socket.on("annotate", (data) => {
      const person = people.get(socket.id);
      if (!person) return;
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const stroke = typeof data?.stroke === "string" ? data.stroke.slice(0, 48) : "";
      if (!scope || !stroke) return;
      const points = Array.isArray(data?.points)
        ? data.points.slice(0, MAX_POINTS_PER_MESSAGE).map(cleanPoint).filter(Boolean)
        : [];
      const done = data?.done === true;
      if (!points.length && !done) return;

      const color = INK_COLORS.includes(data?.color) ? data.color : undefined;
      let entry = queued.get(socket.id);
      if (entry && (entry.scope !== scope || entry.stroke !== stroke)) {

        drain(socket.id);
        entry = undefined;
      }
      if (!entry) {
        entry = { scope, stroke, points: [], done: false, timer: undefined, color };
        queued.set(socket.id, entry);
      }
      for (const point of points) entry.points.push(point);
      if (entry.points.length > MAX_QUEUED_POINTS)
        entry.points.splice(0, entry.points.length - MAX_QUEUED_POINTS);
      if (done) entry.done = true;
      if (Date.now() - (lastSent.get(socket.id) || 0) >= MIN_INTERVAL_MS) flush(socket.id);
      else schedule(socket.id);
    });

    socket.on("annotate-clear", (data) => {
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const person = people.get(socket.id);

      drop(socket.id);
      for (const peer of peersOf(people, sessions, socket.id, scope))
        io.to(peer).emit("annotate-clear", { id: socket.id, clientId: person?.clientId, scope });
    });
    socket.on("annotate-undo", (data) => {
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const person = people.get(socket.id);
      drop(socket.id);
      for (const peer of peersOf(people, sessions, socket.id, scope))
        io.to(peer).emit("annotate-undo", { id: socket.id, clientId: person?.clientId, scope });
    });
  }

  function forget(socketId) {
    lastSent.delete(socketId);
    drop(socketId);
    for (const key of [...strokeLength.keys()])
      if (key.startsWith(`${socketId}:`)) strokeLength.delete(key);
  }

  return { attach, forget, peersOf: (socketId, scope) => peersOf(people, sessions, socketId, scope) };
}
