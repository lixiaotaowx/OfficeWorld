class an {
    constructor(e = new N, t = new N, n = new N) {
        this.a = e, this.b = t, this.c = n
    }
    static getNormal(e, t, n, i) {
        i.subVectors(n, t), sn.subVectors(e, t), i.cross(sn);
        const r = i.lengthSq();
        return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0)
    }
    static getBarycoord(e, t, n, i, r) {
        sn.subVectors(i, t), Rn.subVectors(n, t), ea.subVectors(e, t);
        const a = sn.dot(sn),
            o = sn.dot(Rn),
            l = sn.dot(ea),
            c = Rn.dot(Rn),
            h = Rn.dot(ea),
            u = a * c - o * o;
        if (u === 0) return r.set(0, 0, 0), null;
        const d = 1 / u,
            f = (c * l - o * h) * d,
            p = (a * h - o * l) * d;
        return r.set(1 - f - p, p, f)
    }
    static containsPoint(e, t, n, i) {
        return this.getBarycoord(e, t, n, i, Cn) === null ? !1 : Cn.x >= 0 && Cn.y >= 0 && Cn.x + Cn.y <= 1
    }
    static getInterpolation(e, t, n, i, r, a, o, l) {
        return this.getBarycoord(e, t, n, i, Cn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, Cn.x), l.addScaledVector(a, Cn.y), l.addScaledVector(o, Cn.z), l)
    }
    static getInterpolatedAttribute(e, t, n, i, r, a) {
        return sa.setScalar(0), ra.setScalar(0), aa.setScalar(0), sa.fromBufferAttribute(e, t), ra.fromBufferAttribute(e, n), aa.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(sa, r.x), a.addScaledVector(ra, r.y), a.addScaledVector(aa, r.z), a
    }
    static isFrontFacing(e, t, n, i) {
        return sn.subVectors(n, t), Rn.subVectors(e, t), sn.cross(Rn).dot(i) < 0
    }
    set(e, t, n) {
        return this.a.copy(e), this.b.copy(t), this.c.copy(n), this
    }
    setFromPointsAndIndices(e, t, n, i) {
        return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[i]), this
    }
    setFromAttributeAndIndices(e, t, n, i) {
        return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, i), this
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this
    }
    getArea() {
        return sn.subVectors(this.c, this.b), Rn.subVectors(this.a, this.b), sn.cross(Rn).length() * .5
    }
    getMidpoint(e) {
        return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3)
    }
    getNormal(e) {
        return an.getNormal(this.a, this.b, this.c, e)
    }
    getPlane(e) {
        return e.setFromCoplanarPoints(this.a, this.b, this.c)
    }
    getBarycoord(e, t) {
        return an.getBarycoord(e, this.a, this.b, this.c, t)
    }
    getInterpolation(e, t, n, i, r) {
        return an.getInterpolation(e, this.a, this.b, this.c, t, n, i, r)
    }
    containsPoint(e) {
        return an.containsPoint(e, this.a, this.b, this.c)
    }
    isFrontFacing(e) {
        return an.isFrontFacing(this.a, this.b, this.c, e)
    }
    intersectsBox(e) {
        return e.intersectsTriangle(this)
    }
    closestPointToPoint(e, t) {
        const n = this.a,
            i = this.b,
            r = this.c;
        let a, o;
        vi.subVectors(i, n), Mi.subVectors(r, n), ta.subVectors(e, n);
        const l = vi.dot(ta),
            c = Mi.dot(ta);
        if (l <= 0 && c <= 0) return t.copy(n);
        na.subVectors(e, i);
        const h = vi.dot(na),
            u = Mi.dot(na);
        if (h >= 0 && u <= h) return t.copy(i);
        const d = l * u - h * c;
        if (d <= 0 && l >= 0 && h <= 0 && l - h > 0) return a = l / (l - h), t.copy(n).addScaledVector(vi, a);
        ia.subVectors(e, r);
        const f = vi.dot(ia),
            p = Mi.dot(ia);
        if (p >= 0 && f <= p) return t.copy(r);
        const x = f * c - l * p;
        if (x <= 0 && c >= 0 && p <= 0) return o = c / (c - p), t.copy(n).addScaledVector(Mi, o);
        const m = h * p - f * u;
        if (m <= 0 && u - h >= 0 && f - p >= 0) return Ol.subVectors(r, i), o = (u - h) / (u - h + (f - p)), t.copy(i).addScaledVector(Ol, o);
        const g = 1 / (m + x + d);
        return a = x * g, o = d * g, t.copy(n).addScaledVector(vi, a).addScaledVector(Mi, o)
    }
    equals(e) {
        return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c)
    }
}
