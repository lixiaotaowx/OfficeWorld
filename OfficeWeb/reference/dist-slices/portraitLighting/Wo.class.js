class Wo {
    constructor() {
        this.coordinateSystem = cn, this._frustums = [], this._count = 0
    }
    setFromArrayCamera(e) {
        const t = e.cameras,
            n = this._frustums;
        for (let i = 0; i < t.length; i++) {
            const r = t[i];
            Jl.multiplyMatrices(r.projectionMatrix, r.matrixWorldInverse), n[i] === void 0 && (n[i] = new As), n[i].setFromProjectionMatrix(Jl, r.coordinateSystem, r.reversedDepth)
        }
        return this._count = t.length, this
    }
    getFrustum(e) {
        return this._frustums[e]
    }
    intersectsObject(e) {
        const t = this._frustums;
        for (let n = 0; n < this._count; n++)
            if (t[n].intersectsObject(e)) return !0;
        return !1
    }
    intersectsSprite(e) {
        const t = this._frustums;
        for (let n = 0; n < this._count; n++)
            if (t[n].intersectsSprite(e)) return !0;
        return !1
    }
    intersectsSphere(e) {
        const t = this._frustums;
        for (let n = 0; n < this._count; n++)
            if (t[n].intersectsSphere(e)) return !0;
        return !1
    }
    intersectsBox(e) {
        const t = this._frustums;
        for (let n = 0; n < this._count; n++)
            if (t[n].intersectsBox(e)) return !0;
        return !1
    }
    containsPoint(e) {
        const t = this._frustums;
        for (let n = 0; n < this._count; n++)
            if (t[n].containsPoint(e)) return !0;
        return !1
    }
    copy(e) {
        this.coordinateSystem = e.coordinateSystem;
        const t = this._frustums,
            n = e._frustums;
        for (let i = 0; i < e._count; i++) t[i] === void 0 && (t[i] = new As), t[i].copy(n[i]);
        return this._count = e._count, this
    }
    clone() {
        return new Wo().copy(this)
    }
}
