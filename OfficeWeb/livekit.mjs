// Server-side LiveKit integration: environment config, room naming and token minting.
//
// LiveKit terminates all media signalling (SDP/ICE negotiation, TURN relay and
// stream routing), so this project no longer needs custom WebRTC signalling.
// socket.io stays the business channel: presence, seats, chat and consent.
// Every room token is minted only after the requesting socket is authorised for
// that room, so "consent first" is enforced by the server rather than the client.
import { AccessToken } from "livekit-server-sdk";
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

/**
 * Mint a join token for one room. Identity is the socket id, which lets the
 * server map a LiveKit participant back to its consented session.
 */
export async function mintToken({ identity, name, room }) {
  if (!livekit.ready) throw new Error("服务器未配置 LiveKit");
  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    name,
    ttl: "3h",
  });
  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
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

  if (requested === MEETING_ROOM) return person?.meeting ? requested : null;

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
