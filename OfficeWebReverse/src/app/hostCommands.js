import { getHostStateBridge, readHostAccount } from './authSession.js';

export function isCommsHostEnabled() {
  if (typeof window === 'undefined' || window.officeHost?.enabled === false) return false;
  if (window.officeHost?.enabled === true) return true;
  try {
    const option = new URLSearchParams(window.location.search).get('officeCommsHost');
    return option !== '0' && option !== 'false';
  } catch {
    return true;
  }
}

const responseListeners = new Set();
let unsubscribeResponses;

function detachIdleSubscription() {
  if (responseListeners.size === 0) {
    unsubscribeResponses?.();
    unsubscribeResponses = undefined;
  }
}

export function subscribeToHostResponses(listener) {
  const host = globalThis.window?.officeHost;
  if (!host?.onResponse) return () => {};
  responseListeners.add(listener);
  unsubscribeResponses ||= host.onResponse(response => {
    for (const callback of responseListeners) callback(response);
    detachIdleSubscription();
  });
  return () => {
    responseListeners.delete(listener);
    detachIdleSubscription();
  };
}

export async function sendHostCommand(command) {
  const state = getHostStateBridge();
  if (!state) return { ok: false, error: '通信宿主还没准备好' };
  try {
    const response = await state.command(command);
    return response && typeof response === 'object' ? response : { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : '通信宿主没有响应' };
  }
}

export async function chooseHostRole(role) {
  const response = await sendHostCommand({ kind: 'chooseRole', role });
  if (response.ok === false) throw new Error(response.error || '身份没存上，再试一次');
  const user = response.user ?? (await readHostAccount().catch(() => null))?.user ?? null;
  if (!user?.role) throw new Error('身份没存上，再试一次');
  return user;
}

export async function logoutHost() {
  const response = await sendHostCommand({ kind: 'logout' });
  if (response.ok === false) throw new Error(response.error || '通信宿主退出失败');
}
