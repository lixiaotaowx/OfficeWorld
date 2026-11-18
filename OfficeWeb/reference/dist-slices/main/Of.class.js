class Of {
    get visible() {
        return this.isPiP || this.isIntersecting
    }
    get pictureInPicture() {
        return this.isPiP
    }
    constructor(e, t) {
        this.onVisibilityChanged = n => {
            var s;
            const {
                target: r,
                isIntersecting: a
            } = n;
            r === this.element && (this.isIntersecting = a, this.isPiP = ni(this.element), this.visibilityChangedAt = Date.now(), (s = this.handleVisibilityChanged) === null || s === void 0 || s.call(this))
        }, this.onEnterPiP = () => {
            var n, s, r;
            (s = (n = window.documentPictureInPicture) === null || n === void 0 ? void 0 : n.window) === null || s === void 0 || s.addEventListener("pagehide", this.onLeavePiP), this.isPiP = ni(this.element), (r = this.handleVisibilityChanged) === null || r === void 0 || r.call(this)
        }, this.onLeavePiP = () => {
            var n;
            this.isPiP = ni(this.element), (n = this.handleVisibilityChanged) === null || n === void 0 || n.call(this)
        }, this.element = e, this.isIntersecting = t ?? fs(e), this.isPiP = Me() && ni(e), this.visibilityChangedAt = 0
    }
    width() {
        return this.element.clientWidth
    }
    height() {
        return this.element.clientHeight
    }
    observe() {
        var e, t, n;
        this.isIntersecting = fs(this.element), this.isPiP = ni(this.element), this.element.handleResize = () => {
            var s;
            (s = this.handleResize) === null || s === void 0 || s.call(this)
        }, this.element.handleVisibilityChanged = this.onVisibilityChanged, Zr().observe(this.element), Xr().observe(this.element), this.element.addEventListener("enterpictureinpicture", this.onEnterPiP), this.element.addEventListener("leavepictureinpicture", this.onLeavePiP), (e = window.documentPictureInPicture) === null || e === void 0 || e.addEventListener("enter", this.onEnterPiP), (n = (t = window.documentPictureInPicture) === null || t === void 0 ? void 0 : t.window) === null || n === void 0 || n.addEventListener("pagehide", this.onLeavePiP)
    }
    stopObserving() {
        var e, t, n, s, r;
        (e = Zr()) === null || e === void 0 || e.unobserve(this.element), (t = Xr()) === null || t === void 0 || t.unobserve(this.element), this.element.removeEventListener("enterpictureinpicture", this.onEnterPiP), this.element.removeEventListener("leavepictureinpicture", this.onLeavePiP), (n = window.documentPictureInPicture) === null || n === void 0 || n.removeEventListener("enter", this.onEnterPiP), (r = (s = window.documentPictureInPicture) === null || s === void 0 ? void 0 : s.window) === null || r === void 0 || r.removeEventListener("pagehide", this.onLeavePiP)
    }
}

