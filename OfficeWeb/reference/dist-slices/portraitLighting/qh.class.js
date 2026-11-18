class Qh extends gt {
    constructor() {
        super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new We, this.projectionMatrix = new We, this.projectionMatrixInverse = new We, this.coordinateSystem = cn, this._reversedDepth = !1
    }
    get reversedDepth() {
        return this._reversedDepth
    }
    copy(e, t) {
        return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this
    }
    getWorldDirection(e) {
        return super.getWorldDirection(e).negate()
    }
    updateMatrixWorld(e) {
        super.updateMatrixWorld(e), this.matrixWorld.decompose(hr, ur, pn), pn.x === 1 && pn.y === 1 && pn.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(hr, ur, pn.set(1, 1, 1)).invert()
    }
    updateWorldMatrix(e, t, n = !1) {
        super.updateWorldMatrix(e, t, n), this.matrixWorld.decompose(hr, ur, pn), pn.x === 1 && pn.y === 1 && pn.z === 1 ? this.matrixWorldInverse.copy(this.matrixWorld).invert() : this.matrixWorldInverse.compose(hr, ur, pn.set(1, 1, 1)).invert()
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
