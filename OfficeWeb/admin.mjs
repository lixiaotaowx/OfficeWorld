

import { createHash, timingSafeEqual } from "node:crypto";

const MAX_FAILS = 5;
const WINDOW_MS = 10 * 60000;

export function createAdmin({ io, people, roster, save, publish, adminPassword, seatCount,
  validSeat = () => false, eject = () => {} }) {
  const fails = new Map();
  const blocked = (socketId) => {
    const now = Date.now();
    for (const [id, entry] of fails) if (entry.until < now) fails.delete(id);
    return (fails.get(socketId)?.count || 0) >= MAX_FAILS;
  };
  const recordFail = (socketId) => {
    const entry = fails.get(socketId) || { count: 0, until: Date.now() + WINDOW_MS };
    entry.count++;
    fails.set(socketId, entry);
  };

  const secretMatches = (given) => timingSafeEqual(
    createHash("sha256").update(String(given)).digest(),
    createHash("sha256").update(adminPassword).digest(),
  );

  function release(socket, data, reply) {
    if (!adminPassword) return reply({ ok: false, error: "没有设置管理员密码" });
    if (blocked(socket.id))
      return reply({ ok: false, error: "管理员密码试得太多了，十分钟后再试" });
    if (!secretMatches(data?.password)) {
      recordFail(socket.id);
      return reply({ ok: false, error: "管理员密码不对" });
    }
    const seat = Number(data?.seat);
    if (!Number.isInteger(seat) || seat < 0 || (seat >= seatCount && !validSeat(seat)))
      return reply({ ok: false, error: "没有这个工位" });
    const owner = roster[seat];
    if (!owner) return reply({ ok: false, error: "这个工位本来就空着" });

    const previousRoster = { ...roster };
    const online = [...people.values()].filter((person) => person.clientId === owner.id);
    delete roster[seat];
    if (!save()) {
      for (const key of Object.keys(roster)) delete roster[key];
      Object.assign(roster, previousRoster);
      return reply({ ok: false, error: "工位没存上，再试一次" });
    }
    fails.delete(socket.id);

    for (const person of online) person.seat = null;
    publish();
    for (const person of online)
      io.to(person.id).emit("kicked", { seat, message: "An administrator removed you from the space. Please sign in again" });
    if (online.length) eject(owner.id);
    reply({ ok: true, seat, name: owner.name });
  }

  return {
    attach(socket) {
      socket.on("admin", (data, reply) => {
        if (typeof reply !== "function") return;
        release(socket, data, reply);
      });
    },

    forget(socketId) {
      fails.delete(socketId);
    },
  };
}
