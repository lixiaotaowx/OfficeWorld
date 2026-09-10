export interface Person {
  id: string;
  name: string;
  seat: number;
  sharing: boolean;
  meeting: boolean;
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
