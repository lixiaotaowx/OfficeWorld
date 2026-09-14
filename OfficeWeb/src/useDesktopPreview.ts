import { useEffect, useState, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import type { Person } from './types';
import { shouldPreview } from './previewGate';

export function useDesktopPreview(socket: MutableRefObject<Socket | undefined>,
  connected: boolean, person: Person | undefined, notice: (text: string) => void) {
  const [active, setActive] = useState(false);
  // The server says whether anybody else has previews enabled. Default to true so a
  // freshly loaded page never shows the preview as off while the answer is in flight.
  const [wanted, setWanted] = useState(true);
  const desktop = !!window.officeDesktop;
  const eligible = shouldPreview({ desktop, connected, seated: person?.seat != null, wanted,
    employee: person?.role !== 'visitor' });

  useEffect(() => {
    const channel = socket.current;
    if (!channel) return;
    const onAmbient = (message: { wanted?: boolean }) => setWanted(message?.wanted !== false);
    channel.on('ambient', onAmbient);
    return () => { channel.off('ambient', onAmbient); };
  }, [connected]);

  useEffect(() => {
    const bridge = window.officeDesktop;
    const channel = socket.current;
    if (!eligible || !bridge || !channel) {
      setActive(false);
      // Nobody can receive it (or we hold no desk): release the capture stream
      // instead of leaving a screen capture running for nothing.
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
        warned = false;
      } catch {
        if (!stopped) {
          setActive(false);
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
  return { active, wanted };
}
