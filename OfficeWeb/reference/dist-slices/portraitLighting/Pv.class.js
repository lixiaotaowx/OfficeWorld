class Pv extends vt {
    constructor(e, t, n, i, r = Ct, a = Ct, o, l, c) {
        super(e, t, n, i, r, a, o, l, c), this.isVideoTexture = !0, this.generateMipmaps = !1, this._requestVideoFrameCallbackId = 0;
        const h = this;

        function u() {
            h.needsUpdate = !0, h._requestVideoFrameCallbackId = e.requestVideoFrameCallback(u)
        }
        "requestVideoFrameCallback" in e && (this._requestVideoFrameCallbackId = e.requestVideoFrameCallback(u))
    }
    clone() {
        return new this.constructor(this.image).copy(this)
    }
    update() {
        const e = this.image;
        "requestVideoFrameCallback" in e === !1 && e.readyState >= e.HAVE_CURRENT_DATA && (this.needsUpdate = !0)
    }
    dispose() {
        this._requestVideoFrameCallbackId !== 0 && (this.source.data.cancelVideoFrameCallback(this._requestVideoFrameCallbackId), this._requestVideoFrameCallbackId = 0), super.dispose()
    }
}
