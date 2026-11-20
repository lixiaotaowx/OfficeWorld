const LOGIN_TIMEOUT_MS = 10_000;
const MAX_RETRY_SECONDS = 30;

export function restoreLogin(callbacks) {
  let stopped = false;
  let inFlight = false;
  let failedAttempts = 0;
  let retryTimer;
  let request;

  async function fetchSession(url, options) {
    request = new AbortController();
    const timeout = setTimeout(() => request?.abort(), LOGIN_TIMEOUT_MS);
    try {
      return await fetch(url, { ...options, signal: request.signal });
    } finally {
      clearTimeout(timeout);
    }
  }

  async function restore() {
    if (stopped || inFlight) return;
    inFlight = true;
    clearTimeout(retryTimer);
    try {
      const credentials = await window.officeDesktop?.readLogin().catch(() => null);
      if (stopped) return;
      let response;
      if (credentials) {
        callbacks.credentials?.(credentials);
        response = await fetchSession('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (stopped) return;
        if ([400, 401, 403].includes(response.status)) {
          callbacks.error('名字或密码不对，检查一下再试');
          stop();
          return;
        }
      } else {
        response = await fetchSession('/api/auth/me');
        if (stopped) return;
        if (response.status === 401) {
          stop();
          return;
        }
      }
      if (!response.ok) throw new Error('Offline');
      const { user } = await response.json();
      if (!stopped) {
        callbacks.user(user);
        callbacks.error('');
        stop();
      }
    } catch {
      if (!stopped) {
        const delay = Math.min(MAX_RETRY_SECONDS, 5 * ++failedAttempts);
        callbacks.error(`Network unavailable. Retrying in ${delay} seconds…`);
        retryTimer = setTimeout(restore, delay * 1000);
      }
    } finally {
      inFlight = false;
      callbacks.loading(false);
    }
  }

  function stop() {
    stopped = true;
    clearTimeout(retryTimer);
    request?.abort();
    window.removeEventListener('online', restore);
  }

  window.addEventListener('online', restore);
  void restore();
  return stop;
}

export const getHostStateBridge = () => globalThis.window?.officeHost?.state;
export const getHostMediaBridge = () => globalThis.window?.officeHost?.media ?? undefined;

export async function readHostAccount() {
  const auth = globalThis.window?.officeHost?.auth;
  if (!auth?.get) return null;
  try {
    return await auth.get();
  } catch {
    return null;
  }
}

export function subscribeToHostAccount(listener) {
  return globalThis.window?.officeHost?.auth?.onChange?.(listener);
}
