/** How a received screen video looks to the person watching, so the stage can
 *  explain a black pane instead of silently showing one. */

export type ScreenHealth = 'live' | 'starting' | 'paused' | 'ended';

/** How long a stream may show no frame before we say so out loud. */
export const FIRST_FRAME_MS = 4000;

export interface ScreenHealthInput {
  /** The video track reports itself finished; nothing can bring it back. */
  ended?: boolean;
  /** The server stops publishing on pause, and the receiver sees this as muted. */
  muted?: boolean;
  paused?: boolean;
  /** A frame has been decoded at least once (videoWidth > 0). */
  hasFrame?: boolean;
  /** Milliseconds since this stream arrived. */
  waitedMs?: number;
}

/** Judge one sample of the stream. Called every 700 ms by the stage. */
export function screenHealth(input: ScreenHealthInput): ScreenHealth {
  if (input.ended) return 'ended';
  if (input.paused) return 'paused';
  if (input.muted === true) return 'paused';
  if (input.hasFrame) return 'live';
  return (input.waitedMs ?? 0) < FIRST_FRAME_MS ? 'starting' : 'paused';
}

/** Pause clears the published track: the last frame lingers, so never blank the
 *  pane while paused/starting — only a真 disconnect (ended) deserves a clear. */
export function keepsLastFrame(health: ScreenHealth): boolean {
  return health !== 'ended';
}

/** One-line hint for the watcher, or '' when the pane looks normal. */
export function screenHealthHint(health: ScreenHealth): string {
  switch (health) {
    case 'starting': return '画面还在连，等一下…';
    case 'paused': return '对方暂停了共享';
    case 'ended': return '共享已经结束';
    default: return '';
  }
}
