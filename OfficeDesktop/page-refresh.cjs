const { randomUUID } = require('node:crypto');

// Entry documents must reach the server even when the previous session cached them.
function loadFresh(window, address) {
  const url = new URL(address);
  url.searchParams.set('_launch', randomUUID());
  return window.loadURL(url.href, { extraHeaders: 'Cache-Control: no-cache\nPragma: no-cache\n' });
}

const PAGE_STATE = `({
  scripts: [...document.querySelectorAll('script[type="module"][src]')].map(e => e.src).sort(),
  editing: !!document.querySelector('[data-office-editing="true"], .dk-pending-file') ||
    [...document.querySelectorAll('textarea, input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])')]
      .some(e => e.getClientRects().length && (e.value || '').trim())
})`;
function moduleUrls(html, address) {
  return [...html.matchAll(/<script\b[^>]*>/gi)].filter(([tag]) => /\btype=["']module["']/i.test(tag))
    .flatMap(([tag]) => { const src = tag.match(/\bsrc=["']([^"']+)["']/i); return src ? [new URL(src[1], address).href] : []; }).sort();
}
function refreshBusy(state) {
  return !state || state.sharing || state.meeting?.active || state.meeting?.invitations?.length ||
    state.privateCalls?.sessions?.length || state.privateCalls?.invitations?.length ||
    state.transfers?.some(row => !row.done && !row.failed);
}

// Reopening the shortcut can target the existing tray process. Check both pages,
// then defer a coupled reload while calls, file transfers or unsent edits exist.
function createReopenRefresh({ pages, busy, fetch, schedule = setTimeout, cancel = clearTimeout }) {
  let pending = false, running = false, disposed = false, timer;
  async function check() {
    if (disposed || running || !pending) return;
    running = true;
    try {
      if (busy()) return;
      const targets = pages().filter(p => p.window && !p.window.isDestroyed());
      if (!targets.length) return;
      let changed = false;
      for (const {window, url} of targets) {
        if (window.webContents.isLoading?.()) return;
        const state = await window.webContents.executeJavaScript(PAGE_STATE);
        if (state.editing) return;
        const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) return;
        const next = moduleUrls(await response.text(), url);
        if (!next.length || !state.scripts.length) return;
        changed ||= JSON.stringify(next) !== JSON.stringify(state.scripts);
      }
      if (busy() || disposed) return;
      // Recheck edits after network IO; typing may have begun while fetching.
      for (const {window} of targets) if ((await window.webContents.executeJavaScript(PAGE_STATE)).editing) return;
      if (busy() || disposed) return;
      if (changed) await Promise.all(targets.map(({window,url}) => loadFresh(window,url)));
      pending = false;
    } catch { /* Offline or closing: keep the current usable page and retry later. */ }
    finally {
      running = false;
      if (pending && !disposed) { timer = schedule(check, 5000); timer?.unref?.(); }
    }
  }
  return {
    request() { if (disposed) return; pending = true; cancel(timer); void check(); },
    dispose() { disposed = true; pending = false; cancel(timer); },
  };
}
module.exports = { loadFresh, moduleUrls, refreshBusy, createReopenRefresh, PAGE_STATE };
