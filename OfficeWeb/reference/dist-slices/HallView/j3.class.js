class J3 {
    constructor(e = 4) {
        this.pool = e, this.queue = [], this.workers = [], this.workersResolve = [], this.workerStatus = 0, this.workerCreator = null
    }
    _initWorker(e) {
        if (!this.workers[e]) {
            const t = this.workerCreator();
            t.addEventListener("message", this._onMessage.bind(this, e)), this.workers[e] = t
        }
    }
    _getIdleWorker() {
        for (let e = 0; e < this.pool; e++)
            if (!(this.workerStatus & 1 << e)) return e;
        return -1
    }
    _onMessage(e, t) {
        const s = this.workersResolve[e];
        if (s && s(t), this.queue.length) {
            const {
                resolve: i,
                msg: n,
                transfer: o
            } = this.queue.shift();
            this.workersResolve[e] = i, this.workers[e].postMessage(n, o)
        } else this.workerStatus ^= 1 << e
    }
    setWorkerCreator(e) {
        this.workerCreator = e
    }
    setWorkerLimit(e) {
        this.pool = e
    }
    postMessage(e, t) {
        return new Promise(s => {
            const i = this._getIdleWorker();
            i !== -1 ? (this._initWorker(i), this.workerStatus |= 1 << i, this.workersResolve[i] = s, this.workers[i].postMessage(e, t)) : this.queue.push({
                resolve: s,
                msg: e,
                transfer: t
            })
        })
    }
    dispose() {
        this.workers.forEach(e => e.terminate()), this.workersResolve.length = 0, this.workers.length = 0, this.queue.length = 0, this.workerStatus = 0
    }
}
