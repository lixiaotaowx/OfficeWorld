import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";

export function createOfficeServer() {
  const http = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ service: "OfficeWeb", mode: "local prototype" }));
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
    s.on("join", (data) => {
      if (people.has(s.id)) return;
      const used = new Set([...people.values()].map((x) => x.seat));
      let seat = 0;
      while (used.has(seat)) seat++;
      people.set(s.id, {
        id: s.id,
        name:
          String(data?.name || "同事")
            .trim()
            .slice(0, 24) || "同事",
        seat,
        sharing: false,
        meeting: false,
      });
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
        typeof image !== "string" ||
        image.length > 250000 ||
        !image.startsWith("data:image/jpeg;base64,") ||
        Date.now() - lastFrame < 400
      )
        return;
      lastFrame = Date.now();
      s.broadcast.emit("preview", { id: s.id, image });
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
      };
      sessions.set(c.id, c);
      io.to(i.target).emit("session", { ...c, peer: i.from, initiator: true });
      io.to(i.from).emit("session", { ...c, peer: i.target, initiator: false });
    });
    s.on("signal", (d) => {
      const c = sessions.get(d?.id);
      if (!c || !c.peers.includes(s.id)) return;
      io.to(c.peers.find((x) => x !== s.id)).emit("signal", {
        id: c.id,
        data: d.data,
      });
    });
    s.on("end", (id) => {
      if (sessions.get(id)?.peers.includes(s.id)) end(id);
    });
    s.on("meeting", (join) => {
      const p = people.get(s.id);
      if (!p) return;
      if (join === true && !p.meeting) {
        p.meeting = true;
        for (const peer of people.values()) {
          if (peer.id === s.id || !peer.meeting) continue;
          const c = {
            id: randomUUID(),
            peers: [s.id, peer.id],
            kind: "meeting",
            owner: s.id,
          };
          sessions.set(c.id, c);
          io.to(s.id).emit("session", { ...c, peer: peer.id, initiator: true });
          io.to(peer.id).emit("session", {
            ...c,
            peer: s.id,
            initiator: false,
          });
        }
      } else if (join !== true) {
        p.meeting = false;
        for (const [id, c] of sessions)
          if (c.kind === "meeting" && c.peers.includes(s.id)) end(id);
      }
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
    console.log("OfficeWeb local signaling ready on 3108"),
  );
}
