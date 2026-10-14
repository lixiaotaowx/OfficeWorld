import { useCallback, useEffect, useRef, useState } from 'react';

/** A native window restoring focus is not a request to select that old avatar. */
export function useDockHover(blocked: boolean) {
  const [hovered, setHovered] = useState('');
  const openTimer = useRef<ReturnType<typeof setTimeout>>();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const keyboardNavigation = useRef(false);
  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current); openTimer.current = undefined;
    clearTimeout(closeTimer.current); closeTimer.current = undefined;
  }, []);
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => { keyboardNavigation.current = event.key === 'Tab'; };
    const pointer = () => { keyboardNavigation.current = false; };
    document.addEventListener('keydown', keyboard, true);
    document.addEventListener('pointerdown', pointer, true);
    document.addEventListener('pointermove', pointer, true);
    window.addEventListener('blur', pointer);
    return () => {
      clearTimers();
      document.removeEventListener('keydown', keyboard, true);
      document.removeEventListener('pointerdown', pointer, true);
      document.removeEventListener('pointermove', pointer, true);
      window.removeEventListener('blur', pointer);
    };
  }, [clearTimers]);
  const open = useCallback((id: string, delayed = false) => {
    if (blocked) return;
    clearTimers();
    if (delayed) openTimer.current = setTimeout(() => setHovered(id), 80);
    else setHovered(id);
  }, [blocked, clearTimers]);
  const focus = useCallback((id: string) => {
    if (keyboardNavigation.current) open(id);
  }, [open]);
  const close = useCallback(() => { clearTimers(); setHovered(''); }, [clearTimers]);
  const scheduleClose = useCallback(() => {
    clearTimers();
    // Allow crossing the gap between an avatar and its card.
    closeTimer.current = setTimeout(close, 350);
  }, [clearTimers, close]);
  return { hovered, open, focus, close, scheduleClose };
}
