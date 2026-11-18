

const MAX_IMAGE = 250000;
const MIN_INTERVAL_MS = 400;
const MAX_SENDERS = 256;

const WATCH_INTERVAL_MS = 700;

export function createPreviewRelay({ io, people }) {

  const frames = new Map();

  const sentAt = new Map();

  const watchedAt = new Map();

  const send = (socketId, image) => {
    for (const person of people.values()) {
      if (person.id === socketId || person.previewAllowed) {
        io.to(person.id).emit("preview", { id: socketId, image });
      }
    }
  };

  return {

    push(socket, image) {
      const person = people.get(socket.id);

      if (person?.role === "visitor") return false;
      if (!(person?.sharing || person?.previewSharing)) return false;
      if (typeof image !== "string" || image.length > MAX_IMAGE) return false;
      if (!image.startsWith("data:image/jpeg;base64,")) return false;
      if (Date.now() - (sentAt.get(socket.id) || 0) < MIN_INTERVAL_MS) return false;
      sentAt.set(socket.id, Date.now());

      if (frames.has(person.clientId) || frames.size < MAX_SENDERS) {
        frames.set(person.clientId, image);
      }
      send(socket.id, image);
      return true;
    },

    stop(socketId) {
      sentAt.delete(socketId);
      send(socketId, null);
    },

    snapshot(socketId) {
      for (const person of people.values()) {
        if (person.id === socketId) continue;
        const image = frames.get(person.clientId);
        if (image) io.to(socketId).emit("preview", { id: person.id, image });
      }
    },

    forget(socketId) {
      sentAt.delete(socketId);
    },

    watch(socket, rawTarget) {
      const from = people.get(socket.id);
      const targetId = String(rawTarget?.target ?? rawTarget ?? "");
      const target = people.get(targetId);

      if (!from || !target || target.id === from.id) return false;
      if (target.role === "visitor") return false;
      const key = `${from.id}->${target.id}`;
      const now = Date.now();
      if (now - (watchedAt.get(key) || 0) < WATCH_INTERVAL_MS) return false;
      watchedAt.set(key, now);

      io.to(target.id).emit("watched",
        { from: from.id, name: from.name, appearance: from.appearance ?? null });
      return true;
    },

    forgetWatch(socketId) {
      for (const key of [...watchedAt.keys()]) {
        if (key.startsWith(`${socketId}->`) || key.endsWith(`->${socketId}`)) watchedAt.delete(key);
      }
    },

    size: () => frames.size,
  };
}
