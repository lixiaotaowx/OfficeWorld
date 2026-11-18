  const response = await fetch('/api/presence-status', text === undefined ? { cache: 'no-store' } : {\
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),\
    signal: AbortSignal.timeout(8000),\
      onKeyDown={event => { if (event.key === 'Escape' && !busy) setOpen(false); }}>\
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>\
        <button type="button" disabled={busy} aria-label="关闭状态编辑" onClick={() => setOpen(false)}>×</button></header>\
        <button type="button" aria-label="关闭状态编辑" onClick={() => setOpen(false)}>×</button></header>\
        <button type="button" disabled={busy} onClick={() => setOpen(false)}>取消</button>\
        <button type="button" onClick={() => setOpen(false)}>取消</button>\
