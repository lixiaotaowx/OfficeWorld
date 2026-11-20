import { RoomEvent } from '../vendor/livekit.js';
import { getMeetingConnectionLabel } from './signalLabels.js';

const REFRESH_MS = 2_000;
const MAX_EVENTS = 20;
const OBSERVED_EVENTS = [RoomEvent.ConnectionQualityChanged, RoomEvent.ConnectionStateChanged,
  RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected];
const noop = () => {};
const normalizeQuality = quality => ['excellent', 'good', 'poor', 'lost'].includes(String(quality)) ? quality : 'unknown';

function initialSnapshot() {
  return {
    state: { connection: 'inactive', quality: 'unknown', participants: [] },
    summary: 'No active meeting',
    events: [],
    tick: 0,
  };
}

export function createMeetingSignal(getRoom, notify) {
  let observedRoom;
  let roomId = null;
  let unsubscribe = noop;
  let timer;
  let snapshot = initialSnapshot();

  function sample(emit) {
    const room = getRoom();
    if (room !== observedRoom) {
      unsubscribe();
      observedRoom = room;
      if (room) {
        for (const event of OBSERVED_EVENTS) room.on(event, refresh);
        unsubscribe = () => {
          for (const event of OBSERVED_EVENTS) room.off(event, refresh);
        };
      } else unsubscribe = noop;
    }

    const state = {
      connection: room?.state || 'connecting',
      quality: room?.state === 'connected' ? normalizeQuality(room.localParticipant.connectionQuality)
        : room?.state === 'disconnected' ? 'lost' : 'unknown',
      participants: room ? [room.localParticipant, ...room.remoteParticipants.values()].map(person => ({
        id: person.identity,
        name: person.name || person.identity || 'Participant',
        quality: normalizeQuality(person.connectionQuality),
      })) : [],
    };
    if (JSON.stringify(snapshot.state) === JSON.stringify(state)) return;
    const summary = getMeetingConnectionLabel(state);
    const events = snapshot.summary === summary ? snapshot.events
      : [...snapshot.events, { at: Date.now(), message: summary }].slice(-MAX_EVENTS);
    snapshot = { state, summary, events, tick: (snapshot.tick || 0) + 1 };
    if (emit) notify();
  }

  function refresh() {
    sample(true);
  }

  function dispose() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
    unsubscribe();
    unsubscribe = noop;
    observedRoom = undefined;
  }

  return {
    setRoom(nextRoomId) {
      if (nextRoomId === roomId) return;
      roomId = nextRoomId;
      dispose();
      if (!roomId) {
        snapshot = initialSnapshot();
        return;
      }
      sample(false);
      timer = setInterval(refresh, REFRESH_MS);
    },
    snapshot: () => snapshot,
    dispose,
  };
}
