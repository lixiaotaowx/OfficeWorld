class Gt {
    constructor() {
        this.failedConnectionAttempts = new Map, this.backOffPromises = new Map
    }
    static getInstance() {
        return this._instance || (this._instance = new Gt), this._instance
    }
    addFailedConnectionAttempt(e) {
        var t;
        const n = new URL(e),
            s = Sn(n);
        if (!s) return;
        let r = (t = this.failedConnectionAttempts.get(s)) !== null && t !== void 0 ? t : 0;
        this.failedConnectionAttempts.set(s, r + 1), this.backOffPromises.set(s, Ce(Math.min(Om * Math.pow(2, r), Dm)))
    }
    getBackOffPromise(e) {
        const t = new URL(e),
            n = t && Sn(t);
        return n && this.backOffPromises.get(n) || Promise.resolve()
    }
    resetFailedConnectionAttempts(e) {
        const t = new URL(e),
            n = t && Sn(t);
        n && (this.failedConnectionAttempts.set(n, 0), this.backOffPromises.set(n, Promise.resolve()))
    }
    resetAll() {
        this.backOffPromises.clear(), this.failedConnectionAttempts.clear()
    }
}
Gt._instance = null;
