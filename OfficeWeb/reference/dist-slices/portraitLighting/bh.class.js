class Bh extends bn {
    constructor(e = []) {
        super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e
    }
    getPoint(e, t = new re) {
        const n = t,
            i = this.points,
            r = (i.length - 1) * e,
            a = Math.floor(r),
            o = r - a,
            l = i[a === 0 ? a : a - 1],
            c = i[a],
            h = i[a > i.length - 2 ? i.length - 1 : a + 1],
            u = i[a > i.length - 3 ? i.length - 1 : a + 2];
        return n.set(sc(o, l.x, c.x, h.x, u.x), sc(o, l.y, c.y, h.y, u.y)), n
    }
    copy(e) {
        super.copy(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(i.clone())
        }
        return this
    }
    toJSON() {
        const e = super.toJSON();
        e.points = [];
        for (let t = 0, n = this.points.length; t < n; t++) {
            const i = this.points[t];
            e.points.push(i.toArray())
        }
        return e
    }
    fromJSON(e) {
        super.fromJSON(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(new re().fromArray(i))
        }
        return this
    }
}
var go = Object.freeze({
    __proto__: null,
    ArcCurve: lf,
    CatmullRomCurve3: cf,
    CubicBezierCurve: Uh,
    CubicBezierCurve3: _f,
    EllipseCurve: Jo,
    LineCurve: Fh,
    LineCurve3: xf,
    QuadraticBezierCurve: Oh,
    QuadraticBezierCurve3: vf,
    SplineCurve: Bh
});
