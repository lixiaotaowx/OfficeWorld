import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import {
  grantRoom,
  livekit,
  mintToken,
  screenRoom,
  voiceRoom,
} from "./livekit.mjs";

/** Must match the number of workstations in src/seats.ts; a test asserts this. */
export const SEAT_COUNT = 8;

export function createOfficeServer() {
  const http = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        service: "OfficeWeb",
        mode: "local prototype",
        livekit: livekit.ready ? "configured" : "not configured",
      }),
    );
  });
  const io = new Server(http, { maxHttpBufferSize: 300000 });
  const people = new Map(),
    invites = new Map(),
    sessions = new Map();
  const publish = () => io.emit("people", [...people.values()]);
  const end = (id) => {
    const c = sessions.get(id);
    if (!c) return;
    for (const p of c.peers) io.to(p).emit("session-end", id);
    sessions.delete(id);
  };
  io.on("connection", (s) => {
    // Media access: a token is minted only when this socket is already
    // authorised for the requested room, so consent is enforced server-side.
    s.on("livekit-token", async (requested, reply) => {
      if (typeof reply !== "function") return;
      const person = people.get(s.id);
      if (!person) return reply({ error: "请先进入空间" });
      if (!livekit.ready) return reply({ error: "服务器未配置 LiveKit" });
      const room = grantRoom({
        socketId: s.id,
        requested,
        person,
        people,
        sessions,
      });
      if (!room) return reply({ error: "未获授权，无法加入该房间" });
      try {
        const token = await mintToken({
          identity: s.id,
          name: person.name,
          room,
        });
        reply({ url: livekit.url, token, room });
      } catch (error) {
        reply({ error: "签发失败：" + (error?.message || error) });
      }
    });
    s.on("join", (data) => {
      if (people.has(s.id)) return;
      people.set(s.id, {
        id: s.id,
        name:
          String(data?.name || "同事")
            .trim()
            .slice(0, 24) || "同事",
        // Seats are chosen by the player, never auto-assigned.
        seat: null,
        // The tiny ambient thumbnail may be shown on the workstation screen.
        // It is deliberately unreadable, and the sharer can turn it off.
        previewAllowed: true,
        sharing: false,
        meeting: false,
      });
      publish();
    });
    // Seat arbitration. Two players clicking the same workstation must not both
    // win, and this handler runs synchronously on the event loop, so the
    // find-then-assign below cannot interleave with another claim.
    s.on("seat", (requested, reply) => {
      // A call with no seat at all arrives with the ack in `requested`
      // (socket.io drops undefined arguments). Treat it as malformed.
      if (typeof requested === "function" && reply === undefined)
        return requested({ ok: false, error: "无效的工位" });
      if (typeof reply !== "function") return;
      const person = people.get(s.id);
      if (!person) return reply({ ok: false, error: "请先进入空间" });
      if (requested === null) {
        person.seat = null;
        publish();
        return reply({ ok: true, seat: null });
      }
      if (!Number.isInteger(requested) || requested < 0 || requested >= SEAT_COUNT)
        return reply({ ok: false, error: "无效的工位" });
      const holder = [...people.values()].find(
        (x) => x.seat === requested && x.id !== s.id,
      );
      if (holder) return reply({ ok: false, error: `${holder.name} 已在这个工位` });
      person.seat = requested;
      publish();
      reply({ ok: true, seat: requested });
    });
    s.on("preview-allowed", (allowed) => {
      const p = people.get(s.id);
      if (!p) return;
      p.previewAllowed = allowed === true;
      // Clear the thumbnail already pushed to everyone if the sharer opts out.
      if (!p.previewAllowed) io.emit("preview", { id: s.id, image: null });
      publish();
    });
    s.on("sharing", (v) => {
      const p = people.get(s.id);
      if (!p) return;
      p.sharing = v === true;
      if (!p.sharing) {
        io.emit("preview", { id: s.id, image: null });
        for (const [id, c] of sessions)
          if (c.kind === "screen" && c.owner === s.id) end(id);
      }
      publish();
    });
    let lastFrame = 0;
    s.on("preview", (image) => {
      const p = people.get(s.id);
      if (
        !p?.sharing ||
        // The sharer can opt out of the ambient workstation thumbnail.
        !p.previewAllowed ||
        typeof image !== "string" ||
        image.length > 250000 ||
        !image.startsWith("data:image/jpeg;base64,") ||
        Date.now() - lastFrame < 400
      )
        return;
      lastFrame = Date.now();
      // Everyone, including the sharer: their own workstation monitor should
      // show their own screen, exactly like standing at a real desk.
      io.emit("preview", { id: s.id, image });
    });
    s.on("chat", (text) => {
      const p = people.get(s.id);
      if (!p || typeof text !== "string" || !text.trim()) return;
      io.emit("chat", {
        id: randomUUID(),
        name: p.name,
        text: text.trim().slice(0, 1000),
        time: Date.now(),
      });
    });
    s.on("request", (d) => {
      if (
        !people.has(s.id) ||
        !people.has(d?.target) ||
        d.target === s.id ||
        !["screen", "voice"].includes(d.kind)
      )
        return;
      if (d.kind === "screen" && !people.get(d.target).sharing)
        return s.emit("notice", "对方尚未开启共享");
      if (
        [...invites.values()].some(
          (i) => i.from === s.id && i.target === d.target && i.kind === d.kind,
        )
      )
        return;
      const id = randomUUID();
      const invite = {
        id,
        from: s.id,
        target: d.target,
        kind: d.kind,
        name: people.get(s.id).name,
      };
      invites.set(id, invite);
      io.to(d.target).emit("request", invite);
      s.emit("notice", "请求已发送，等待对方同意");
      setTimeout(() => {
        if (invites.delete(id)) {
          io.to(d.target).emit("request-expired", id);
          io.to(s.id).emit("notice", "请求已过期");
        }
      }, 45000).unref();
    });
    s.on("respond", (d) => {
      const i = invites.get(d?.id);
      if (!i || i.target !== s.id) return;
      invites.delete(i.id);
      if (!d.accept) {
        io.to(i.from).emit("notice", "对方婉拒了请求");
        return;
      }
      if (!people.has(i.from)) return;
      const c = {
        id: i.id,
        peers: [i.target, i.from],
        kind: i.kind,
        owner: i.target,
        // Screen viewers share one room per sharer; voice is 1:1 per session.
        room: i.kind === "screen" ? screenRoom(i.target) : voiceRoom(i.id),
      };
      sessions.set(c.id, c);
      io.to(i.target).emit("session", { ...c, peer: i.from, initiator: true });
      io.to(i.from).emit("session", { ...c, peer: i.target, initiator: false });
    });
    s.on("end", (id) => {
      if (sessions.get(id)?.peers.includes(s.id)) end(id);
    });
    // Meeting audio uses one shared LiveKit room; the flag alone drives it.
    s.on("meeting", (join) => {
      const p = people.get(s.id);
      if (!p) return;
      p.meeting = join === true;
      publish();
    });
    s.on("disconnect", () => {
      people.delete(s.id);
      for (const [id, c] of sessions) if (c.peers.includes(s.id)) end(id);
      for (const [id, i] of invites)
        if (i.from === s.id || i.target === s.id) {
          invites.delete(id);
          io.to(i.target).emit("request-expired", id);
        }
      publish();
    });
  });
  return { http, io };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { http } = createOfficeServer();
  http.listen(3108, "127.0.0.1", () =>
    console.log(
      `OfficeWeb signaling ready on 3108 (livekit: ${livekit.ready ? livekit.url : "not configured"})`,
    ),
  );
}
