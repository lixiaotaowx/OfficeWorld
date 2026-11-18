class bn {
    constructor() {
        this.type = "Curve", this.arcLengthDivisions = 200, this.needsUpdate = !1, this.cacheArcLengths = null
    }
    getPoint() {
        Ce("Curve: .getPoint() not implemented.")
    }
    getPointAt(e, t) {
        const n = this.getUtoTmapping(e);
        return this.getPoint(n, t)
    }
    getPoints(e = 5) {
        const t = [];
        for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
        return t
    }
    getSpacedPoints(e = 5) {
        const t = [];
        for (let n = 0; n <= e; n++) t.push(this.getPointAt(n / e));
        return t
    }
    getLength() {
        const e = this.getLengths();
        return e[e.length - 1]
    }
    getLengths(e = this.arcLengthDivisions) {
        if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate) return this.cacheArcLengths;
        this.needsUpdate = !1;
        const t = [];
        let n, i = this.getPoint(0),
            r = 0;
        t.push(0);
        for (let a = 1; a <= e; a++) n = this.getPoint(a / e), r += n.distanceTo(i), t.push(r), i = n;
        return this.cacheArcLengths = t, t
    }
    updateArcLengths() {
        this.needsUpdate = !0, this.getLengths()
    }
    getUtoTmapping(e, t = null) {
        const n = this.getLengths();
        let i = 0;
        const r = n.length;
        let a;
        t ? a = t : a = e * n[r - 1];
        let o = 0,
            l = r - 1,
            c;
        for (; o <= l;)
            if (i = Math.floor(o + (l - o) / 2), c = n[i] - a, c < 0) o = i + 1;
            else if (c > 0) l = i - 1;
        else {
            l = i;
            break
        }
        if (i = l, n[i] === a) return i / (r - 1);
        const h = n[i],
            d = n[i + 1] - h,
            f = (a - h) / d;
        return (i + f) / (r - 1)
    }
    getTangent(e, t) {
        let i = e - 1e-4,
            r = e + 1e-4;
        i < 0 && (i = 0), r > 1 && (r = 1);
        const a = this.getPoint(i),
            o = this.getPoint(r),
            l = t || (a.isVector2 ? new re : new N);
        return l.copy(o).sub(a).normalize(), l
    }
    getTangentAt(e, t) {
        const n = this.getUtoTmapping(e);
        return this.getTangent(n, t)
    }
    computeFrenetFrames(e, t = !1) {
        const n = new N,
            i = [],
            r = [],
            a = [],
            o = new N,
            l = new We;
        for (let f = 0; f <= e; f++) {
            const p = f / e;
            i[f] = this.getTangentAt(p, new N)
        }
        r[0] = new N, a[0] = new N;
        let c = Number.MAX_VALUE;
        const h = Math.abs(i[0].x),
            u = Math.abs(i[0].y),
            d = Math.abs(i[0].z);
        h <= c && (c = h, n.set(1, 0, 0)), u <= c && (c = u, n.set(0, 1, 0)), d <= c && n.set(0, 0, 1), o.crossVectors(i[0], n).normalize(), r[0].crossVectors(i[0], o), a[0].crossVectors(i[0], r[0]);
        for (let f = 1; f <= e; f++) {
            if (r[f] = r[f - 1].clone(), a[f] = a[f - 1].clone(), o.crossVectors(i[f - 1], i[f]), o.length() > Number.EPSILON) {
                o.normalize();
                const p = Math.acos(Ke(i[f - 1].dot(i[f]), -1, 1));
                r[f].applyMatrix4(l.makeRotationAxis(o, p))
            }
            a[f].crossVectors(i[f], r[f])
        }
        if (t === !0) {
            let f = Math.acos(Ke(r[0].dot(r[e]), -1, 1));
            f /= e, i[0].dot(o.crossVectors(r[0], r[e])) > 0 && (f = -f);
            for (let p = 1; p <= e; p++) r[p].applyMatrix4(l.makeRotationAxis(i[p], f * p)), a[p].crossVectors(i[p], r[p])
        }
        return {
            tangents: i,
            normals: r,
            binormals: a
        }
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        return this.arcLengthDivisions = e.arcLengthDivisions, this.cacheArcLengths = null, this
    }
    toJSON() {
        const e = {
            metadata: {
                version: 4.7,
                type: "Curve",
                generator: "Curve.toJSON"
            }
        };
        return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e
    }
    fromJSON(e) {
        return this.arcLengthDivisions = e.arcLengthDivisions, this.cacheArcLengths = null, this
    }
}
