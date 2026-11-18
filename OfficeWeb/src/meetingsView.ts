import type { Socket } from 'socket.io-client';
import type { MeetingAction, MeetingState } from './meetingTypes';

/** Media handle the meetings view needs: join/leave the livekit room, read
 *  the current mic/sharing status, and prepare the microphone before a call. */
export interface MeetingsMediaBridge {
  onChange?(): void;
  socket(): Socket | undefined;
  media(): {
    joinMeeting(room: string, microphone: boolean): Promise<boolean>;
    leaveMeeting(): void;
    meetingStatus(): { connected: boolean; mic: boolean; sharing: boolean } | undefined;
    prepareMic(): Promise<void>;
  } | undefined;
}

export function createMeetingsView(bridge: MeetingsMediaBridge) {
  let state: MeetingState = { active: null, invitations: [] };
  let status = '断开了，等待重连';
  let mic = false;
  let sharing = false;
  let attached = false;
  let wantedMic = false;
  let pollTimer: ReturnType<typeof setInterval> | undefined;
  let socket: Socket | undefined;
  let joinedRoom: string | null = null;
  const changed = () => bridge.onChange?.();

  function detachSocket() {
    socket?.off('meeting-state', applyState);
    socket = undefined;
  }

  function followRoom() {
    const room = attached ? state.active?.room ?? null : null;
    if (room === joinedRoom) return;
    joinedRoom = room;
    sharing = false;
    if (room) {
      status = '正在连会议语音…';
      void bridge.media()?.joinMeeting(room, wantedMic).then(ok => {
        if (joinedRoom !== room) return;
        status = ok ? '进入会议了' : '语音没连上，退出再进来试试';
        mic = Boolean(bridge.media()?.meetingStatus()?.mic);
        changed();
      });
    } else {
      bridge.media()?.leaveMeeting();
      mic = false;
    }
    if (state.active && !pollTimer) pollTimer = setInterval(pollStatus, 1000);
    if (!state.active && pollTimer) { clearInterval(pollTimer); pollTimer = undefined; }
  }

  function pollStatus() {
    const live = bridge.media()?.meetingStatus();
    if (!live) return;
    let moved = false;
    if (mic !== live.mic) { mic = live.mic; moved = true; }
    if (sharing !== live.sharing) { sharing = live.sharing; moved = true; }
    const next = live.connected ? '进入会议了' : '断开了，正在重连';
    if (status !== next) { status = next; moved = true; }
    if (moved) changed();
  }

  function applyState(next: MeetingState) {
    state = next;
    followRoom();
    changed();
  }

  function setConnected(connected: boolean) {
    attached = connected;
    if (connected) {
      const active = bridge.socket();
      if (active && active !== socket) {
        detachSocket();
        socket = active;
        socket.on('meeting-state', applyState);
        socket.emit('meeting-sync');
      }
      followRoom();
    } else {
      detachSocket();
      status = '断开了，等待重连';
      followRoom();
    }
    changed();
  }

  async function act(data: MeetingAction) {
    const active = bridge.socket();
    if (!active?.connected) throw Error('断开了，等重新连上');
    if (['create', 'accept', 'huddle', 'join'].includes(data.action)) {
      wantedMic = data.microphone === true;
      if (wantedMic) await bridge.media()?.prepareMic();
    }
    const reply = await new Promise<{ ok: boolean; error?: string }>(resolve => {
      active.timeout(8000).emit('meeting-action', data, (failed: unknown, answer?: { ok: boolean; error?: string }) =>
        resolve(failed ? { ok: false, error: '会议请求超时了，先看看会议列表再重试' } : (answer ?? { ok: false, error: '会议请求没有回应' })));
    });
    if (!reply.ok) throw Error(reply.error || '会议操作没成功');
  }

  function view() {
    return {
      get active() { return state.active; },
      get invitations() { return state.invitations; },
      status,
      get mic() { return mic; },
      get sharing() { return sharing; },
      dispose() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = undefined; }
      },
    };
  }

  type View = ReturnType<typeof view>;
  let snapshot: View | undefined;
  const publish = () => { snapshot = view(); };
  publish();

  return {
    setConnected,
    applyState,
    act,
    view(): View {
      snapshot = view();
      return snapshot!;
    },
    dispose: () => {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = undefined; }
      detachSocket();
    },
  };
}
