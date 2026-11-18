import { useEffect, useRef, useState } from 'react';
import { createMeetingSignal, type MeetingSignal, type MeetingSignalClient } from './connectionQuality';

export interface MeetingSignalView {
  state: MeetingSignal['state'];
  summary: string;
  events: MeetingSignal['events'];
  tick: number;
}

const EMPTY: MeetingSignalView = {
  state: { connection: 'inactive', quality: 'unknown', participants: [] },
  summary: 'No active meeting', events: [], tick: 0,
};

/** Bind the meeting-signal factory to the office media handle: the room id
 *  changes whenever a meeting is joined or left, and the hook publishes a new
 *  snapshot object only when the underlying state actually moved. */
export function useMeetingSignal(getRoom: () => string | null,
  getMeetingConnection: () => unknown): MeetingSignalView {
  const [view, setView] = useState<MeetingSignalView>(EMPTY);
  const client = useRef<MeetingSignalClient | null>(null);

  useEffect(() => {
    const signal = createMeetingSignal(getMeetingConnection as () => never, () => setView({ ...signal.snapshot() }));
    client.current = signal;
    return () => { signal.dispose(); client.current = null; };
  }, [getMeetingConnection]);

  useEffect(() => {
    client.current?.setRoom(getRoom());
  }, [getRoom, getMeetingConnection]);

  useEffect(() => {
    const timer = setInterval(() => setView(previous => {
      const next = client.current?.snapshot() ?? EMPTY;
      return next.tick === previous.tick ? previous : next;
    }), 1000);
    return () => clearInterval(timer);
  }, []);

  return view;
}
