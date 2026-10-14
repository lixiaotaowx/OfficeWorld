import { useEffect, useState, type RefObject } from 'react';

/** Zoom only the picture; playback controls stay at their normal size. */
export function useScreenZoom(host: RefObject<HTMLDivElement>, enabled: boolean, stream: MediaStream) {
  const [zoom, setZoom] = useState(1);
  useEffect(() => { setZoom(1); }, [enabled, stream]);
  useEffect(() => {
    const element = host.current;
    if (!enabled || !element) return;
    const wheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest('button, .screen-stage-bar')) return;
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      setZoom(value => Math.max(1, Math.min(4, value * Math.exp(-delta * .0015))));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [host, enabled, stream]);
  return zoom;
}
