import type { DockGreet } from './dockRules';

export const GREETING_CHANNEL = 'office-dock-greeting-v1';
type Greeting = Omit<DockGreet, 'at'>;

/** Same-origin windows share the full payload even when an installed IPC bridge strips it. */
export function sendDockGreeting(payload: Greeting) {
  if (!window.officeDesktop?.dockGreet) return;
  try {
    const channel = new BroadcastChannel(GREETING_CHANNEL);
    channel.postMessage(payload);
    channel.close();
  } catch { /* Older engines can still use the desktop bridge and roster. */ }
  void window.officeDesktop.dockGreet(payload).catch(() => undefined);
}

export function listenDockGreeting(receive: (payload: Greeting) => void) {
  try {
    const channel = new BroadcastChannel(GREETING_CHANNEL);
    channel.onmessage = event => {
      if (typeof event.data?.id === 'string' && event.data.id) receive(event.data);
    };
    return () => channel.close();
  } catch { return () => {}; }
}
