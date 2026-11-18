class un {
    constructor(e = new N(1 / 0, 1 / 0, 1 / 0), t = new N(-1 / 0, -1 / 0, -1 / 0)) {
        this.isBox3 = !0, this.min = e, this.max = t
    }
    set(e, t) {
        return this.min.copy(e), this.max.copy(t), this
    }
    setFromArray(e) {
        this.makeEmpty();
        for (let t = 0, n = e.length; t < n; t += 3) this.expandByPoint(rn.fromArray(e, t));
        return this
    }
    setFromBufferAttribute(e) {
        this.makeEmpty();
        for (let t = 0, n = e.count; t < n; t++) this.expandByPoint(rn.fromBufferAttribute(e, t));
        return this
    }
    setFromPoints(e) {
        this.makeEmpty();
        for (let t = 0, n = e.length; t < n; t++) this.expandByPoint(e[t]);
        return this
    }
    setFromCenterAndSize(e, t) {
        const n = rn.copy(t).multiplyScalar(.5);
        return this.min.copy(e).sub(n), this.max.copy(e).add(n), this
    }
    setFromObject(e, t = !1) {
        return this.makeEmpty(), this.expandByObject(e, t)
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.min.copy(e.min), this.max.copy(e.max), this
    }
    makeEmpty() {
        return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this
    }
    isEmpty() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z
    }
    getCenter(e) {
        return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(.5)
    }
    getSize(e) {
        return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min)
    }
    expandByPoint(e) {
        return this.min.min(e), this.max.max(e), this
    }
    expandByVector(e) {
        return this.min.sub(e), this.max.add(e), this
    }
    expandByScalar(e) {
        return this.min.addScalar(-e), this.max.addScalar(e), this
    }
    expandByObject(e, t = !1) {
        e.updateWorldMatrix(!1, !1);
        const n = e.geometry;
        if (n !== void 0) {
            const r = n.getAttribute("position");
            if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0 && e.isBatchedMesh !== !0)
                for (let a = 0, o = r.count; a < o; a++) e.isMesh === !0 ? e.getVertexPosition(a, rn) : rn.fromBufferAttribute(r, a), rn.applyMatrix4(e.matrixWorld), this.expandByPoint(rn);
            else e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Gs.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Gs.copy(n.boundingBox)), Gs.applyMatrix4(e.matrixWorld), this.union(Gs)
        }
        const i = e.children;
        for (let r = 0, a = i.length; r < a; r++) this.expandByObject(i[r], t);
        return this
    }
    containsPoint(e) {
        return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z
    }
    containsBox(e) {
        return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z
    }
    getParameter(e, t) {
        return t.set((e.x - this.min.x) / (this.max.x - this.min.x), (e.y - this.min.y) / (this.max.y - this.min.y), (e.z - this.min.z) / (this.max.z - this.min.z))
    }
    intersectsBox(e) {
        return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z
    }
    intersectsSphere(e) {
        return this.clampPoint(e.center, rn), rn.distanceToSquared(e.center) <= e.radius * e.radius
    }
    intersectsPlane(e) {
        let t, n;
        return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant
    }
    intersectsTriangle(e) {
        if (this.isEmpty()) return !1;
        this.getCenter(ji), Vs.subVectors(this.max, ji), Si.subVectors(e.a, ji), yi.subVectors(e.b, ji), Ti.subVectors(e.c, ji), Hn.subVectors(yi, Si), Gn.subVectors(Ti, yi), ii.subVectors(Si, Ti);
        let t = [0, -Hn.z, Hn.y, 0, -Gn.z, Gn.y, 0, -ii.z, ii.y, Hn.z, 0, -Hn.x, Gn.z, 0, -Gn.x, ii.z, 0, -ii.x, -Hn.y, Hn.x, 0, -Gn.y, Gn.x, 0, -ii.y, ii.x, 0];
        return !oa(t, Si, yi, Ti, Vs) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !oa(t, Si, yi, Ti, Vs)) ? !1 : (Ws.crossVectors(Hn, Gn), t = [Ws.x, Ws.y, Ws.z], oa(t, Si, yi, Ti, Vs))
    }
    clampPoint(e, t) {
        return t.copy(e).clamp(this.min, this.max)
    }
    distanceToPoint(e) {
        return this.clampPoint(e, rn).distanceTo(e)
    }
    getBoundingSphere(e) {
        return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(rn).length() * .5), e
    }
    intersect(e) {
        return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this
    }
    union(e) {
        return this.min.min(e.min), this.max.max(e.max), this
    }
    applyMatrix4(e) {
        return this.isEmpty() ? this : (Ln[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Ln[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Ln[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Ln[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Ln[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Ln[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Ln[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Ln[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Ln), this)
    }
    translate(e) {
        return this.min.add(e), this.max.add(e), this
    }
    equals(e) {
        return e.min.equals(this.min) && e.max.equals(this.max)
    }
    toJSON() {
        return {
            min: this.min.toArray(),
            max: this.max.toArray()
        }
    }
    fromJSON(e) {
        return this.min.fromArray(e.min), this.max.fromArray(e.max), this
    }
}
