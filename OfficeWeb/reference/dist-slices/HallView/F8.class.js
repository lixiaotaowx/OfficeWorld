class F8 {
    constructor(e, t, s, i, n = L8) {
        m(this, "active", !0);
        m(this, "released", !1);
        m(this, "timer");
        this.stop = e, this.start = t, this.release = s, this.restore = i, this.delay = n
    }
    setActive(e) {
        e !== this.active && (this.active = e, clearTimeout(this.timer), e ? this.released ? this.restore() : this.start() : (this.stop(), this.timer = setTimeout(() => {
            this.released = !0, this.release()
        }, this.delay)))
    }
    restored() {
        this.released = !1, this.active && this.start()
    }
    dispose() {
        clearTimeout(this.timer), this.stop()
    }
}
