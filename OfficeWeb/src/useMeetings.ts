import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import type { OfficeMedia } from './media';
import type { MeetingAction, MeetingState } from './meetingTypes';

export function useMeetings(socket: MutableRefObject<Socket | undefined>,
  media: MutableRefObject<OfficeMedia | undefined>, connected: boolean) {
  const [state, setState] = useState<MeetingState>({ active: null, invitations: [] });
  const [status, setStatus] = useState('');
  const [mic, setMic] = useState(false);
  const [sharing, setSharing] = useState(false);
  const micWanted = useRef(false);
  const joined = useRef<string | null>(null);
  const mediaBusy = useRef(false);
  useEffect(() => {
    if (!state.active) return;
    const timer = setInterval(() => {
      const actual = media.current?.meetingStatus();
      if (!actual) return;
      setMic(actual.mic); setSharing(actual.sharing);
      if (actual.connected) setStatus('已连接会议');
      else setStatus('媒体连接中断，正在恢复…');
    }, 1000);
    return () => clearInterval(timer);
  }, [state.active?.room]);
  async function act(data: MeetingAction) {
    if (!socket.current?.connected) throw Error('连接已断开，请等待恢复');
    if (data.action === 'create' || data.action === 'accept') {
      micWanted.current = data.microphone === true;
      if (micWanted.current) await media.current?.prepareMic();
    }
    const reply = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
      socket.current!.timeout(8000).emit('meeting-action', data,
        (error: unknown, value: { ok: boolean; error?: string }) => resolve(error
          ? { ok: false, error: '会议操作超时，请检查会议列表后重试' } : value));
    });
    if (!reply?.ok) throw Error(reply?.error || '会议操作失败');
  }
  useEffect(() => {
    const s = socket.current;
    if (!s || !connected) {
      media.current?.leaveMeeting(); joined.current = null;
      setStatus('连接断开，正在等待恢复'); return;
    }
    const receive = (next: MeetingState) => setState(next);
    s.on('meeting-state', receive); s.emit('meeting-sync');
    return () => { s.off('meeting-state', receive); };
  }, [connected]);
  useEffect(() => {
    const room = connected ? state.active?.room ?? null : null;
    if (joined.current === room) return;
    joined.current = room; setSharing(false);
    if (!room) { media.current?.leaveMeeting(); setMic(false); return; }
    let cancelled = false; setStatus('正在连接会议音频…');
    void media.current?.joinMeeting(room, micWanted.current).then(ok => {
      if (cancelled) return;
      setStatus(ok ? '已连接会议' : '音频连接失败，可离开后重新加入');
      setMic(!!media.current?.meetingStatus().mic);
    });
    return () => { cancelled = true; };
  }, [state.active?.room, connected]);
  async function changeMedia(kind: 'mic' | 'screen', enabled?: boolean) {
    if (mediaBusy.current) return;
    mediaBusy.current = true;
    try {
      const actual = media.current?.meetingStatus();
      if (kind === 'mic') {
        const next = enabled ?? !actual?.mic;
        await media.current?.meetingMicrophone(next);
        micWanted.current = next;
      } else await media.current?.meetingScreen(enabled ?? !actual?.sharing);
      const next = media.current?.meetingStatus();
      setMic(!!next?.mic); setSharing(!!next?.sharing);
    } finally { mediaBusy.current = false; }
  }
  return { ...state, act, status, mic, sharing,
    stopShare: () => changeMedia('screen', false),
    toggleMic: () => changeMedia('mic'),
    toggleShare: () => changeMedia('screen'),
  };
}
