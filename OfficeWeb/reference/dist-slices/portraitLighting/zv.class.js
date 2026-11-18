class zv {
    constructor(e = !0) {
        this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1, Ce("Clock: This module has been deprecated. Please use THREE.Timer instead.")
    }
    start() {
        this.startTime = performance.now(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0
    }
    stop() {
        this.getElapsedTime(), this.running = !1, this.autoStart = !1
    }
    getElapsedTime() {
        return this.getDelta(), this.elapsedTime
    }
    getDelta() {
        let e = 0;
        if (this.autoStart && !this.running) return this.start(), 0;
        if (this.running) {
            const t = performance.now();
            e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e
        }
        return e
    }
}
