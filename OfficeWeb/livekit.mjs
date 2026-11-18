

import { AccessToken, RoomServiceClient, TrackSource } from "livekit-server-sdk";
import { fileURLToPath } from "node:url";

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

export const screenRoom = (ownerId) => `screen-${ownerId}`;

export const voiceRoom = (sessionId) => `voice-${sessionId}`;

export const MEETING_ROOM = "meeting";

export async function removeMeetingMedia(room, identity) {
  if (!livekit.ready) return;
  const client = new RoomServiceClient(config.url.replace(/^ws/, 'http'), config.apiKey, config.apiSecret);
  if (identity) await client.removeParticipant(room, identity);
  else await client.deleteRoom(room);
}

export async function mintToken({ identity, name, room, sources }) {
  if (!livekit.ready) throw new Error("LiveKit is not configured");
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

export function privateSources(room, identity, sessions) {
  if (!room.startsWith('call-')) return undefined;
  const session = sessions.get(room.slice(5));
  return [TrackSource.MICROPHONE,
    ...(session?.screenOwners?.includes(identity) ? [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO] : [])];
}

export const screenSources = (identity, owners = []) => [TrackSource.MICROPHONE,
  ...(owners.includes(identity) ? [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO] : [])];

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

      if (error?.code !== 'not_found' && error?.status !== 404) throw error;
    }
  }
}
