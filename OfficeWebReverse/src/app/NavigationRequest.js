function createNavigationWorker() {
  return new Worker(new URL('../workers/navigation.worker.js', import.meta.url), { type: 'module' });
}

export class NavigationRequest {
  worker = null;
  timer;

  constructor(createWorker = createNavigationWorker, timeoutMs = 1500) {
    this.createWorker = createWorker;
    this.timeoutMs = timeoutMs;
  }

  get pending() {
    return this.worker !== null;
  }

  cancel() {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.worker?.terminate();
    this.worker = null;
  }

  start(request, onResult) {
    this.cancel();
    let worker;
    try {
      worker = this.createWorker();
    } catch {
      onResult(null);
      return;
    }
    this.worker = worker;
    const finish = result => {
      if (this.worker !== worker) return;
      this.cancel();
      onResult(result);
    };
    worker.onmessage = ({ data }) => finish(data);
    worker.onerror = worker.onmessageerror = () => finish(null);
    this.timer = setTimeout(() => finish(null), this.timeoutMs);
    try {
      worker.postMessage(request);
    } catch {
      finish(null);
    }
  }
}
