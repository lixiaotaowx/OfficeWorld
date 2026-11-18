class dp extends $o {
    constructor() {
        super(new Kt(50, 1, .5, 500)), this.isSpotLightShadow = !0, this.focus = 1, this.aspect = 1
    }
    updateMatrices(e) {
        const t = this.camera,
            n = Gi * 2 * e.angle * this.focus,
            i = this.mapSize.width / this.mapSize.height * this.aspect,
            r = e.distance || t.far;
        (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e)
    }
    copy(e) {
        return super.copy(e), this.focus = e.focus, this.aspect = e.aspect, this
    }
    toJSON() {
        const e = super.toJSON();
        return e.focus = this.focus, e.aspect = this.aspect, e
    }
}
