class As {
    constructor(e = new Xn, t = new Xn, n = new Xn, i = new Xn, r = new Xn, a = new Xn) {
        this.planes = [e, t, n, i, r, a]
    }
    set(e, t, n, i, r, a) {
        const o = this.planes;
        return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(i), o[4].copy(r), o[5].copy(a), this
    }
    copy(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++) t[n].copy(e.planes[n]);
        return this
    }
    setFromProjectionMatrix(e, t = cn, n = !1) {
        const i = this.planes,
            r = e.elements,
            a = r[0],
            o = r[1],
            l = r[2],
            c = r[3],
            h = r[4],
            u = r[5],
            d = r[6],
            f = r[7],
            p = r[8],
            x = r[9],
            m = r[10],
            g = r[11],
            M = r[12],
            E = r[13],
            v = r[14],
            A = r[15];
        if (i[0].setComponents(c - a, f - h, g - p, A - M).normalize(), i[1].setComponents(c + a, f + h, g + p, A + M).normalize(), i[2].setComponents(c + o, f + u, g + x, A + E).normalize(), i[3].setComponents(c - o, f - u, g - x, A - E).normalize(), n) i[4].setComponents(l, d, m, v).normalize(), i[5].setComponents(c - l, f - d, g - m, A - v).normalize();
        else if (i[4].setComponents(c - l, f - d, g - m, A - v).normalize(), t === cn) i[5].setComponents(c + l, f + d, g + m, A + v).normalize();
        else if (t === Es) i[5].setComponents(l, d, m, v).normalize();
        else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
        return this
    }
    intersectsObject(e) {
        if (e.boundingSphere !== void 0) e.boundingSphere === null && e.computeBoundingSphere(), ai.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
        else {
            const t = e.geometry;
            t.boundingSphere === null && t.computeBoundingSphere(), ai.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)
        }
        return this.intersectsSphere(ai)
    }
    intersectsSprite(e) {
        ai.center.set(0, 0, 0);
        const t = sf.distanceTo(e.center);
        return ai.radius = .7071067811865476 + t, ai.applyMatrix4(e.matrixWorld), this.intersectsSphere(ai)
    }
    intersectsSphere(e) {
        const t = this.planes,
            n = e.center,
            i = -e.radius;
        for (let r = 0; r < 6; r++)
            if (t[r].distanceToPoint(n) < i) return !1;
        return !0
    }
    intersectsBox(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++) {
            const i = t[n];
            if (ir.x = i.normal.x > 0 ? e.max.x : e.min.x, ir.y = i.normal.y > 0 ? e.max.y : e.min.y, ir.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(ir) < 0) return !1
        }
        return !0
    }
    containsPoint(e) {
        const t = this.planes;
        for (let n = 0; n < 6; n++)
            if (t[n].distanceToPoint(e) < 0) return !1;
        return !0
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
