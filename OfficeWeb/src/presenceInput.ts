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

/** Ten seconds without touching mouse or keyboard counts as leaving the desk. */
export const AWAY_AFTER_MS = 10_000;
/** How often the idle deadline is checked: one timer, not one per event. */
export const TICK_MS = 1_000;
/**
 * How often the desktop app is asked how long Windows itself has been idle. It is
 * shorter than the away threshold, or the green/red switch would lag behind it.
 */
export const IDLE_POLL_MS = 2_000;

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
  /**
   * System-wide idle time from the desktop app (seconds + 'active' | 'idle' |
   * 'locked'). A browser cannot see this, and that is the whole point: somebody
   * typing in Word is still sitting at their desk (user, 2026-09-15).
   */
  desktopIdle?: () => Promise<{ seconds?: number; state?: string } | null>;
  setInterval?: (handler: () => void, milliseconds: number) => unknown;
  clearInterval?: (handle: unknown) => void;
}

/** The desktop bridge, when this page is running inside the EXE. */
function bridgeIdle(): InputPresenceOptions["desktopIdle"] {
  const bridge = typeof window === "undefined" ? undefined : window.officeDesktop;
  return typeof bridge?.systemIdle === "function" ? () => bridge.systemIdle!() : undefined;
}

/**
 * What the footer says about how 在座 / 离桌 is decided. A browser can only see input
 * sent to this window, so somebody working in Word is marked 离桌 there; the desktop app
 * asks Windows instead. Showing which one is in force turns "离座检测不管用" into
 * something the user can check at a glance (user, 2026-09-15).
 */
export function deskSensorLabel(usesSystemIdle: boolean): string {
  return usesSystemIdle ? '离座检测：系统空闲（客户端）' : '离座检测：仅本窗口输入（浏览器）';
}

export interface InputPresence {
  /** True while the last input is recent enough to count as sitting there. */
  isAtDesk(): boolean;
  /** True when Windows itself is answering, rather than this window's own input. */
  usesSystemIdle(): boolean;
  /** Record input now; the DOM listeners call this, tests call it directly. */
  touch(): void;
  /** Re-check the idle deadline; the timer calls this every TICK_MS. */
  tick(): void;
  /** Ask the desktop app for the system-wide idle time; runs every IDLE_POLL_MS. */
  poll(): void;
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
  let busy = false;
  let stopped = false;
  const activeSeconds = new Set<number>();
  let busyUntil = 0;
  const recordActivity = () => {
    const second = Math.floor(now() / 1000);
    activeSeconds.add(second);
    for (const value of activeSeconds) if (value <= second - 10) activeSeconds.delete(value);
    // Count occupied seconds, never raw pointer events or key contents.
    if (activeSeconds.size >= 6) busyUntil = now() + 8_000;
  };
  const report = () => {
    // Before `join` there is nobody to tell; the server ignores it anyway.
    // `idleMs` is how long the mouse and keyboard have already been quiet, so the
    // 离座 clock starts at the moment input stopped rather than at the moment the
    // threshold was crossed (user, 2026-09-15: "不操作10秒就算是离座").
    if (socket.connected) {
      socket.emit("input-state", { atDesk, busy, idleMs: Math.max(0, now() - lastInputAt) });
    }
  };
  const apply = (next: boolean) => {
    const nextBusy = next && now() < busyUntil;
    if (next === atDesk && nextBusy === busy) return;
    atDesk = next;
    busy = nextBusy;
    report();
  };
  const touch = () => {
    recordActivity();
    lastInputAt = now();
    apply(true);
  };
  const tick = () => apply(now() - lastInputAt < awayAfterMs);
  // In the desktop app the OS answers for us, and it sees every program: idle
  // seconds below the threshold mean somebody is at the machine (in Word, on
  // another screen, on a call), so the dot goes green even though this page saw
  // no input at all. A locked screen is away immediately.
  const idleSource = options.desktopIdle ?? bridgeIdle();
  const poll = () => {
    if (!idleSource) return;
    Promise.resolve()
      .then(idleSource)
      .then((idle) => {
        if (stopped || !idle) return;
        const seconds = Number(idle.seconds);
        // Windows says how long the whole machine has been quiet: trust it as the
        // start of the 离座 clock, so the number shown is the real idle time.
        const awayFor = (milliseconds: number) => {
          lastInputAt = now() - Math.max(milliseconds, awayAfterMs);
          apply(false);
        };
        if (idle.state === "locked") return awayFor(Number.isFinite(seconds) ? seconds * 1000 : 0);
        if (!Number.isFinite(seconds)) return;
        if (seconds * 1000 < awayAfterMs) {
          // Two-second OS samples imply sustained activity, not a keylogger.
          if (seconds < 2) {
            recordActivity();
            activeSeconds.add(Math.floor(now() / 1000) - 1);
          }
          lastInputAt = now() - seconds * 1000;
          apply(true);
        }
        else awayFor(seconds * 1000);
      })
      .catch(() => { /* a failed poll must never break the local watch */ });
  };
  for (const type of INPUT_EVENTS) {
    // Capture phase, so a handler that stops propagation cannot hide the input.
    target?.addEventListener(type, touch, { passive: true, capture: true });
  }
  const onConnect = () => report();
  socket.on("connect", onConnect);
  const timer = start(tick, TICK_MS);
  const idleTimer = idleSource ? start(poll, IDLE_POLL_MS) : undefined;
  return {
    isAtDesk: () => atDesk,
    usesSystemIdle: () => idleSource !== undefined,
    touch,
    tick,
    poll,
    stop() {
      stopped = true;
      cancel(timer);
      if (idleTimer !== undefined) cancel(idleTimer);
      socket.off("connect", onConnect);
      for (const type of INPUT_EVENTS) {
        target?.removeEventListener(type, touch, { capture: true });
      }
    },
  };
}
