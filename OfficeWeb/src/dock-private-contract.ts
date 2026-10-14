import type { DockGreet, DockState } from './dockRules';

export interface DockPrivateState {
  invitations: { id: string; personId: string; name: string; kind: 'voice' | 'screen'; offer: boolean }[];
  sessions: { id: string; name: string; connected: boolean; mic: boolean; sharing: boolean }[];
  /**
   * 我这只麦克风现在的音量（0..1，静音时是 0）。私人通话和会议共用一排按钮，所以两边
   * 都要带这个数：静音按钮外面那圈波纹按它画（用户 2026-10-14）。
   */
  micLevel?: number;
  busy: boolean;
  error: string;
}

/** Live invitations own the stage; preview heartbeats cannot replace a ringing caller. */
export function dockGreeting(state: DockState, event: DockGreet | null): DockGreet | null {
  const incoming = state.privateCalls?.invitations[0];
  if (incoming) return { id: incoming.personId, name: incoming.name, requestId: incoming.id,
    kind: incoming.kind, offer: incoming.offer, mode: 'call', at: 0 };
  const meeting = state.meeting?.invitations?.[0];
  if (meeting) return { id: meeting.personId, name: meeting.name, requestId: meeting.id,
    kind: 'meeting', mode: 'call', at: 0 };
  // New snapshots are authoritative even when empty. Old clients retain their event fallback.
  return state.privateCalls && event?.mode === 'call' ? null : event;
}
