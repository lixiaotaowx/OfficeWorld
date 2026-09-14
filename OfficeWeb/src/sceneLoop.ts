export interface SceneLoopHost {
  now(): number;
  requestFrame(callback: () => void): number;
  cancelFrame(id: number): void;
  setTimer(callback: () => void, delay: number): number;
  clearTimer(id: number): void;
}

const browserHost: SceneLoopHost = {
  now: () => performance.now(),
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: id => cancelAnimationFrame(id),
  setTimer: (callback, delay) => window.setTimeout(callback, delay),
  clearTimer: id => clearTimeout(id),
};

/** Only the 3D loop; media, capture, sockets and chat never enter this scheduler. */
export class SceneLoop {
  private frame: number | null = null;
  private timer: number | null = null;
  private stopped = false;
  private visible = true;
  private focused = true;
  private paused = false;
  private activeUntil = 0;
  private lastStep: number;
  private lastDraw = -Infinity;
  private frames = 0;
  private steps = 0;

  constructor(
    private update: (dt: number) => void,
    private draw: (dt: number) => void,
    private moving: () => boolean,
    private host: SceneLoopHost = browserHost,
  ) {
    this.lastStep = host.now();
    this.wake();
  }

  get stats() {
    return { mode: this.mode(), renderedFrames: this.frames, simulationSteps: this.steps };
  }

  private mode() {
    if (!this.visible || this.paused) return 'paused';
    if (!this.focused) return 'unfocused';
    return this.host.now() < this.activeUntil || this.moving() ? 'active' : 'idle';
  }

  activity() {
    this.activeUntil = this.host.now() + 2500;
  }

  setVisible(value: boolean) {
    if (this.visible === value) return;
    this.visible = value;
    this.wake();
  }

  setFocused(value: boolean) {
    if (this.focused === value) return;
    this.focused = value;
    if (value) this.activity();
    this.wake();
  }

  setPaused(value: boolean) {
    if (this.paused === value) return;
    this.paused = value;
    this.wake();
  }

  private cancel() {
    if (this.frame !== null) this.host.cancelFrame(this.frame);
    if (this.timer !== null) this.host.clearTimer(this.timer);
    this.frame = this.timer = null;
  }

  private wake() {
    this.cancel();
    // Don't replay elapsed background time as a giant movement or camera jump.
    this.lastStep = this.host.now();
    this.lastDraw = -Infinity;
    this.schedule();
  }

  private schedule() {
    if (this.stopped) return;
    if (this.mode() === 'paused') this.timer = this.host.setTimer(this.tick, 100);
    else this.frame = this.host.requestFrame(this.tick);
  }

  private tick = () => {
    this.frame = this.timer = null;
    if (this.stopped) return;
    const now = this.host.now();
    const mode = this.mode();
    const interval = 1000 / (mode === 'active' ? 60 : 10);
    if (mode !== 'paused' && now - this.lastDraw < interval - 1) {
      this.schedule();
      return;
    }
    const dt = Math.min(Math.max((now - this.lastStep) / 1000, 0), 0.1);
    this.lastStep = now;
    // Continue local walking/arrival and position reports without any GPU draw.
    this.update(dt);
    this.steps++;
    if (mode !== 'paused') {
      this.draw(dt);
      this.frames++;
      this.lastDraw = now;
    }
    this.schedule();
  };

  dispose() {
    this.stopped = true;
    this.cancel();
  }
}

export function observeSceneVisibility(element: HTMLElement, loop: SceneLoop) {
  let intersecting = true;
  const visibility = () => loop.setVisible(!document.hidden && intersecting);
  const focus = () => loop.setFocused(document.hasFocus());
  const activity = () => loop.activity();
  const drag = (event: PointerEvent) => { if (event.buttons) loop.activity(); };
  const observer = new IntersectionObserver(entries => {
    intersecting = entries[0]?.isIntersecting ?? true;
    visibility();
  });
  observer.observe(element);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('focus', focus);
  window.addEventListener('blur', focus);
  element.addEventListener('pointerdown', activity);
  element.addEventListener('pointermove', drag);
  element.addEventListener('wheel', activity, { passive: true });
  element.addEventListener('keydown', activity);
  visibility();
  focus();
  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('focus', focus);
    window.removeEventListener('blur', focus);
    element.removeEventListener('pointerdown', activity);
    element.removeEventListener('pointermove', drag);
    element.removeEventListener('wheel', activity);
    element.removeEventListener('keydown', activity);
  };
}
