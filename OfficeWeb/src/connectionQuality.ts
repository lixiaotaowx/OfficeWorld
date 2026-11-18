import type { Room } from 'livekit-client';

/** One participant's link quality, as livekit reports it. */
export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'lost' | 'unknown';

export interface MeetingParticipant {
  id: string;
  name: string;
  quality: ConnectionQuality;
}

export interface MeetingSignalState {
  connection: 'inactive' | 'connecting' | 'connected' | 'disconnected' | string;
  quality: ConnectionQuality;
  participants: MeetingParticipant[];
}

export interface MeetingSignalEvent {
  at: number;
  message: string;
}

export interface MeetingSignal {
  state: MeetingSignalState;
  summary: string;
  events: MeetingSignalEvent[];
  tick: number;
}

const EMPTY = (): MeetingSignalState => ({ connection: 'inactive', quality: 'unknown', participants: [] });

/** Accept the known qualities, map everything else to unknown. */
export function signalLevel(value: unknown): ConnectionQuality {
  return ['excellent', 'good', 'poor', 'lost'].includes(String(value))
    ? value as ConnectionQuality : 'unknown';
}

/** The Chinese summary line for a state, as shown in the signal panel tooltip. */
export function signalSummary(state: MeetingSignalState): string {
  const qualityText: Record<string, string> = { excellent: '信号很好', good: '信号好', poor: '信号弱', lost: '断开了' };
  if (state.connection === 'inactive') return '没有在开会';
  if (state.connection !== 'connected') {
    return state.connection === 'disconnected' ? '断开了' : '正在连会议…';
  }
  return qualityText[state.quality] ?? state.quality;
}

const SAMPLE_MS = 2000;

/**
 * Turn a livekit room into a small snapshot object for the UI: link quality for
 * the local participant and everyone else, plus a short event history. The room
 * handle is injected so this module stays media-free and easy to test.
 */
export function createMeetingSignal(getRoom: () => Room | undefined | null,
  notify: () => void = () => {}): MeetingSignalClient {
  let room: Room | undefined | null = undefined;
  let timer: ReturnType<typeof setInterval> | undefined;
  let offRoom: () => void = () => {};
  let signal: MeetingSignal = { state: EMPTY(), summary: 'No active meeting', events: [], tick: 0 };

  const detach = () => {
    offRoom();
    offRoom = () => {};
    room = undefined;
  };

  function sample(push: boolean) {
    const next = getRoom();
    if (next !== room) {
      detach();
      room = next;
      if (next) {
        next.on('connectionQualityChanged', sampleSoon);
        next.on('connectionStateChanged', sampleSoon);
        next.on('participantConnected', sampleSoon);
        next.on('participantDisconnected', sampleSoon);
        offRoom = () => {
          next.off('connectionQualityChanged', sampleSoon);
          next.off('connectionStateChanged', sampleSoon);
          next.off('participantConnected', sampleSoon);
          next.off('participantDisconnected', sampleSoon);
        };
      }
    }
    const state: MeetingSignalState = {
      connection: next?.state || 'connecting',
      quality: next?.state === 'connected' ? signalLevel(next.localParticipant.connectionQuality)
        : next?.state === 'disconnected' ? 'lost' : 'unknown',
      participants: next ? [next.localParticipant, ...next.remoteParticipants.values()].map(p => ({
        id: p.identity, name: p.name || p.identity || 'Participant', quality: signalLevel(p.connectionQuality),
      })) : [],
    };
    if (JSON.stringify(signal.state) === JSON.stringify(state)) return;
    const summary = signalSummary(state);
    const events = signal.summary === summary ? signal.events
      : [...signal.events, { at: Date.now(), message: summary }].slice(-20);
    signal = { state, summary, events, tick: (signal.tick || 0) + 1 };
    if (push) notify();
  }
  const sampleSoon = () => sample(true);

  return {
    setRoom(next: string | null) {
      if (next === room as unknown) return;
      // LiveKit rooms are compared by handle; a name change to the same null clears.
      if (next === null) {
        detach();
        if (timer) { clearInterval(timer); timer = undefined; }
        signal = { state: EMPTY(), summary: 'No active meeting', events: [], tick: 0 };
        return;
      }
      room = undefined;
    },
    snapshot: () => signal,
    dispose() {
      if (timer) { clearInterval(timer); timer = undefined; }
      detach();
    },
  };
}

export interface MeetingSignalClient {
  setRoom(room: string | null): void;
  snapshot(): MeetingSignal;
  dispose(): void;
}
