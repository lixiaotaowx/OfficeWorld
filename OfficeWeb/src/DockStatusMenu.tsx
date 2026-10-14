import { useEffect, useState } from 'react';
import type { DockPerson } from './dockRules';
import './dock-status.css';

export default function DockStatusMenu({ person, control, onClose }: {
  person: DockPerson; control?: { busy: boolean; error: string }; onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  useEffect(() => {
    if (clearing && !person.status) onClose();
    if (control?.error) setClearing(false);
  }, [clearing, person.status, control?.error, onClose]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('.dock-status-menu, .dock-avatar.mine')) onClose();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [onClose]);
  return <div className="dock-status-menu" role="dialog" aria-label="我的状态">
    {person.status && <p>{person.status}</p>}
    <button disabled={clearing || control?.busy} onClick={async () => {
      try { await window.officeDock?.action?.('status', person.id); onClose(); }
      catch { setError('请更新客户端后重试'); }
    }}>{person.status ? '修改状态' : '加状态'}</button>
    {person.status && <button disabled={clearing || control?.busy} onClick={async () => {
      setError(''); setClearing(true);
      try { await window.officeDock?.action?.('status-clear', person.id); }
      catch { setError('请更新客户端后重试'); setClearing(false); }
    }}>{clearing || control?.busy ? '清除中…' : '清除状态'}</button>}
    <button className="dock-status-close" aria-label="关闭状态菜单" onClick={onClose}>×</button>
    {(error || control?.error) && <p role="alert">{error || control?.error}</p>}
  </div>;
}
