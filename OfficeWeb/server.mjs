import { createCatInteraction } from './cat/interaction.mjs';
import { attachBilliards } from './billiards/server.mjs';
import { createCat } from './cat/simulation.mjs';
import { catGeometry } from './cat/world.mjs';
import { createSitting } from "./sitting.mjs";
import { createBuildHttp } from './build-http.mjs';
import { createAdmin } from "./admin.mjs";
import { createCollabAnnotations } from "./collab-annotations.mjs";
import { createInputPresence } from "./input-presence.mjs";
import { markCallPresence } from "./call-presence.mjs";
import { createPreviewRelay } from "./preview-relay.mjs";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, writeFileSync, renameSync } from "node:fs";
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
import { publishChat } from './chat-access.mjs';
import { createChatFiles } from "./chat-files.mjs";
import { createFileRelay } from "./file-relay.mjs";
import { createAccounts } from "./accounts.mjs";
import { createPresenceStatus } from './presence-status.mjs';
import { createPrivateSessions } from "./privateSessions.mjs";
import { createMeetings } from "./meetings.mjs";
import { removeMeetingMedia } from "./livekit.mjs";

try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
} catch {
  // No .env file: process.env is used as-is.
}

const DIST = fileURLToPath(new URL("./dist/", import.meta.url));

export const SEAT_COUNT = 9;

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const DEFAULT_STATE_PATH = fileURLToPath(new URL("./state.json", import.meta.url));

export const MOTION_BOUNDS = { minX: -Number.MAX_SAFE_INTEGER/4, maxX: Number.MAX_SAFE_INTEGER/4,
  minZ: -Number.MAX_SAFE_INTEGER/4, maxZ: Number.MAX_SAFE_INTEGER/4 };

export const MOTION_INTERVAL_MS = 60;

const {
  sanitizeAppearance,
  sameAppearance,
  DEFAULT_APPEARANCE,
} = await import("./look.mjs");
const SIT_POSES = new Set([
  "standard",
  "relax",
  "forward",
  "recline",
  "crossLegs",
  "wave",
]);

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
        Number.isSafeInteger(seat) &&
        owner &&
        typeof owner.id === "string" &&
        owner.id
      ) {
        seats[seat] = { id: owner.id, name: String(owner.name || "Member") };
      }
    }
    return seats;
  } catch {
    return {};
  }
}

function saveRoster(statePath, roster) {
  try {
    writeFileSync(statePath + ".next", JSON.stringify({ seats: roster }, null, 2) + "\n");
    renameSync(statePath + ".next", statePath);
    return true;
  } catch (error) {
    console.error("OfficeWeb: Could not save workstation", error);
    return false;
  }
}

/**
 * Ends one connection and says why. `session-code` is additive: the older
 * `session-replaced` event keeps its plain-string payload so existing clients
 * (which compare or display it as text) are unaffected.
 */
function replaceSession(socket, code, message) {
  socket.emit("session-code", { code, message });
  socket.emit("session-replaced", message);
  socket.disconnect(true);
}

