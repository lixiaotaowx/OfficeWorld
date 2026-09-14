import type { CharacterId } from "./characters";
import type { SitPoseId } from "./sitPoses";

export interface Person {
  sittingSpot?: string | null;
  id: string;
  clientId: string;
  name: string;
  /** Chosen workstation, or null while the player has not picked one yet. */
  seat: number | null;
  /** Which bundled avatar this player wears, so colleagues render it. */
  character: CharacterId;
  /** Whether this person's tiny thumbnail may show on their monitor. */
  previewAllowed: boolean;
  sharing: boolean;
  meeting: boolean;
}

/** Who holds one workstation, including owners who are currently offline. */
export interface SeatOwner {
  /** Stable identity of the owner. Free seats are null, never a SeatOwner. */
  id: string;
  name: string;
  /** Whether the owner is connected right now. */
  online: boolean;
}

/** One throttled motion snapshot relayed from another player. */
export interface Motion {
  sittingSpot?: string | null;
  x: number;
  z: number;
  rot: number;
  moving: boolean;
  sitting: boolean;
  /** Seated pose, so colleagues see the same sitting action. */
  pose?: SitPoseId;
}

export interface Request {
  offer?: boolean;
  id: string;
  from: string;
  target: string;
  kind: "screen" | "voice";
  name: string;
}

export interface Session {
  id: string;
  peer: string;
  kind: "screen" | "voice" | "meeting";
  owner: string;
  /** Participants whose screen publication was explicitly accepted. */
  screenOwners?: string[];
  /** LiveKit room for this session; the server mints the token for it. */
  room: string;
  initiator: boolean;
}

export interface Message {
  recipientId?: string;
  recipientName?: string;
  senderId?: string;
  id: string;
  name: string;
  text: string;
  time: number;
  attachment?: ChatAttachment;
}
export interface ChatContact { id: string; name: string }

export interface ChatAttachment { id: string; name: string; size: number }
