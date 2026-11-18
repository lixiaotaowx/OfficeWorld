class Ir {
    constructor(e = () => new Worker(new URL("/assets/navigation.worker-BmPQSAaH.js", import.meta.url), {
        type: "module"
    }), t = 1500) {
        m(this, "worker", null);
        m(this, "timer");
        this.createWorker = e, this.timeoutMs = t
    }
    get pending() {
        return this.worker !== null
    }
    cancel() {
        var e;
        this.timer !== void 0 && clearTimeout(this.timer), this.timer = void 0, (e = this.worker) == null || e.terminate(), this.worker = null
    }
    start(e, t) {
        this.cancel();
        let s;
        try {
            s = this.createWorker()
        } catch {
            t(null);
            return
        }
        this.worker = s;
        const i = n => {
            this.worker === s && (this.cancel(), t(n))
        };
        s.onmessage = n => i(n.data), s.onerror = () => i(null), s.onmessageerror = () => i(null), this.timer = setTimeout(() => i(null), this.timeoutMs);
        try {
            s.postMessage(e)
        } catch {
            i(null)
        }
    }
}
