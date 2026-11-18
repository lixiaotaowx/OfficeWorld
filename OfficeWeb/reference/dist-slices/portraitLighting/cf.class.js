class cf extends bn {
    constructor(e = [], t = !1, n = "centripetal", i = .5) {
        super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = n, this.tension = i
    }
    getPoint(e, t = new N) {
        const n = t,
            i = this.points,
            r = i.length,
            a = (r - (this.closed ? 0 : 1)) * e;
        let o = Math.floor(a),
            l = a - o;
        this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / r) + 1) * r : l === 0 && o === r - 1 && (o = r - 2, l = 1);
        let c, h;
        this.closed || o > 0 ? c = i[(o - 1) % r] : (ic.subVectors(i[0], i[1]).add(i[0]), c = ic);
        const u = i[o % r],
            d = i[(o + 1) % r];
        if (this.closed || o + 2 < r ? h = i[(o + 2) % r] : (nc.subVectors(i[r - 1], i[r - 2]).add(i[r - 1]), h = nc), this.curveType === "centripetal" || this.curveType === "chordal") {
            const f = this.curveType === "chordal" ? .5 : .25;
            let p = Math.pow(c.distanceToSquared(u), f),
                x = Math.pow(u.distanceToSquared(d), f),
                m = Math.pow(d.distanceToSquared(h), f);
            x < 1e-4 && (x = 1), p < 1e-4 && (p = x), m < 1e-4 && (m = x), ga.initNonuniformCatmullRom(c.x, u.x, d.x, h.x, p, x, m), _a.initNonuniformCatmullRom(c.y, u.y, d.y, h.y, p, x, m), xa.initNonuniformCatmullRom(c.z, u.z, d.z, h.z, p, x, m)
        } else this.curveType === "catmullrom" && (ga.initCatmullRom(c.x, u.x, d.x, h.x, this.tension), _a.initCatmullRom(c.y, u.y, d.y, h.y, this.tension), xa.initCatmullRom(c.z, u.z, d.z, h.z, this.tension));
        return n.set(ga.calc(l), _a.calc(l), xa.calc(l)), n
    }
    copy(e) {
        super.copy(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(i.clone())
        }
        return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
    }
    toJSON() {
        const e = super.toJSON();
        e.points = [];
        for (let t = 0, n = this.points.length; t < n; t++) {
            const i = this.points[t];
            e.points.push(i.toArray())
        }
        return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e
    }
    fromJSON(e) {
        super.fromJSON(e), this.points = [];
        for (let t = 0, n = e.points.length; t < n; t++) {
            const i = e.points[t];
            this.points.push(new N().fromArray(i))
        }
        return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this
    }
}

