class Ud extends vt {
    constructor(e = null, t = 1, n = 1, i = 1) {
        super(null), this.isData3DTexture = !0, this.image = {
            data: e,
            width: t,
            height: n,
            depth: i
        }, this.magFilter = Rt, this.minFilter = Rt, this.wrapR = on, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1
    }
    copy(e) {
        return super.copy(e), this.wrapR = e.wrapR, this
    }
}
