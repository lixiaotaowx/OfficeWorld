class Ah extends At {
    constructor(e, t) {
        super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = yl, this.bindMatrix = new We, this.bindMatrixInverse = new We, this.boundingBox = null, this.boundingSphere = null
    }
    computeBoundingBox() {
        const e = this.geometry;
        this.boundingBox === null && (this.boundingBox = new un), this.boundingBox.makeEmpty();
        const t = e.getAttribute("position");
        for (let n = 0; n < t.count; n++) this.getVertexPosition(n, tr), this.boundingBox.expandByPoint(tr)
    }
    computeBoundingSphere() {
        const e = this.geometry;
        this.boundingSphere === null && (this.boundingSphere = new En), this.boundingSphere.makeEmpty();
        const t = e.getAttribute("position");
        for (let n = 0; n < t.count; n++) this.getVertexPosition(n, tr), this.boundingSphere.expandByPoint(tr)
    }
    copy(e, t) {
        return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, this.boundingBox = e.boundingBox !== null ? e.boundingBox.clone() : null, this.boundingSphere = e.boundingSphere !== null ? e.boundingSphere.clone() : null, this
    }
    raycast(e, t) {
        const n = this.material,
            i = this.matrixWorld;
        n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), fa.copy(this.boundingSphere), fa.applyMatrix4(i), e.ray.intersectsSphere(fa) !== !1 && (Xl.copy(i).invert(), pa.copy(e.ray).applyMatrix4(Xl), !(this.boundingBox !== null && pa.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, pa)))
    }
    getVertexPosition(e, t) {
        return super.getVertexPosition(e, t), this.applyBoneTransform(e, t), t
    }
    bind(e, t) {
        this.skeleton = e, t === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.copy(t).invert()
    }
    pose() {
        this.skeleton.pose()
    }
    normalizeSkinWeights() {
        const e = new ht,
            t = this.geometry.attributes.skinWeight;
        for (let n = 0, i = t.count; n < i; n++) {
            e.fromBufferAttribute(t, n);
            const r = 1 / e.manhattanLength();
            r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w)
        }
    }
    updateMatrixWorld(e) {
        super.updateMatrixWorld(e), this.bindMode === yl ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === Ju ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : Ce("SkinnedMesh: Unrecognized bindMode: " + this.bindMode)
    }
    applyBoneTransform(e, t) {
        const n = this.skeleton,
            i = this.geometry;
        Gl.fromBufferAttribute(i.attributes.skinIndex, e), Vl.fromBufferAttribute(i.attributes.skinWeight, e), t.isVector4 ? (ns.copy(t), t.set(0, 0, 0, 0)) : (ns.set(t.x, t.y, t.z, 1), t.set(0, 0, 0)), ns.applyMatrix4(this.bindMatrix);
        for (let r = 0; r < 4; r++) {
            const a = Vl.getComponent(r);
            if (a !== 0) {
                const o = Gl.getComponent(r);
                Wl.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(ef.copy(ns).applyMatrix4(Wl), a)
            }
        }
        return t.isVector4 && (t.w = ns.w), t.applyMatrix4(this.bindMatrixInverse)
    }
}
