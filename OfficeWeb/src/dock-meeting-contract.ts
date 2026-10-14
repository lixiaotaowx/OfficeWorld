/** Main window owns the meeting; the dock receives only presentation snapshots. */
export interface DockMeetingState {
  active: boolean;
  id?: string;
  host?: boolean;
  members?: { id: string; name: string; status: 'invited' | 'joined' | 'declined' | 'left' | 'removed' }[];
  invitations?: { id: string; personId: string; name: string }[];
  title: string;
  mic: boolean;
  /** 我这只麦克风现在的音量（0..1，静音时是 0）：静音按钮外面那圈波纹按它画。 */
  micLevel?: number;
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
