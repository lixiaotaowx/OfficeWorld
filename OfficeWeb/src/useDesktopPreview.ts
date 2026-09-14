import { useEffect, useState, type MutableRefObject } from 'react';
import type { Socket } from 'socket.io-client';
import type { Person } from './types';

export function useDesktopPreview(socket: MutableRefObject<Socket | undefined>,
  connected: boolean, person: Person | undefined, notice: (text: string) => void) {
  const [active, setActive] = useState(false);
  const eligible = !!window.officeDesktop && connected && person?.seat != null;
  useEffect(() => {
    const bridge = window.officeDesktop;
    const channel = socket.current;
    if (!eligible || !bridge || !channel) { setActive(false); return; }
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
        if (!stopped) timer = setTimeout(frame, 3000);
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
  return { active };
}
