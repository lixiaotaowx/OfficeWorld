import { createSitting } from "./sitting.mjs";
import { createAdmin } from "./admin.mjs";
import { createCollabAnnotations } from "./collab-annotations.mjs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import {
  grantRoom,
  livekit,
  mintToken,
  updatePrivatePermissions,
  privateSources,
  screenSources,
} from "./livekit.mjs";
import { serveStatic } from "./static.mjs";
import { dirname, join } from "node:path";
import { createChatStore } from "./chat-store.mjs";
import { createMembership } from "./membership.mjs";
import { attachChat } from "./chat-server.mjs";
import { createChatFiles } from "./chat-files.mjs";
import { createAccounts } from "./accounts.mjs";
import { createPrivateSessions } from "./privateSessions.mjs";
import { createMeetings } from "./meetings.mjs";
import { removeMeetingMedia } from "./livekit.mjs";

// Load the sibling .env when present (LiveKit keys and the admin password).
try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
} catch {
  // No .env file: process.env is used as-is.
}

/** Built frontend, served by this same process when it exists. */
const DIST = fileURLToPath(new URL("./dist/", import.meta.url));

/** Must match the number of workstations in src/seats.ts; a test asserts this. */
export const SEAT_COUNT = 9;

/** The manager's chair in src/seats.ts ("老板工位", id "Manager"). */
export const BOSS_SEAT = 8;

/** Names containing this are seated in the manager's chair automatically. */
export const BOSS_NAME = /文杰/;

/**
 * Administrator password for the kick feature. Override with ADMIN_PASSWORD in
 * .env or the environment; administration stays disabled without a password.
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

/** Permanent seat roster on disk, so claimed desks survive restarts. */
const DEFAULT_STATE_PATH = fileURLToPath(new URL("./state.json", import.meta.url));

/** Players cannot be relayed outside the building, whatever a client claims. */
export const MOTION_BOUNDS = { minX: -11, maxX: 12, minZ: -9, maxZ: 7 };
/** Ceiling on motion relays per client, in milliseconds between updates. */
export const MOTION_INTERVAL_MS = 60;

/** Valid bundled character ids, kept in sync with src/characters.ts. */
const CHARACTER_IDS = new Set([
  "man_adventurer",
  "man_beach",
  "man_casual_2",
  "man_casual_hoodie",
  "man_farmer",
  "man_king",
  "man_punk",
  "man_spacesuit",
  "man_suit",
  "man_swat",
  "man_worker",
  "woman_adventurer",
  "woman_casual",
  "woman_formal",
  "woman_medieval",
  "woman_punk",
  "woman_scifi",
  "woman_soldier",
  "woman_suit",
  "woman_witch",
  "woman_worker",
]);
const DEFAULT_CHARACTER = "woman_casual";
const SIT_POSES = new Set([
  "standard",
  "relax",
  "forward",
  "recline",
  "crossLegs",
  "wave",
]);
const sanitizeCharacter = (id) =>
  CHARACTER_IDS.has(id) ? id : DEFAULT_CHARACTER;

/** Read the permanent roster from disk, tolerating a missing or corrupt file. */
function loadRoster(statePath) {
  try {
    const data = JSON.parse(readFileSync(statePath, "utf8"));
    if (!data || typeof data.seats !== "object" || data.seats === null)
      return {};
    const seats = {};
    for (const [key, owner] of Object.entries(data.seats)) {
      const seat = Number(key);
      if (
        Number.isInteger(seat) &&
        seat >= 0 &&
        seat < SEAT_COUNT &&
        owner &&
        typeof owner.id === "string" &&
        owner.id
      ) {
        seats[seat] = { id: owner.id, name: String(owner.name || "同事") };
      }
    }
    return seats;
  } catch {
    return {};
  }
}

/** Persist the roster; a failed write only logs so it never breaks the room. */
function saveRoster(statePath, roster) {
  try {
    writeFileSync(statePath + ".next", JSON.stringify({ seats: roster }, null, 2) + "\n");
    renameSync(statePath + ".next", statePath);
    return true;
  } catch (error) {
    console.error("OfficeWeb: 保存工位失败", error);
    return false;
  }
}

