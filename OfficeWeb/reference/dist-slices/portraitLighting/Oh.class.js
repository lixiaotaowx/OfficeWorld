class Oh extends bn {
    constructor(e = new re, t = new re, n = new re) {
        super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = n
    }
    getPoint(e, t = new re) {
        const n = t,
            i = this.v0,
            r = this.v1,
            a = this.v2;
        return n.set(gs(e, i.x, r.x, a.x), gs(e, i.y, r.y, a.y)), n
    }
    copy(e) {
        return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this
    }
    toJSON() {
        const e = super.toJSON();
        return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e
    }
    fromJSON(e) {
        return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this
    }
}
