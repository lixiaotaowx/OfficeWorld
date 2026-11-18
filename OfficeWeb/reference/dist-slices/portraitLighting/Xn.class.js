class Xn {
    constructor(e = new N(1, 0, 0), t = 0) {
        this.isPlane = !0, this.normal = e, this.constant = t
    }
    set(e, t) {
        return this.normal.copy(e), this.constant = t, this
    }
    setComponents(e, t, n, i) {
        return this.normal.set(e, t, n), this.constant = i, this
    }
    setFromNormalAndCoplanarPoint(e, t) {
        return this.normal.copy(e), this.constant = -t.dot(this.normal), this
    }
    setFromCoplanarPoints(e, t, n) {
        const i = ha.subVectors(n, t).cross(Zd.subVectors(e, t)).normalize();
        return this.setFromNormalAndCoplanarPoint(i, e), this
    }
    copy(e) {
        return this.normal.copy(e.normal), this.constant = e.constant, this
    }
    normalize() {
        const e = 1 / this.normal.length();
        return this.normal.multiplyScalar(e), this.constant *= e, this
    }
    negate() {
        return this.constant *= -1, this.normal.negate(), this
    }
    distanceToPoint(e) {
        return this.normal.dot(e) + this.constant
    }
    distanceToSphere(e) {
        return this.distanceToPoint(e.center) - e.radius
    }
    projectPoint(e, t) {
        return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e))
    }
    intersectLine(e, t, n = !0) {
        const i = e.delta(ha),
            r = this.normal.dot(i);
        if (r === 0) return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
        const a = -(e.start.dot(this.normal) + this.constant) / r;
        return n === !0 && (a < 0 || a > 1) ? null : t.copy(e.start).addScaledVector(i, a)
    }
    intersectsLine(e) {
        const t = this.distanceToPoint(e.start),
            n = this.distanceToPoint(e.end);
        return t < 0 && n > 0 || n < 0 && t > 0
    }
    intersectsBox(e) {
        return e.intersectsPlane(this)
    }
    intersectsSphere(e) {
        return e.intersectsPlane(this)
    }
    coplanarPoint(e) {
        return e.copy(this.normal).multiplyScalar(-this.constant)
    }
    applyMatrix4(e, t) {
        const n = t || $d.getNormalMatrix(e),
            i = this.coplanarPoint(ha).applyMatrix4(e),
            r = this.normal.applyMatrix3(n).normalize();
        return this.constant = -i.dot(r), this
    }
    translate(e) {
        return this.constant -= e.dot(this.normal), this
    }
    equals(e) {
        return e.normal.equals(this.normal) && e.constant === this.constant
    }
    clone() {
        return new this.constructor().copy(this)
    }
    toJSON() {
        return {
            normal: this.normal.toArray(),
            constant: this.constant
        }
    }
    fromJSON(e) {
        return this.normal.fromArray(e.normal), this.constant = e.constant, this
    }
}
let Qd = 0;