export function createOfficeServer(options = {}) {
  const adminPassword = options.adminPassword ?? ADMIN_PASSWORD;
  const statePath = options.statePath || DEFAULT_STATE_PATH;
  const chatStore = createChatStore(options.chatPath || join(dirname(statePath), "chat-data"));
  const chatFiles = createChatFiles(join(options.chatPath || join(dirname(statePath), "chat-data"), "files"), chatStore);
  const accounts = options.authentication === false ? null : createAccounts(
    options.accountsPath || fileURLToPath(new URL("./accounts.json", import.meta.url)),
    { secure: options.secureCookies !== false, onLogin: (accountId) => {
      for (const socket of io.sockets.sockets.values()) {
        if (socket.data.account?.id === accountId && !accounts.authenticate(socket.request)) {
          socket.emit("session-replaced", "账号已在其他地方登录，请重新登录");
          socket.disconnect(true);
        }
      }
      membership.login(accountId);
    } },
  );
  const http = createServer(async (req, res) => {
    if (accounts && await accounts.handle(req, res)) return;
    if (chatFiles.handle(req, res, accounts)) return;
    // The app is served from here in production; in development Vite serves it
    // and this falls through to the status document below.
    if (await serveStatic(DIST, req, res)) return;
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
  const membership = createMembership({ io, accounts });
  const cleanup = setInterval(() => {
    try { chatStore.prune(); chatFiles.prune(); } catch (error) { console.error("聊天过期清理失败", error); }
  }, 60000);
  cleanup.unref();
  http.on("close", () => clearInterval(cleanup));
  if (accounts) io.use((socket, next) => {
    const user = accounts.authenticate(socket.request);
    const sameOrigin = accounts.originAllowed(socket.request) ||
      (!socket.request.headers.origin && socket.request.headers["sec-fetch-site"] === "same-origin");
    if (!user || !sameOrigin) return next(Error("请先登录"));
    socket.data.account = user;
    next();
  });
  const people = new Map(),
    invites = new Map(),
    sessions = new Map();
  /** Permanent seat ownership: seat index -> { id, name }. */
  const roster = loadRoster(statePath);
  const save = () => saveRoster(statePath, roster);
  /** Seat view for clients: who holds each desk and whether they are online. */
  const seatsView = () =>
    Array.from({ length: SEAT_COUNT }, (_, seat) => {
      const owner = roster[seat];
      if (!owner) return null;
      const online = [...people.values()].some((p) => p.clientId === owner.id);
      return { id: owner.id, name: owner.name, online };
    });
  const publish = () => {
    io.emit("people", [...people.values()]);
    io.emit("seats", seatsView());
    // Tell each client whether anybody else could receive its workstation preview,
    // so a machine nobody is watching does not keep capturing the screen at all.
    // Sent per socket because "somebody else" differs per recipient.
    for (const person of people.values()) {
      const wanted = [...people.values()].some((other) => other.id !== person.id && other.previewAllowed);
      io.to(person.id).emit("ambient", { wanted });
    }
  };
  const admin = createAdmin({
    io, people, roster, save, publish, adminPassword, seatCount: SEAT_COUNT,
    // Somebody shown out leaves the member and chat lists and loses their session.
    eject: (accountId) => membership.eject(accountId),
  });
  const sitting = createSitting(people, roster, publish, SEAT_COUNT);
  const meetings = createMeetings(io, people, publish, removeMeetingMedia,
    options.meetingPermissions || updatePrivatePermissions);
  const end = (id) => {
    const c = sessions.get(id);
    if (!c) return;
    for (const p of c.peers) io.to(p).emit("session-end", id);
    sessions.delete(id);
    if (c.room.startsWith("call-")) void (options.closePrivateMedia || removeMeetingMedia)(c.room).catch(error => {
      if (error?.status !== 404) console.error("私聊媒体清理失败", error);
    });
  };
  const privateCalls = createPrivateSessions(io, people, sessions, invites, end, options.privatePermissions || updatePrivatePermissions);
  const annotations = createCollabAnnotations({ io, people, sessions });
  io.on("connection", (s) => {
    if (accounts) s.use((_packet, next) => {
      if (!accounts.authenticate(s.request)) {
        s.emit("session-replaced", "登录已失效，请重新登录");
        s.disconnect(true); return;
      }
      next();
    });
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
          sources: privateSources(room, s.id, sessions) ??
            (room.startsWith('meeting-') ? screenSources(s.id, [meetings.screenOwner(room)]) : undefined),
        });
        reply({ url: livekit.url, token, room });
      } catch (error) {
        reply({ error: "签发失败：" + (error?.message || error) });
      }
    });
    s.on("join", (data) => {
      if (people.has(s.id)) return;
      // The client sends a stable id so the name and seat persist across visits.
      const clientId = s.data.account?.id || String(data?.id || s.id).slice(0, 64) || s.id;
      const name =
        s.data.account?.name || String(data?.name || "同事").trim().slice(0, 24) || "同事";
      for (const [id, p] of people) {
        if (p.clientId === clientId) {
          const previous = io.sockets.sockets.get(id);
          previous?.emit("session-replaced", "账号已在其他窗口登录，请在新窗口继续使用");
          previous?.disconnect(true);
        }
      }
      // Restore the permanent desk this identity already owns, if any.
      let seat = null;
      for (const [seatKey, owner] of Object.entries(roster)) {
        if (owner.id === clientId) seat = Number(seatKey);
      }
      const role = s.data.account?.role === "visitor" || data?.role === "visitor" ? "visitor"
        : s.data.account?.role === "employee" || data?.role === "employee" ? "employee" : "";
      const person = {
        id: s.id,
        clientId,
        name,
        seat,
        role,
        // Which bundled avatar this player wears, so colleagues render it.
        character: sanitizeCharacter(s.data.account?.character || data?.character),
        // The tiny ambient thumbnail may be shown on the workstation screen.
        // It is deliberately unreadable, and the sharer can turn it off.
        previewAllowed: true,
        sharing: false,
        meeting: false,
      };
      people.set(s.id, person);
      // The boss sits in the manager's chair without having to claim it. The name is
      // the office's own rule, so it is applied server-side and persisted like any
      // other claim.
      if (BOSS_NAME.test(name) && (!roster[BOSS_SEAT] || roster[BOSS_SEAT].id === clientId)) {
        for (const [seatKey, held] of Object.entries(roster)) {
          if (held.id === clientId && Number(seatKey) !== BOSS_SEAT) delete roster[seatKey];
        }
        roster[BOSS_SEAT] = { id: clientId, name };
        person.seat = BOSS_SEAT;
        save();
      }
      // A visiting client is seated in the public area straight away; they keep every
      // other feature but do not broadcast a screen preview of their own.
      if (person.seat === null && role === "visitor") {
        const sofa = sitting.freeSofa(person);
        if (sofa) person.sittingSpot = sofa;
      }
      meetings.sync();
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
      // A visiting client uses the public area; employee desks stay with employees.
      if (person.role === "visitor")
        return reply({ ok: false, error: "访客在公共区就坐，不占用同事的工位" });
      // Seats are permanent: nobody gives one up on their own; only the
      // administrator frees a desk (see the "admin" handler below).
      if (requested === null)
        return reply({
          ok: false,
          error: "工位一旦占用就是永久的，如需释放请联系管理员",
        });
      if (!Number.isInteger(requested) || requested < 0 || requested >= SEAT_COUNT)
        return reply({ ok: false, error: "无效的工位" });
      const blocked = sitting.blocked(`desk-${requested}`, person);
      if (blocked) return reply({ ok: false, error: blocked });
      const owner = roster[requested];
      if (owner && owner.id !== person.clientId)
        return reply({ ok: false, error: `${owner.name} 已在这个工位` });
      const previousRoster = { ...roster }, previousSeat = person.seat;
      // One desk per person: moving releases the previous desk. Reclaiming the
      // same desk is a harmless no-op that also refreshes the stored name.
      for (const [seatKey, held] of Object.entries(roster)) {
        if (held.id === person.clientId && Number(seatKey) !== requested)
          delete roster[seatKey];
      }
      roster[requested] = { id: person.clientId, name: person.name };
      person.seat = requested;
      if (!save()) {
        for (const key of Object.keys(roster)) delete roster[key];
        Object.assign(roster, previousRoster); person.seat = previousSeat;
        return reply({ ok: false, error: "工位未保存成功，请稍后重试" });
      }
      publish();
      reply({ ok: true, seat: requested });
    });
    function sendPreview(image) {
      for (const person of people.values()) {
        if (person.id === s.id || person.previewAllowed)
          io.to(person.id).emit("preview", { id: s.id, image });
      }
    }
    s.on("preview-allowed", (allowed) => {
      const p = people.get(s.id);
      if (!p) return;
      p.previewAllowed = allowed === true;
      // This preference controls receiving other workstations, never publishing.
      publish();
    });
    s.on("character", (id) => {
      const p = people.get(s.id);
      if (!p) return;
      p.character = sanitizeCharacter(id);
      accounts?.setCharacter(p.clientId, p.character);
      publish();
    });
    // Permanent naming: a player can (re)name themselves at any time.
    s.on("rename", (name, reply) => {
      if (accounts) return typeof reply === "function" && reply({ ok: false, error: "账号姓名作为登录名，不支持在空间内修改" });
      const p = people.get(s.id);
      if (!p) return;
      const clean = String(name || "").trim().slice(0, 24);
      if (!clean) {
        if (typeof reply === "function")
          reply({ ok: false, error: "名字不能为空" });
        return;
      }
      p.name = clean;
      // Keep the permanent roster's display name in sync with this identity.
      for (const owner of Object.values(roster)) {
        if (owner.id === p.clientId) owner.name = clean;
      }
      save();
      publish();
      if (typeof reply === "function") reply({ ok: true, name: clean });
    });
    // Administrator: free a permanently held desk (see admin.mjs).
    admin.attach(s);
    // Motion relay. Throttled so one client cannot flood the room, and clamped
    // so a bogus position cannot place an avatar outside the building.
    let lastMotion = 0;
    s.on("motion", (m) => {
      const p = people.get(s.id);
      if (!p) return;
      const now = Date.now();
      if (now - lastMotion < MOTION_INTERVAL_MS) return;
      if (
        !m ||
        !Number.isFinite(m.x) ||
        !Number.isFinite(m.z) ||
        !Number.isFinite(m.rot)
      )
        return;
      lastMotion = now;
      s.broadcast.emit("motion", {
        id: s.id,
        x: Math.min(MOTION_BOUNDS.maxX, Math.max(MOTION_BOUNDS.minX, m.x)),
        z: Math.min(MOTION_BOUNDS.maxZ, Math.max(MOTION_BOUNDS.minZ, m.z)),
        rot: m.rot,
        moving: m.moving === true,
        sitting: m.sitting === true && !!p.sittingSpot && m.sittingSpot === p.sittingSpot,
        sittingSpot: p.sittingSpot ?? null,
        pose: SIT_POSES.has(m.pose) ? m.pose : "standard",
      });
    });
    s.on("sharing", (v) => {
      const p = people.get(s.id);
      if (!p) return;
      p.sharing = v === true;
      if (!p.sharing) {
        if (!p.previewSharing) sendPreview(null);
        privateCalls.screenStopped(s.id);
      }
      publish();
    });
    s.on("ambient-sharing", value => {
      const p = people.get(s.id);
      if (!p) return;
      // A visiting client never broadcasts a low-resolution screen preview. The
      // client does not even capture one; this is the server-side backstop.
      p.previewSharing = value === true && p.seat != null && p.role !== "visitor";
      if (!p.previewSharing) sendPreview(null);
    });
    let lastFrame = 0;
    s.on("preview", (image) => {
      const p = people.get(s.id);
      // Visitors never broadcast the low-resolution preview, even while sharing in
      // high definition: that is the one part of the office they opt out of.
      if (p?.role === "visitor") return;
      if (
        !(p?.sharing || p?.previewSharing) ||
        typeof image !== "string" ||
        image.length > 250000 ||
        !image.startsWith("data:image/jpeg;base64,") ||
        Date.now() - lastFrame < 400
      )
        return;
      lastFrame = Date.now();
      // Everyone, including the sharer: their own workstation monitor should
      // show their own screen, exactly like standing at a real desk.
      sendPreview(image);
    });
    sitting.attach(s);
    annotations.attach(s);
    attachChat(io, s, people, chatStore, membership.contacts, membership.hidden);
    s.on('private-screen', async (id, reply) => {
      if (typeof reply !== 'function') return;
      try { reply({ ok: true, session: await privateCalls.claim(s, id) }); }
      catch (error) { reply({ ok: false, error: error.message }); }
    });
    chatFiles.attach(io, s, people, accounts?.listContacts);
    privateCalls.attach(s);
    meetings.attach(s);
    s.on("disconnect", () => {
      people.delete(s.id);
      admin.forget(s.id);
      annotations.forget(s.id);
      for (const [id, c] of sessions) if (c.peers.includes(s.id)) end(id);
      for (const [id, i] of invites)
        if (i.from === s.id || i.target === s.id) {
          invites.delete(id);
          io.to(i.target).emit("request-expired", id);
          io.to(i.from).emit('request-expired', id);
        }
      publish();
    });
  });
  return { http, io };
}
