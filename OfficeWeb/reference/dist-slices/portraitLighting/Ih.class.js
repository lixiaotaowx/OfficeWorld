class Ih extends Vi {
    constructor(e, t = Sn, n = hi, i, r, a = Rt, o = Rt, l, c = Qn) {
        const h = {
                width: e,
                height: e,
                depth: 1
            },
            u = [h, h, h, h, h, h];
        super(e, e, t, n, i, r, a, o, l, c), this.image = u, this.isCubeDepthTexture = !0, this.isCubeTexture = !0
    }
    get images() {
        return this.image
    }
    set images(e) {
        this.image = e
    }
}
