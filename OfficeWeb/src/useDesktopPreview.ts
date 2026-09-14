import { useEffect, useState, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import type { Person } from './types';
import { mayBroadcastPreview, previewReason, shouldPreview } from './previewGate';
import { BOSS_SEAT } from './seats';

export function useDesktopPreview(socket: MutableRefObject<Socket | undefined>,
  connected: boolean, person: Person | undefined, notice: (text: string) => void) {
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  // Whether anybody else can receive previews right now. It no longer gates the
  // capture (your own monitor must always show your own screen); it is kept so the
  // status line can say that nobody is watching yet.
  const [watched, setWatched] = useState(true);
  const desktop = !!window.officeDesktop;
  const seated = person?.seat != null;
  const mayBroadcast = mayBroadcastPreview(person?.role, person?.seat, BOSS_SEAT);
  const eligible = shouldPreview({ desktop, connected, seated, mayBroadcast });

  useEffect(() => {
    const channel = socket.current;
    if (!channel) return;
    const onAmbient = (message: { wanted?: boolean }) => setWatched(message?.wanted !== false);
    channel.on('ambient', onAmbient);
    return () => { channel.off('ambient', onAmbient); };
  }, [connected]);

  useEffect(() => {
    const bridge = window.officeDesktop;
    const channel = socket.current;
    if (!eligible || !bridge || !channel) {
      setActive(false);
      // No desk (or not allowed): release the capture stream instead of leaving a
      // screen capture running for nothing.
      void bridge?.setPreviewActive?.(false).catch(() => undefined);
      return;
    }
    let stopped = false, busy = false, warned = false;
    let timer: ReturnType<typeof setTimeout>;
    async function frame() {
      if (stopped || busy) return;
      busy = true;
      clearTimeout(timer);
      try {
        const image = await bridge!.previewFrame();
        if (stopped || !channel!.connected) return;
        channel!.emit('ambient-sharing', true);
        channel!.emit('preview', image);
        setActive(true);
        setFailed(false);
        warned = false;
      } catch {
        if (!stopped) {
          setActive(false);
          setFailed(true);
          channel!.emit('ambient-sharing', false);
          if (!warned) notice('屏幕预览暂不可用，正在自动重试');
          warned = true;
        }
      } finally {
        busy = false;
        // 6s / 300px (user, 2026-09-14): the capture itself is long-lived and cheap,
        // so the interval is about bandwidth and how often the screen is captured.
        if (!stopped) timer = setTimeout(frame, 6000);
      }
    }
    void frame();
    window.addEventListener('office-display-changed', frame);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener('office-display-changed', frame);
      if (channel.connected) channel.emit('ambient-sharing', false);
      setActive(false);
    };
  }, [eligible, connected, person?.id]);
  return { active, reason: previewReason({ active, desktop, connected, seated, mayBroadcast, failed, watched }) };
}
