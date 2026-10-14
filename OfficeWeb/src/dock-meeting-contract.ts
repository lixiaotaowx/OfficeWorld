/** Main window owns the meeting; the dock receives only presentation snapshots. */
export interface DockMeetingState {
  active: boolean;
  id?: string;
  host?: boolean;
  members?: { id: string; name: string; status: 'invited' | 'joined' | 'declined' | 'left' | 'removed' }[];
  invitations?: { id: string; personId: string; name: string }[];
  title: string;
  mic: boolean;
  sharing: boolean;
  busy: boolean;
  error: string;
  candidates: { id: string; name: string; personId: string }[];
  screens: { id: string; name: string; streamId: string }[];
}
export interface DockMeetingCreate { title: string; invitees: string[]; microphone: boolean }
export type DockActionKind = 'private-share' | 'private-mute' | 'status' | 'status-clear' | 'watch' | 'share' | 'call' | 'meeting' | 'meeting-create' |
  'meeting-mute' | 'meeting-share' | 'meeting-view' | 'meeting-fullscreen' |
  'meeting-leave' | 'meeting-end' | 'meeting-accept' | 'meeting-decline';
/** Encoded video only: no audio, capture permissions, media tokens or socket in the dock. */
export interface DockVideoChunk {
  id: string; epoch: string; mime: string; reset?: boolean; bytes?: ArrayBuffer;
}
