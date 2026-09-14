import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DesktopDisplay } from './desktop';
import './monitor-context.css';

export default function MonitorContextMenu({ point, close }: {
  point: { x: number; y: number }; close: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [displays, setDisplays] = useState<DesktopDisplay[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void window.officeDesktop?.displays().then(rows => {
      if (!cancelled) setDisplays(rows);
    }).catch(() => { if (!cancelled) setError('无法读取屏幕，请稍后重试'); });
    const outside = (event: PointerEvent) => {
      if (!host.current?.contains(event.target as Node)) close();
    };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
    };
  }, [close]);
  async function select(id: string) {
    setBusy(true);
    try {
      await window.officeDesktop?.selectDisplay(id);
      window.dispatchEvent(new Event('office-display-changed'));
      close();
    } catch { setError('屏幕已断开，请关闭菜单后重新选择'); }
    finally { setBusy(false); }
  }
  return createPortal(<div ref={host} className="monitor-context" role="menu" aria-label="工位预览屏幕"
    style={{ left: Math.max(8, Math.min(point.x, window.innerWidth - 268)),
      top: Math.max(8, Math.min(point.y, window.innerHeight - 290)) }}>
    <strong>工位预览 · 切换屏幕</strong>
    <small>每 3 秒更新，仅低清预览</small>
    {!displays.length && !error && <p>正在识别显示器…</p>}
    {displays.map(display => <button key={display.id} role="menuitemradio"
      aria-checked={display.selected} disabled={busy} onClick={() => void select(display.id)}>
      <span>{display.name}<small>{display.width} × {display.height}</small></span>
      <span aria-hidden="true">{display.selected ? '✓' : ''}</span>
    </button>)}
    {error && <p role="alert">{error}</p>}
  </div>, document.body);
}
