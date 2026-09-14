// Server-side LiveKit integration: environment config, room naming and token minting.
//
// LiveKit terminates all media signalling (SDP/ICE negotiation, TURN relay and
// stream routing), so this project no longer needs custom WebRTC signalling.
// socket.io stays the business channel: presence, seats, chat and consent.
// Every room token is minted only after the requesting socket is authorised for
// that room, so "consent first" is enforced by the server rather than the client.
import { AccessToken, RoomServiceClient, TrackSource } from "livekit-server-sdk";
import { fileURLToPath } from "node:url";

// Load the sibling .env when present; otherwise use the ambient environment.
try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
} catch {
  // No .env file: process.env is used as-is.
}

const config = {
  url: process.env.LIVEKIT_URL || "",
  apiKey: process.env.LIVEKIT_API_KEY || "",
  apiSecret: process.env.LIVEKIT_API_SECRET || "",
};

export const livekit = {
  ...config,
  get ready() {
    return Boolean(config.url && config.apiKey && config.apiSecret);
  },
};

/** One room per sharer, holding the owner plus every viewer it approved. */
export const screenRoom = (ownerId) => `screen-${ownerId}`;
/** One room per approved 1:1 voice session. */
export const voiceRoom = (sessionId) => `voice-${sessionId}`;
/** Single shared room for everyone who joined the meeting. */
export const MEETING_ROOM = "meeting";

export async function removeMeetingMedia(room, identity) {
  if (!livekit.ready) return;
  const client = new RoomServiceClient(config.url.replace(/^ws/, 'http'), config.apiKey, config.apiSecret);
  if (identity) await client.removeParticipant(room, identity);
  else await client.deleteRoom(room);
}

/**
 * Mint a join token for one room. Identity is the socket id, which lets the
 * server map a LiveKit participant back to its consented session.
 */
export async function mintToken({ identity, name, room, sources }) {
  if (!livekit.ready) throw new Error("服务器未配置 LiveKit");
  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    name,
    ttl: room.startsWith('meeting-') || room.startsWith('call-') ? '60s' : '3h',
  });
  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    ...(sources ? { canPublishSources: sources } : {}),
    canSubscribe: true,
    canPublishData: true,
  });
  return token.toJwt();
}

/**
 * Decide whether a socket may join the room it asked for. Returns the granted
 * room name, or null when the request is not authorised.
 */
export function grantRoom({ socketId, requested, person, people, sessions }) {
  if (typeof requested !== "string") return null;

  if (requested.startsWith('meeting-')) return person?.meetingRoom === requested ? requested : null;
  if (requested === MEETING_ROOM) return null;

  if (requested.startsWith("call-")) {
    const session = sessions.get(requested.slice(5));
    return session?.room === requested && session.peers.includes(socketId) ? requested : null;
  }

  if (requested.startsWith("screen-")) {
    const owner = requested.slice("screen-".length);
    if (owner === socketId) return requested;
    if (!people.has(owner)) return null;
    for (const session of sessions.values()) {
      if (
        session.kind === "screen" &&
        session.owner === owner &&
        session.peers.includes(socketId)
      ) {
        return requested;
      }
    }
    return null;
  }

  if (requested.startsWith("voice-")) {
    const session = sessions.get(requested.slice("voice-".length));
    if (session && session.kind === "voice" && session.peers.includes(socketId)) {
      return requested;
    }
    return null;
  }

  return null;
}

/** Per-participant screen consent remains enforced by LiveKit publication grants. */
export function privateSources(room, identity, sessions) {
  if (!room.startsWith('call-')) return undefined;
  const session = sessions.get(room.slice(5));
  return [TrackSource.MICROPHONE,
    ...(session?.screenOwners?.includes(identity) ? [TrackSource.SCREEN_SHARE] : [])];
}

export const screenSources = (identity, owners = []) => [TrackSource.MICROPHONE,
  ...(owners.includes(identity) ? [TrackSource.SCREEN_SHARE] : [])];

export async function updatePrivatePermissions(session) {
  if (!livekit.ready) return;
  const client = new RoomServiceClient(config.url.replace(/^ws/, 'http'), config.apiKey, config.apiSecret);
  const peers = [...session.peers].sort((a, b) =>
    Number(session.screenOwners.includes(a)) - Number(session.screenOwners.includes(b)));
  for (const identity of peers) {
    try {
      await client.updateParticipant(session.room, identity, { permission: {
        canSubscribe: true, canPublish: true, canPublishData: false,
        canPublishSources: screenSources(identity, session.screenOwners),
      } });
    } catch (error) {
      // A peer not connected yet gets its up-to-date grants through token minting.
      if (error?.code !== 'not_found' && error?.status !== 404) throw error;
    }
  }
}
