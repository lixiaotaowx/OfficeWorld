import { useCallback, useEffect, useRef, useState } from 'react';
import './presence-status.css';

async function request(text?: string) {
  const response = await fetch('/api/presence-status', text === undefined ? { cache: 'no-store' } : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error || '状态未能保存');
  return data.statuses as Record<string, string>;
}

export function usePresenceStatus(accountId: string) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const saving = useRef(false);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const ticket = ++sequence.current;
      try {
        const next = await request();
        if (alive && ticket === sequence.current) setStatuses(old =>
          JSON.stringify(old) === JSON.stringify(next) ? old : next);
      } catch { /* A temporary disconnect keeps the last confirmed statuses. */ }
    };
    void load();
    const timer = setInterval(() => { void load(); }, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, [accountId]);
  const show = useCallback(() => {
    setText(statuses[accountId] || ''); setError(''); setOpen(true);
  }, [statuses, accountId]);
  async function save(value: string) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true); setError(''); ++sequence.current;
    try {
      const next = await request(value);
      ++sequence.current; setStatuses(next); setOpen(false);
    } catch (e) { setError(e instanceof DOMException && e.name === 'TimeoutError'
      ? '保存超时，请检查网络后重试' : e instanceof Error ? e.message : '状态未能保存'); }
    finally { saving.current = false; setBusy(false); }
  }
  return { statuses, show, clear: () => { void save(''); }, control: { busy, error }, dialog: open ? <div className="presence-overlay">
    <form className="presence-editor" role="dialog" aria-modal="true" aria-label="加状态"
      onSubmit={event => { event.preventDefault(); void save(text); }}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
      <header><strong>{statuses[accountId] ? '修改状态' : '加状态'}</strong>
        <button type="button" aria-label="关闭状态编辑" onClick={() => setOpen(false)}>×</button></header>
      <p>显示在头像上方，让同事知道你的安排。</p>
      <div className="presence-presets">{['吃饭去了', '有事外出', '报销提醒', '文件准备提醒'].map(value =>
        <button type="button" key={value} disabled={busy} onClick={() => setText(value)}>{value}</button>)}</div>
      <label>状态文字<textarea autoFocus value={text} maxLength={40} disabled={busy}
        placeholder="例如：周五前准备好报销单据" onChange={event => setText(event.target.value)} /></label>
      <small>{[...text].length} / 40 · 保留到你修改或清除</small>
      {error && <p role="alert">{error}</p>}
      <footer>{statuses[accountId] && <button type="button" disabled={busy} onClick={() => void save('')}>清除状态</button>}
        <button type="button" onClick={() => setOpen(false)}>取消</button>
        <button type="submit" disabled={busy || !text.trim()}>{busy ? '保存中…' : '发布状态'}</button></footer>
    </form>
  </div> : null };
}
