import { useEffect, useRef, useState } from 'react';

export function ChestVideoFrame({ src, title, portrait }: { src: string; title: string; portrait?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const element = viewport.current;
    if (!element || !portrait) return;
    // Keep enough native height for the vertical video, controls and platform footer.
    const fit = () => setScale(Math.min(element.clientWidth / 360, element.clientHeight / 720));
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    fit();
    return () => observer.disconnect();
  }, [portrait]);
  return <div ref={viewport} className={'chest-video-viewport' + (portrait ? ' vertical' : '')}>
    <iframe title={title} src={src} allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      style={portrait ? { width: 360, height: 720, transform: `translate(-50%, -50%) scale(${scale})` } : undefined}
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
  </div>;
}
