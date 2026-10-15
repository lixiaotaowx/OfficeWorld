// Annotation relay: whiteboard-style drawing over somebody's shared screen.
//
// Membership is the same rule the LiveKit token endpoint uses, so a stroke can
// only reach the peers of one private call (`call-<session id>`) or one meeting
// (`meeting-<id>`). Points arrive normalised to the shared image (0..1), never in
// pixels, so a stroke lands in the same place for every window size and for the
// sharer's own desktop overlay.
//
// The rate limit must never drop a segment: a dropped batch used to leave a visible
// gap in the stroke (user, 2026-09-15: "画笔断开"). Messages that arrive inside the
// limit are therefore queued and flushed on a timer instead of being discarded.
const MAX_POINTS_PER_MESSAGE = 64;
const MIN_INTERVAL_MS = 40;
const MAX_POINTS_PER_STROKE = 4000;
/** Bound on one socket's backlog, so a stuck peer cannot grow it without limit. */
const MAX_QUEUED_POINTS = 512;

/**
 * 允许转发的笔色。**必须与 `src/inkColors.ts` 的 `INK_COLORS` 和
 * `OfficeDesktop/annotation-overlay.js` 的 `INKS` 三份一致** ——
 * `test/ink-colors.test.mjs` 逐字核对这三份，漂了当场红。
 *
 * 这一层只做白名单（认不得的颜色不转发），"认不得就退回按人固定色"由浮层负责。
 */
const INK_COLORS = ['#e0524a', '#e8a33d', '#f0d274', '#5fb96a', '#4a9fd8', '#b46fd0', '#f4f2eb'];

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
  /** socketId -> one pending batch: { scope, stroke, points, done, timer } */
  const queued = new Map();

  function drop(socketId) {
    const entry = queued.get(socketId);
    if (entry?.timer) clearTimeout(entry.timer);
    queued.delete(socketId);
  }

  /** Send what is queued for one socket; the rest waits for the next tick. */
  function flush(socketId) {
    const entry = queued.get(socketId);
    const person = people.get(socketId);
    if (!entry || !person) { drop(socketId); return; }
    if (entry.timer) { clearTimeout(entry.timer); entry.timer = undefined; }
    const points = entry.points.splice(0, MAX_POINTS_PER_MESSAGE);
    // `done` travels only after the last point of that stroke, or the receiver would
    // finish the stroke early and drop whatever arrives afterwards.
    const done = entry.done === true && entry.points.length === 0;
    if (!points.length && !done) { drop(socketId); return; }
    if (done) entry.done = false;
    const key = `${socketId}:${entry.stroke}`;
    const length = (strokeLength.get(key) || 0) + points.length;
    // A single stroke cannot grow without bound: stop relaying once it is huge.
    if (length > MAX_POINTS_PER_STROKE) { drop(socketId); return; }
    if (done) strokeLength.delete(key);
    else strokeLength.set(key, length);
    lastSent.set(socketId, Date.now());
    const peers = peersOf(people, sessions, socketId, entry.scope);
    if (peers.length) {
      const message = {
        id: socketId,
        clientId: person.clientId,
        name: String(person.name || "同事").slice(0, 24),
        scope: entry.scope,
        stroke: entry.stroke,
        points,
        done,
        // 笔色（可选）：**必须在这里列出来**，否则页面发的颜色在这层就没了 —— 转发是按字段
        // 重建的，没写的字段会被静默丢掉（用户 2026-10-15 报「标记没有颜色」的真因）。
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

  /**
   * Send everything still queued for one socket, in order, right now.
   *
   * `queued` holds one entry per socket, so starting the next stroke would overwrite
   * whatever the old one still had waiting — losing its last points and its `done`.
   * That showed up as a gap and as a stroke the next one appeared to join, so the
   * previous entry is always drained before the new one takes its place. Bounded by
   * the per-socket backlog, so this is at most a handful of messages.
   */
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
      // 观众挑的笔色：**只在起笔那一条消息上带**（页面就是这么发的），所以要跟着这一笔
      // 存在 batch 里、由 flush 原样转发。不认得的颜色一律不发 —— 转发层只做白名单，
      // 判断"这条颜色合不合法"是浮层的事（它会退回按人固定色）。
      const color = INK_COLORS.includes(data?.color) ? data.color : undefined;
      let entry = queued.get(socket.id);
      if (entry && (entry.scope !== scope || entry.stroke !== stroke)) {
        // A different stroke began: the previous one goes out now, completely, in order.
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
    // Clearing and undoing are drawing-board actions, so they follow the same
    // membership rule; the sender id lets each receiver drop only that person's work.
    socket.on("annotate-clear", (data) => {
      const scope = typeof data?.scope === "string" ? data.scope : "";
      const person = people.get(socket.id);
      // Whatever is still queued belongs to the board that is being cleared.
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

  /** Called on disconnect so the throttle, queue and stroke tables follow live sockets. */
  function forget(socketId) {
    lastSent.delete(socketId);
    drop(socketId);
    for (const key of [...strokeLength.keys()])
      if (key.startsWith(`${socketId}:`)) strokeLength.delete(key);
  }

  return { attach, forget, peersOf: (socketId, scope) => peersOf(people, sessions, socketId, scope) };
}
