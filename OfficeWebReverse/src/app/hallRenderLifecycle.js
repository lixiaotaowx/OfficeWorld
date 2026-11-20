const GPU_RELEASE_DELAY_MS = 2_000;
export const ACTIVE_FRAME_INTERVAL_MS = 31;
export const IDLE_AFTER_MS = 10_000;

export function observeHallVisibility(document, window, onChange) {
  const desktop = window.officeDesktop;
  let desktopVisible;
  let visibilityVersion = 0;
  let disposed = false;
  const publish = () => onChange(desktopVisible ?? !document.hidden);
  const unsubscribe = desktop?.onMainWindowVisibility?.(visible => {
    if (typeof visible !== 'boolean' || disposed) return;
    visibilityVersion++;
    desktopVisible = visible;
    publish();
  });
  const requestedVersion = visibilityVersion;
  desktop?.mainWindowVisible?.().then(visible => {
    if (disposed || visibilityVersion !== requestedVersion || typeof visible !== 'boolean') return;
    desktopVisible = visible;
    publish();
  }).catch(() => {});
  document.addEventListener('visibilitychange', publish);
  window.addEventListener('pageshow', publish);
  window.addEventListener('focus', publish);
  publish();
  return () => {
    disposed = true;
    unsubscribe?.();
    document.removeEventListener('visibilitychange', publish);
    window.removeEventListener('pageshow', publish);
    window.removeEventListener('focus', publish);
  };
}

export function bindHallVisibility(lifecycle, document, window) {
  return observeHallVisibility(document, window, visible => lifecycle.setActive(visible));
}

export class HallRenderLifecycle {
  active = true;
  released = false;
  timer;

  constructor(stop, start, release, restore, delay = GPU_RELEASE_DELAY_MS) {
    Object.assign(this, { stop, start, release, restore, delay });
  }

  setActive(active) {
    if (active === this.active) return;
    this.active = active;
    clearTimeout(this.timer);
    if (active) {
      if (this.released) this.restore();
      else this.start();
      return;
    }
    this.stop();
    this.timer = setTimeout(() => {
      this.released = true;
      this.release();
    }, this.delay);
  }

  restored() {
    this.released = false;
    if (this.active) this.start();
  }

  dispose() {
    clearTimeout(this.timer);
    this.stop();
  }
}

export function getHallFrameInterval(now, lastInteraction, immediate, moving, videoPlaying) {
  if (immediate) return 0;
  const idleMs = now - lastInteraction;
  if (idleMs < IDLE_AFTER_MS || moving || videoPlaying) return ACTIVE_FRAME_INTERVAL_MS;
  return idleMs >= 30_000 ? 200 : 100;
}

export function shouldRefreshHallShadows(now, lastShadow, idle, moving, dirty) {
  return dirty || (moving && !idle) || now - lastShadow >= (moving ? 100 : 2_000);
}
