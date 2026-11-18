class Vi extends vt {
    constructor(e, t, n = Sn, i, r, a, o = Rt, l = Rt, c, h = Qn, u = 1) {
        if (h !== Qn && h !== Kn) throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
        const d = {
            width: e,
            height: t,
            depth: u
        };
        super(d, i, r, a, o, l, h, n, c), this.isDepthTexture = !0, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null
    }
    copy(e) {
        return super.copy(e), this.source = new zo(Object.assign({}, e.image)), this.compareFunction = e.compareFunction, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.compareFunction = this.compareFunction, t
    }
}
