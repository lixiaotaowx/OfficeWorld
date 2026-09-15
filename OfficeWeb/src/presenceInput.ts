// Are you actually sitting at this machine?
//
// Mouse and keyboard input is the only honest signal a web page gets - it cannot
// see the chair. After AWAY_AFTER_MS with no pointer move, click, key, wheel or
// touch this client reports 离桌, and the first input after that reports 在座
// again. Only those two transitions travel over the socket (a mouse move is
// never a message), and the server stamps the moment somebody went away, so
// every client shows the same 离座 time.
//
// This runs in the browser and in the desktop app alike, so the feature needs no
// client update (user, 2026-09-15).
import type { Socket } from "socket.io-client";

/** Two minutes without touching mouse or keyboard counts as leaving the desk. */
export const AWAY_AFTER_MS = 120_000;
/** How often the idle deadline is checked: one timer, not one per event. */
export const TICK_MS = 1_000;

/** Anything that proves a human is at the machine. */
const INPUT_EVENTS = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"];

interface EventTargetLike {
  addEventListener(type: string, listener: () => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: string, listener: () => void, options?: EventListenerOptions): void;
}

export interface InputPresenceOptions {
  awayAfterMs?: number;
  now?: () => number;
  /** Injectable for tests; defaults to the page. */
  target?: EventTargetLike;
  setInterval?: (handler: () => void, milliseconds: number) => unknown;
  clearInterval?: (handle: unknown) => void;
}

export interface InputPresence {
  /** True while the last input is recent enough to count as sitting there. */
  isAtDesk(): boolean;
  /** Record input now; the DOM listeners call this, tests call it directly. */
  touch(): void;
  /** Re-check the idle deadline; the timer calls this every TICK_MS. */
  tick(): void;
  stop(): void;
}

/**
 * Watch this machine's input and report desk presence over `socket`. Returns a
 * disposer. Call it from `useOffice` right after the socket is built, so the
 * socket exists and `connect` can re-assert the state after a reconnect.
 */
export function watchInputPresence(
  socket: Pick<Socket, "on" | "off" | "emit" | "connected">,
  options: InputPresenceOptions = {},
): InputPresence {
  const now = options.now ?? (() => Date.now());
  const awayAfterMs = options.awayAfterMs ?? AWAY_AFTER_MS;
  const target = options.target ?? (typeof document === "undefined" ? undefined : document);
  const start = options.setInterval ?? ((handler, ms) => setInterval(handler, ms) as unknown);
  const cancel = options.clearInterval ?? ((handle) => clearInterval(handle as number));
  let lastInputAt = now();
  // The page has just been opened by somebody, so it starts 在座: arriving at
  // your desk should not flash red while you read the screen.
  let atDesk = true;
  const report = () => {
    // Before `join` there is nobody to tell; the server ignores it anyway.
    if (socket.connected) socket.emit("input-state", { atDesk });
  };
  const apply = (next: boolean) => {
    if (next === atDesk) return;
    atDesk = next;
    report();
  };
  const touch = () => {
    lastInputAt = now();
    apply(true);
  };
  const tick = () => apply(now() - lastInputAt < awayAfterMs);
  for (const type of INPUT_EVENTS) {
    // Capture phase, so a handler that stops propagation cannot hide the input.
    target?.addEventListener(type, touch, { passive: true, capture: true });
  }
  const onConnect = () => report();
  socket.on("connect", onConnect);
  const timer = start(tick, TICK_MS);
  return {
    isAtDesk: () => atDesk,
    touch,
    tick,
    stop() {
      cancel(timer);
      socket.off("connect", onConnect);
      for (const type of INPUT_EVENTS) {
        target?.removeEventListener(type, touch, { capture: true });
      }
    },
  };
}
