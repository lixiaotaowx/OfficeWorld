/** Retry transient failures, never retry rejected credentials or an explicit exit. */
export function restoreLogin<T>(callbacks: {
  user: (user: T) => void;
  loading: (loading: boolean) => void;
  error: (error: string) => void;
  credentials?: (credentials: { name: string; password: string }) => void;
}) {
  let stopped = false, running = false, attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  async function request(url: string, init?: RequestInit) {
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 10000);
    try { return await fetch(url, { ...init, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
  }
  async function run() {
    if (stopped || running) return;
    running = true;
    clearTimeout(timer);
    try {
      const credentials = await window.officeDesktop?.readLogin().catch(() => null);
      if (stopped) return;
      let response: Response;
      if (credentials) {
        callbacks.credentials?.(credentials);
        // A desktop launch creates a fresh session, replacing all older sessions.
        response = await request('/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (stopped) return;
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          callbacks.error('姓名或密码不正确，请修改后重试');
          stop(); return;
        }
      } else {
        response = await request('/api/auth/me');
        if (stopped) return;
        if (response.status === 401) { stop(); return; }
      }
      if (!response.ok) throw Error('Offline');
      const data = await response.json();
      if (!stopped) { callbacks.user(data.user); callbacks.error(''); stop(); }
    } catch {
      if (!stopped) {
        const seconds = Math.min(30, 5 * ++attempt);
        callbacks.error(`网络暂不可用，${seconds} 秒后自动重试…`);
        timer = setTimeout(run, seconds * 1000);
      }
    } finally {
      running = false;
      callbacks.loading(false);
    }
  }
  function stop() {
    stopped = true;
    clearTimeout(timer);
    controller?.abort();
    window.removeEventListener('online', run);
  }
  window.addEventListener('online', run);
  void run();
  return stop;
}
