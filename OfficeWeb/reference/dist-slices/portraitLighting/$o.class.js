class $o {
    constructor(e) {
        this.camera = e, this.intensity = 1, this.bias = 0, this.biasNode = null, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new re(512, 512), this.mapType = Jt, this.map = null, this.mapPass = null, this.matrix = new We, this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new As, this._frameExtents = new re(1, 1), this._viewportCount = 1, this._viewports = [new ht(0, 0, 1, 1)]
    }
    getViewportCount() {
        return this._viewportCount
    }
    getCamera() {
        return this.camera
    }
    getFrustum() {
        return this._frustum
    }
    updateMatrices(e) {
        const t = this.camera;
        pc.setFromMatrixPosition(e.matrixWorld), t.position.copy(pc), mc.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(mc), t.updateMatrixWorld(), this._updateMatrix(t, this.matrix, this._frustum)
    }
    _updateMatrix(e, t, n, i) {
        va.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), n.setFromProjectionMatrix(va, e.coordinateSystem, e.reversedDepth);
        const r = this._frameExtents,
            a = i ? i.z / r.x : 1,
            o = i ? i.w / r.y : 1,
            l = i ? i.x / r.x : 0,
            c = i ? i.y / r.y : 0;
        e.coordinateSystem === Es || e.reversedDepth ? t.set(.5 * a, 0, 0, .5 * a + l, 0, .5 * o, 0, .5 * o + c, 0, 0, 1, 0, 0, 0, 0, 1) : t.set(.5 * a, 0, 0, .5 * a + l, 0, .5 * o, 0, .5 * o + c, 0, 0, .5, .5, 0, 0, 0, 1), t.multiply(va)
    }
    getViewport(e) {
        return this._viewports[e]
    }
    getFrameExtents() {
        return this._frameExtents
    }
    dispose() {
        this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose()
    }
    copy(e) {
        return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.autoUpdate = e.autoUpdate, this.needsUpdate = e.needsUpdate, this.normalBias = e.normalBias, this.blurSamples = e.blurSamples, this.mapSize.copy(e.mapSize), this.mapType = e.mapType, this.biasNode = e.biasNode, this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        const e = {};
        return e.intensity = this.intensity, e.bias = this.bias, e.normalBias = this.normalBias, e.radius = this.radius, e.blurSamples = this.blurSamples, e.mapSize = this.mapSize.toArray(), e.mapType = this.mapType, e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e
    }
}
