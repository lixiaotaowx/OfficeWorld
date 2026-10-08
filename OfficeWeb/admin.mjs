// Administrator actions: freeing a permanently held desk.
//
// The password is checked per request, so an authenticated admin panel simply
// repeats the same secret. Because that secret is shared, wrong guesses are
// throttled per socket and the comparison is constant time.
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
  // Hash both sides so the comparison neither leaks length nor short-circuits.
  const secretMatches = (given) => timingSafeEqual(
    createHash("sha256").update(String(given)).digest(),
    createHash("sha256").update(adminPassword).digest(),
  );

  function release(socket, data, reply) {
    if (!adminPassword) return reply({ ok: false, error: "服务器尚未配置管理员密码" });
    if (blocked(socket.id))
      return reply({ ok: false, error: "管理员密码尝试过于频繁，请十分钟后再试" });
    if (!secretMatches(data?.password)) {
      recordFail(socket.id);
      return reply({ ok: false, error: "管理员密码不正确" });
    }
    const seat = Number(data?.seat);
    if (!Number.isInteger(seat) || seat < 0 || (seat >= seatCount && !validSeat(seat)))
      return reply({ ok: false, error: "无效的工位" });
    const owner = roster[seat];
    if (!owner) return reply({ ok: false, error: "这个工位本来就是空的" });
    // Persist before telling anybody, so a failed write cannot free a desk that
    // comes straight back on the next restart. The user claim path in
    // server.mjs performs the same rollback.
    const previousRoster = { ...roster };
    const online = [...people.values()].filter((person) => person.clientId === owner.id);
    delete roster[seat];
    if (!save()) {
      for (const key of Object.keys(roster)) delete roster[key];
      Object.assign(roster, previousRoster);
      return reply({ ok: false, error: "工位未保存成功，请稍后重试" });
    }
    fails.delete(socket.id);
    // If the owner is online right now, take the desk away from them - and show them
    // out of the space: they must not stay in the member list and chat as if nothing
    // happened (user, 2026-09-15).
    for (const person of online) person.seat = null;
    publish();
    for (const person of online)
      io.to(person.id).emit("kicked", { seat, message: "你被管理员请出了空间，请重新登录" });
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
    /** Called on disconnect so the throttle table follows live sockets. */
    forget(socketId) {
      fails.delete(socketId);
    },
  };
}
