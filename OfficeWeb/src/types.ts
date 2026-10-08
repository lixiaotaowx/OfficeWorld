import type { Appearance } from "./look";
import type { SitPoseId } from "./sitPoses";

export interface Person {
  sittingSpot?: string | null;
  id: string;
  clientId: string;
  name: string;
  /** Chosen workstation, or null while the player has not picked one yet. */
  seat: number | null;
  /** 这个人的配色与配件（尺子角色），同事据此把他画成一样。 */
  appearance: Appearance;
  /** `employee`, `visitor`, or empty before they chose on the way in. */
  role?: "employee" | "visitor" | "";
  /** Whether this person's tiny thumbnail may show on their monitor. */
  previewAllowed: boolean;
  sharing: boolean;
  /**
   * Whether this client can host the annotation layer on the screen it shares.
   * True for the desktop app, false for a browser tab — and only a client that can
   * host it should be offered as a screen to draw on.
   */
  annotate?: boolean;
  /**
   * Whether this client's mouse/keyboard has been used recently enough to call
   * them 在座. Missing means 在座 (older client, or a page that cannot detect
   * input), which is why the check everywhere is `atDesk !== false`.
   */
  atDesk?: boolean;
  /** Milliseconds already away when the server sent this payload. */
  awayFor?: number;
  autoExpression?: import('./look').AvatarExpression;
  /**
   * Whether this person is in a call right now (a private voice or screen call —
   * including calls that are not with me). The taskbar strip marks them with a
   * microphone; the server derives it from the live sessions (用户 2026-09-23).
   */
  inCall?: boolean;
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
  y?: number;
  sittingSpot?: string | null;
  x: number;
  z: number;
  rot: number;
  moving: boolean;
  /** 他是不是在跑（长距离/Shift）：远端放跑步循环而不是走路。 */
  running?: boolean;
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
