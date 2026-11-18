class Yh extends wt {
    constructor(e = 1, t = .4, n = 12, i = 48, r = Math.PI * 2, a = 0, o = Math.PI * 2) {
        super(), this.type = "TorusGeometry", this.parameters = {
            radius: e,
            tube: t,
            radialSegments: n,
            tubularSegments: i,
            arc: r,
            thetaStart: a,
            thetaLength: o
        }, n = Math.floor(n), i = Math.floor(i);
        const l = [],
            c = [],
            h = [],
            u = [],
            d = new N,
            f = new N,
            p = new N;
        for (let x = 0; x <= n; x++) {
            const m = a + x / n * o;
            for (let g = 0; g <= i; g++) {
                const M = g / i * r;
                f.x = (e + t * Math.cos(m)) * Math.cos(M), f.y = (e + t * Math.cos(m)) * Math.sin(M), f.z = t * Math.sin(m), c.push(f.x, f.y, f.z), d.x = e * Math.cos(M), d.y = e * Math.sin(M), p.subVectors(f, d).normalize(), h.push(p.x, p.y, p.z), u.push(g / i), u.push(x / n)
            }
        }
        for (let x = 1; x <= n; x++)
            for (let m = 1; m <= i; m++) {
                const g = (i + 1) * x + m - 1,
                    M = (i + 1) * (x - 1) + m - 1,
                    E = (i + 1) * (x - 1) + m,
                    v = (i + 1) * x + m;
                l.push(g, M, v), l.push(M, E, v)
            }
        this.setIndex(l), this.setAttribute("position", new ut(c, 3)), this.setAttribute("normal", new ut(h, 3)), this.setAttribute("uv", new ut(u, 2))
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Yh(e.radius, e.tube, e.radialSegments, e.tubularSegments, e.arc, e.thetaStart, e.thetaLength)
    }
}

