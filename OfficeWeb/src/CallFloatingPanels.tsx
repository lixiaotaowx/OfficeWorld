import { useLayoutEffect, useRef, type ReactNode } from 'react';
import './call-floating-panels.css';

/** A shared, click-through stack keeps the two cards clear of workspace tools. */
export default function CallFloatingPanels({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let frame = 0;
    const observed = new Set<Element>();
    const update = () => {
      frame = 0;
      if (!host.current) return;
      const stage = document.querySelector('.stage');
      const rect = stage?.getBoundingClientRect();
      let bottom = Math.min(innerHeight - 12, rect ? rect.bottom - 12 : innerHeight - 88);
      for (const element of document.querySelectorAll('.stage, .build-ui, .bottom-bar')) {
        if (!observed.has(element)) { observed.add(element); resize.observe(element); }
        if (element === stage) continue;
        const box = element.getBoundingClientRect();
        if (box.width && box.height && box.top < bottom && box.bottom > 0) bottom = box.top - 8;
      }
      const top = Math.max(12, rect ? rect.top + 12 : 12);
      const right = Math.max(12, rect ? innerWidth - rect.right + 12 : 12);
      host.current.style.right = `${right}px`;
      host.current.style.bottom = `${Math.max(12, innerHeight - bottom)}px`;
      host.current.style.maxHeight = `${Math.max(80, bottom - top)}px`;
      host.current.style.maxWidth = `${Math.max(220, Math.min(innerWidth - right - 12, rect ? rect.width - 24 : 340))}px`;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    // Building controls can mount after the scene; observe structure, not per-frame styles.
    const mutation = new MutationObserver(schedule);
    mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    update();
    return () => {
      resize.disconnect(); mutation.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, []);
  return <div className="call-floating-panels" ref={host}>{children}</div>;
}
