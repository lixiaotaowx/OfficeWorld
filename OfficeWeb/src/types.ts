import type { CharacterKind } from "./characterModel";

export interface Person {
  id: string;
  name: string;
  /** Chosen workstation, or null while the player has not picked one yet. */
  seat: number | null;
  /** Which bundled avatar this player wears, so colleagues render it. */
  character: CharacterKind;
  /** Whether this person's tiny thumbnail may show on their monitor. */
  previewAllowed: boolean;
  sharing: boolean;
  meeting: boolean;
}

/** One throttled motion snapshot relayed from another player. */
export interface Motion {
  x: number;
  z: number;
  rot: number;
  moving: boolean;
  sitting: boolean;
}

export interface Request {
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
  /** LiveKit room for this session; the server mints the token for it. */
  room: string;
  initiator: boolean;
}

export interface Message {
  id: string;
  name: string;
  text: string;
  time: number;
}