export function createOfficeServer(options = {}) {
  const adminPassword = options.adminPassword ?? ADMIN_PASSWORD;
  const statePath = options.statePath || DEFAULT_STATE_PATH;
  const presenceStatus = createPresenceStatus(join(dirname(statePath), 'presence-status.json'));
  const buildHttp = createBuildHttp(join(dirname(statePath), 'build-world.json'),
    id => [...people.values()].some(person => person.sittingSpot === id) || (id.startsWith('desk-') && !!roster[Number(id.slice(5))]));
  const chatStore = createChatStore(options.chatPath || join(dirname(statePath), "chat-data"));
  const chatFiles = createChatFiles(join(options.chatPath || join(dirname(statePath), "chat-data"), "files"), chatStore);
  const accounts = options.authentication === false ? null : createAccounts(
    options.accountsPath || fileURLToPath(new URL("./accounts.json", import.meta.url)),
    { secure: options.secureCookies !== false, loginGraceMs: options.loginGraceMs, onLogin: (accountId) => {
      for (const socket of io.sockets.sockets.values()) {
        if (socket.data.account?.id === accountId && !accounts.authenticate(socket.request)) {
          replaceSession(socket, "login-rotated", "Account signed in elsewhere. Please sign in again");
        }
      }
      membership.login(accountId);
    } },
  );
  const http = createServer(async (req, res) => {
    if (accounts && await accounts.handle(req, res)) return;
    if (await presenceStatus(req, res, accounts)) return;
    if (await buildHttp(req, res, accounts)) return;
    if (chatFiles.handle(req, res, accounts)) return;

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
  let catWorldRevision = -1, catSolids = [], catWorldAt = 0;
  let cat = null;
  const catEnabled = options.cat ?? process.env.OFFICE_CAT_ENABLED === 'true';
  function startCat() {
    if (!catEnabled) return;
    try {
      if (cat) { cat.resume(); return; }
      cat = (options.catFactory || createCat)({ path: join(dirname(statePath), 'office-cat.json'),
        physiology: options.catPhysiology ?? process.env.OFFICE_CAT_PHYSIOLOGY === 'true',
        people: () => catInteraction.perception(),
        geometry: () => {
          if (Date.now()-catWorldAt>2000) {
            const world=buildHttp.catWorld(); catWorldAt=Date.now();
            if(world.revision!==catWorldRevision){catSolids=catGeometry(world);catWorldRevision=world.revision;}
          }
          return catSolids;
        }, emit: state => { for(const socket of io.sockets.sockets.values()) if(people.has(socket.id)) socket.emit('office-cat',state); } });
    } catch(error) { console.error('Cat simulation unavailable; office remains online:', error.message); }
  }
  http.on('close',()=>{ try { cat?.stop(); } catch(error) { console.error('Cat checkpoint could not be saved:', error.message); } });
  const catInteraction = createCatInteraction({cat:()=>cat?.snapshot(),touch:()=>cat?.touch(),emit:message=>{for(const peer of io.sockets.sockets.values())if(people.has(peer.id))peer.emit('cat-speech',message);}});
  const membership = createMembership({ io, accounts, path: join(dirname(statePath), "ejected.json") });
  const cleanup = setInterval(() => {
    try { chatStore.prune(); chatFiles.prune(); } catch (error) { console.error("Could not prune expired chat data", error); }
  }, 60000);
  cleanup.unref();
  http.on("close", () => clearInterval(cleanup));
  if (accounts) io.use((socket, next) => {
    const user = accounts.authenticate(socket.request);
    const sameOrigin = accounts.originAllowed(socket.request) ||
      (!socket.request.headers.origin && socket.request.headers["sec-fetch-site"] === "same-origin");
    if (!user || !sameOrigin) return next(Error("Please sign in"));
    socket.data.account = user;
    next();
  });
  const people = new Map(),
    invites = new Map(),
    sessions = new Map();
  const billiards = attachBilliards(io, people, http, options.billiardsWorld || buildHttp.catWorld);

  const roster = loadRoster(statePath);
  const save = () => saveRoster(statePath, roster);
  // the world was replaced by the library hall: claims on the old desks are void (the old seat file is kept)
  if (buildHttp.reset()) {
    if (Object.keys(roster).length && existsSync(statePath)) writeFileSync(statePath + ".before-hall.json", readFileSync(statePath));
    for (const key of Object.keys(roster)) delete roster[key];
    save();
  }

  const seatsView = () =>
    Array.from({ length: buildHttp.seatCount() }, (_, seat) => {
      const owner = roster[seat];
      if (!owner) return null;
      const online = [...people.values()].some((p) => p.clientId === owner.id);
      return { id: owner.id, name: owner.name, online };
    });
  const publish = () => {

    io.emit("people", markCallPresence(inputPresence.view(), sessions));
    io.emit("seats", seatsView());

    for (const person of people.values()) {
      const wanted = [...people.values()].some((other) => other.id !== person.id && other.previewAllowed);
      io.to(person.id).emit("ambient", { wanted });
    }
  };
  const inputPresence = createInputPresence({ io, people, publish });
  const expressionTimer = setInterval(() => inputPresence.refresh(), 1000);
  expressionTimer.unref();
  http.on("close", () => clearInterval(expressionTimer));
  const admin = createAdmin({
    io, people, roster, save, publish, adminPassword, seatCount: SEAT_COUNT, validSeat: buildHttp.hasWorkstation,

    eject: (accountId) => membership.eject(accountId),
  });
  const sitting = createSitting(people, roster, publish, SEAT_COUNT, buildHttp.hasSeat, buildHttp.sofaSeats);
  const meetings = createMeetings(io, people, publish, removeMeetingMedia,
    options.meetingPermissions || updatePrivatePermissions, { ringMs: options.huddleRingMs ?? 30000 });
  const end = (id) => {
    const c = sessions.get(id);
    if (!c) return;
    for (const p of c.peers) io.to(p).emit("session-end", id);
    sessions.delete(id);

    publish();
    if (c.room.startsWith("call-")) void (options.closePrivateMedia || removeMeetingMedia)(c.room).catch(error => {
      if (error?.status !== 404) console.error("Could not clean up private-call media", error);
    });
  };
  const privateCalls = createPrivateSessions(io, people, sessions, invites, end, options.privatePermissions || updatePrivatePermissions,
    { ringMs: options.inviteRingMs ?? 30000, publish });
  const annotations = createCollabAnnotations({ io, people, sessions });

  const previewRelay = createPreviewRelay({ io, people });

  const fileRelay = createFileRelay({ io, people, onDelivered: transfer => {
    const message = chatStore.append(transfer.sender, '', transfer.attachmentId,
      { id: transfer.attachmentId, name: transfer.name, size: transfer.size }, transfer.recipient);
    publishChat(io, people, message);
  } });
  io.on("connection", (s) => {
    if (accounts) s.use((_packet, next) => {
      if (!accounts.authenticate(s.request)) {
        replaceSession(s, "session-expired", "Session expired. Please sign in again");
        return;
      }
      next();
    });

    s.on("livekit-token", async (requested, reply) => {
      if (typeof reply !== "function") return;
      const person = people.get(s.id);
      if (!person) return reply({ error: "先进入大厅" });
      if (!livekit.ready) return reply({ error: "LiveKit is not configured" });
      const room = grantRoom({
        socketId: s.id,
        requested,
        person,
        people,
        sessions,
      });
      if (!room) return reply({ error: "You are not authorized to join this room" });
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
        reply({ error: "Token creation failed: " + (error?.message || error) });
      }
    });
    s.on("join", (data) => {
      if (people.has(s.id)) return;

      const clientId = s.data.account?.id || String(data?.id || s.id).slice(0, 64) || s.id;
      const name =
        s.data.account?.name || String(data?.name || "Member").trim().slice(0, 24) || "Member";
      for (const [id, p] of people) {
        if (p.clientId === clientId) {
          const previous = io.sockets.sockets.get(id);
          if (previous) replaceSession(previous, "signed-in-elsewhere", "Account signed in in another window. Continue there");
        }
      }

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

        appearance: sanitizeAppearance(s.data.account?.appearance ?? data?.appearance),

        previewAllowed: true,
        sharing: false,

        annotate: data?.annotate === true,
        meeting: false,
      };
      people.set(s.id, person);
      billiards.sync(s);
      startCat();
      if(cat) s.emit('office-cat',cat.snapshot());

      if (person.seat === null && role === "visitor") {
        const sofa = sitting.freeSofa(person);
        if (sofa) person.sittingSpot = sofa;
      }
      meetings.sync();
      publish();

      previewRelay.snapshot(s.id);
    });

    s.on("seat", (requested, reply) => {

      if (typeof requested === "function" && reply === undefined)
        return requested({ ok: false, error: "没有这个工位" });
      if (typeof reply !== "function") return;
      const person = people.get(s.id);
      if (!person) return reply({ ok: false, error: "先进入大厅" });

      if (person.role === "visitor")
        return reply({ ok: false, error: "访客坐公共区域，不能认领工位" });

      if (requested === null)
        return reply({
          ok: false,
          error: "工位认领后会一直保留，要释放请找管理员",
        });
      if (!Number.isInteger(requested) || requested < 0 || !buildHttp.hasWorkstation(requested))
        return reply({ ok: false, error: "没有这个工位" });
      const blocked = sitting.blocked(`desk-${requested}`, person);
      if (blocked) return reply({ ok: false, error: blocked });
      const owner = roster[requested];
      if (owner && owner.id !== person.clientId)
        return reply({ ok: false, error: `这已经是${owner.name}的工位了` });
      const previousRoster = { ...roster }, previousSeat = person.seat;

      for (const [seatKey, held] of Object.entries(roster)) {
        if (held.id === person.clientId && Number(seatKey) !== requested)
          delete roster[seatKey];
      }
      roster[requested] = { id: person.clientId, name: person.name };
      person.seat = requested;
      if (!save()) {
        for (const key of Object.keys(roster)) delete roster[key];
        Object.assign(roster, previousRoster); person.seat = previousSeat;
        return reply({ ok: false, error: "工位没存上，再试一次" });
      }
      publish();
      reply({ ok: true, seat: requested });
    });
    s.on("preview-allowed", (allowed) => {
      const p = people.get(s.id);
      if (!p) return;
      p.previewAllowed = allowed === true;

      publish();
    });
    s.on("appearance", (raw) => {
      const p = people.get(s.id);
      if (!p) return;
      const next = sanitizeAppearance(raw);

      // Confirming the default look still completes account onboarding.
      accounts?.setAppearance(p.clientId, next);
      if (sameAppearance(p.appearance, next)) return;
      p.appearance = next;
      publish();
    });

    s.on("rename", (name, reply) => {
      if (accounts) return typeof reply === "function" && reply({ ok: false, error: "Account names are login IDs and cannot be changed here" });
      const p = people.get(s.id);
      if (!p) return;
      const clean = String(name || "").trim().slice(0, 24);
      if (!clean) {
        if (typeof reply === "function")
          reply({ ok: false, error: "Name cannot be empty" });
        return;
      }
      p.name = clean;

      for (const owner of Object.values(roster)) {
        if (owner.id === p.clientId) owner.name = clean;
      }
      save();
      publish();
      if (typeof reply === "function") reply({ ok: true, name: clean });
    });

    s.on('cat-interact',(kind,reply)=>{if(typeof reply==='function' && people.has(s.id))reply(catInteraction.act(s.id,kind));});
    admin.attach(s);

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
        (m.y !== undefined && !Number.isFinite(m.y)) ||
        !Number.isFinite(m.rot)
      )
        return;
      lastMotion = now;
      catInteraction.motion(s.id, {x:m.x,y:m.y??0,z:m.z});
      s.broadcast.emit("motion", {
        id: s.id,
        x: Math.min(MOTION_BOUNDS.maxX, Math.max(MOTION_BOUNDS.minX, m.x)),
        y: m.y ?? 0,
        z: Math.min(MOTION_BOUNDS.maxZ, Math.max(MOTION_BOUNDS.minZ, m.z)),
        rot: m.rot,
        moving: m.moving === true,
        running: m.running === true,
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
        if (!p.previewSharing) previewRelay.stop(s.id);
        privateCalls.screenStopped(s.id);
      }
      publish();
    });
    s.on("ambient-sharing", value => {
      const p = people.get(s.id);
      if (!p) return;

      p.previewSharing = value === true && p.role !== "visitor";
      if (!p.previewSharing) previewRelay.stop(s.id);
    });
    s.on("preview", image => previewRelay.push(s, image));

    s.on("preview-watch", target => previewRelay.watch(s, target));
    sitting.attach(s);
    annotations.attach(s);
    attachChat(io, s, people, chatStore, membership.contacts, membership.hidden);
    s.on('private-screen', async (id, reply) => {
      if (typeof reply !== 'function') return;
      try { reply({ ok: true, session: await privateCalls.claim(s, id) }); }
      catch (error) { reply({ ok: false, error: error.message }); }
    });
    chatFiles.attach(io, s, people, accounts?.listContacts);
    fileRelay.attach(s);
    privateCalls.attach(s);
    meetings.attach(s);
    billiards.attach(s);
    s.on("disconnect", () => {
      const departed = people.delete(s.id);
      if (departed && !people.size && cat) {
        try { cat.pause(); } catch(error) { console.error('Cat checkpoint could not be saved:', error.message); }
      }
      billiards.forget(s.id);
      catInteraction.forget(s.id);
      admin.forget(s.id);
      annotations.forget(s.id);

      previewRelay.forget(s.id);
      previewRelay.forgetWatch(s.id);
      for (const [id, c] of sessions) if (c.peers.includes(s.id)) end(id);
      for (const [id, i] of invites)
        if (i.from === s.id || i.target === s.id) {
          invites.delete(id);
          io.to(i.target).emit("request-expired", { id, reason: "cancelled" });
          io.to(i.from).emit('request-expired', { id, reason: 'cancelled' });
        }
      publish();
    });
  });
  return { http, io, stopCat: () => cat?.stop() };
}

