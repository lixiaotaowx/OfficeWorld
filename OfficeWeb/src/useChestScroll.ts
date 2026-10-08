import { useEffect, useRef, useState } from 'react';

const TOUCH_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
const NUDGE_DELAY = 350;
const NUDGE_BACK = 800;

/**
 * 内容比容器高时，轻轻下滚 90px 再回顶，提醒"下面还有"。用户一碰就取消。
 *
 * 计时器与"已经提示过"的标记都放在 ref 里，并且**只在真正卸载时**才收掉计时器：
 * React 会在依赖变化（以及 StrictMode 的开发态重跑）时立刻执行 cleanup，以前在
 * cleanup 里 clearTimeout，会把刚排好的滚动连同 shown 标记一起作废——现象就是
 * "提示有了、滚动却永远不发生"（2026-09-30 实测 4 次里 3 次不滚）。
 */
export function useChestScroll(count: number) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useRef({ shown: false, muted: false, timers: [] as ReturnType<typeof setTimeout>[] });
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const store = state.current;
    const stop = () => { for (const id of store.timers) clearTimeout(id); store.timers = []; };
    const cancel = () => {
      store.muted = true;
      stop();
      element.scrollTo({ top: element.scrollTop, behavior: 'instant' });
    };
    const measure = () => {
      const extra = element.scrollHeight - element.clientHeight;
      setOverflow(extra > 2);
      if (extra <= 2 || store.shown || store.muted) return;
      store.shown = true;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      store.timers.push(setTimeout(() => {
        if (store.muted) return;
        element.scrollTo({ top: Math.min(extra, 90), behavior: 'smooth' });
        store.timers.push(setTimeout(() => {
          if (!store.muted) element.scrollTo({ top: 0, behavior: 'smooth' });
        }, NUDGE_BACK));
      }, NUDGE_DELAY));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) observer.observe(child);
    for (const event of TOUCH_EVENTS) element.addEventListener(event, cancel, { passive: true });
    measure();
    return () => {
      observer.disconnect();
      for (const event of TOUCH_EVENTS) element.removeEventListener(event, cancel);
      if (!element.isConnected) stop();
    };
  }, [count]);
  return { ref, overflow };
}
