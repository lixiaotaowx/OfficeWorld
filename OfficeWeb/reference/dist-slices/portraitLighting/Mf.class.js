class Mf extends bn {
    constructor() {
        super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1, this.cacheLengths = null
    }
    add(e) {
        this.curves.push(e)
    }
    closePath() {
        const e = this.curves[0].getPoint(0),
            t = this.curves[this.curves.length - 1].getPoint(1);
        if (!e.equals(t)) {
            const n = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
            this.curves.push(new go[n](t, e))
        }
        return this
    }
    getPoint(e, t) {
        const n = e * this.getLength(),
            i = this.getCurveLengths();
        let r = 0;
        for (; r < i.length;) {
            if (i[r] >= n) {
                const a = i[r] - n,
                    o = this.curves[r],
                    l = o.getLength(),
                    c = l === 0 ? 0 : 1 - a / l;
                return o.getPointAt(c, t)
            }
            r++
        }
        return null
    }
    getLength() {
        const e = this.getCurveLengths();
        return e[e.length - 1]
    }
    updateArcLengths() {
        this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths()
    }
    getCurveLengths() {
        if (this.cacheLengths && this.cacheLengths.length === this.curves.length) return this.cacheLengths;
        const e = [];
        let t = 0;
        for (let n = 0, i = this.curves.length; n < i; n++) t += this.curves[n].getLength(), e.push(t);
        return this.cacheLengths = e, e
    }
    getSpacedPoints(e = 40) {
        const t = [];
        for (let n = 0; n <= e; n++) t.push(this.getPoint(n / e));
        return this.autoClose && t.push(t[0]), t
    }
    getPoints(e = 12) {
        const t = [];
        let n;
        for (let i = 0, r = this.curves; i < r.length; i++) {
            const a = r[i],
                o = a.isEllipseCurve ? e * 2 : a.isLineCurve || a.isLineCurve3 ? 1 : a.isSplineCurve ? e * a.points.length : e,
                l = a.getPoints(o);
            for (let c = 0; c < l.length; c++) {
                const h = l[c];
                n && n.equals(h) || (t.push(h), n = h)
            }
        }
        return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t
    }
    copy(e) {
        super.copy(e), this.curves = [];
        for (let t = 0, n = e.curves.length; t < n; t++) {
            const i = e.curves[t];
            this.curves.push(i.clone())
        }
        return this.autoClose = e.autoClose, this.cacheLengths = null, this
    }
    toJSON() {
        const e = super.toJSON();
        e.autoClose = this.autoClose, e.curves = [];
        for (let t = 0, n = this.curves.length; t < n; t++) {
            const i = this.curves[t];
            e.curves.push(i.toJSON())
        }
        return e
    }
    fromJSON(e) {
        super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
        for (let t = 0, n = e.curves.length; t < n; t++) {
            const i = e.curves[t];
            this.curves.push(new go[i.type]().fromJSON(i))
        }
        return this.cacheLengths = null, this
    }
}
