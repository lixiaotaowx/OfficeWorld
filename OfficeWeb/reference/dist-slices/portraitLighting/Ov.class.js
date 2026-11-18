class Ov {
    constructor() {
        this._previousTime = 0, this._currentTime = 0, this._startTime = performance.now(), this._delta = 0, this._elapsed = 0, this._timescale = 1, this._document = null, this._pageVisibilityHandler = null
    }
    connect(e) {
        this._document = e, e.hidden !== void 0 && (this._pageVisibilityHandler = xp.bind(this), e.addEventListener("visibilitychange", this._pageVisibilityHandler, !1))
    }
    disconnect() {
        this._pageVisibilityHandler !== null && (this._document.removeEventListener("visibilitychange", this._pageVisibilityHandler), this._pageVisibilityHandler = null), this._document = null
    }
    getDelta() {
        return this._delta / 1e3
    }
    getElapsed() {
        return this._elapsed / 1e3
    }
    getTimescale() {
        return this._timescale
    }
    setTimescale(e) {
        return this._timescale = e, this
    }
    reset() {
        return this._currentTime = performance.now() - this._startTime, this
    }
    dispose() {
        this.disconnect()
    }
    update(e) {
        return this._pageVisibilityHandler !== null && this._document.hidden === !0 ? this._delta = 0 : (this._previousTime = this._currentTime, this._currentTime = (e !== void 0 ? e : performance.now()) - this._startTime, this._delta = (this._currentTime - this._previousTime) * this._timescale, this._elapsed += this._delta), this
    }
}

