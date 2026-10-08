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
  // `close` 是 App 每次渲染新建的箭头函数，绝不能进依赖：一进依赖，页面每重渲染
  // （people/seats 广播、一点交互都算）就重新读一次显示器列表，而
  // `desktopCapturer.getSources` 会把三块屏幕各抓一遍缩略图 —— 主进程被灌满，
  // 整机鼠标都发飘（用户 2026-09-2X 报障"右键出来以后整个变卡了"）。
  // 所以回调放 ref，底下这个 effect 只在菜单挂载时跑一次。
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    let cancelled = false;
    void window.officeDesktop?.displays().then(rows => {
      if (!cancelled) setDisplays(rows);
    }).catch(() => { if (!cancelled) setError('无法读取屏幕，请稍后重试'); });
    const outside = (event: PointerEvent) => {
      if (!host.current?.contains(event.target as Node)) closeRef.current();
    };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') closeRef.current(); };
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', key);
    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', key);
    };
  }, []);
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
    <strong>共享与预览 · 切换屏幕</strong>
    <small>正在进行的屏幕共享会立刻切到这块屏幕，工位预览也跟着换</small>
    {!displays.length && !error && <p>正在识别显示器…</p>}
    {displays.map(display => <button key={display.id} role="menuitemradio"
      aria-checked={display.selected} disabled={busy} onClick={() => void select(display.id)}>
      <span>{display.name}<small>{display.width} × {display.height}</small></span>
      <span aria-hidden="true">{display.selected ? '✓' : ''}</span>
    </button>)}
    {error && <p role="alert">{error}</p>}
  </div>, document.body);
}
