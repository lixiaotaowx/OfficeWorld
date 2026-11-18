class Xh extends wt {
    constructor(e = .5, t = 1, n = 32, i = 1, r = 0, a = Math.PI * 2) {
        super(), this.type = "RingGeometry", this.parameters = {
            innerRadius: e,
            outerRadius: t,
            thetaSegments: n,
            phiSegments: i,
            thetaStart: r,
            thetaLength: a
        }, n = Math.max(3, n), i = Math.max(1, i);
        const o = [],
            l = [],
            c = [],
            h = [];
        let u = e;
        const d = (t - e) / i,
            f = new N,
            p = new re;
        for (let x = 0; x <= i; x++) {
            for (let m = 0; m <= n; m++) {
                const g = r + m / n * a;
                f.x = u * Math.cos(g), f.y = u * Math.sin(g), l.push(f.x, f.y, f.z), c.push(0, 0, 1), p.x = (f.x / t + 1) / 2, p.y = (f.y / t + 1) / 2, h.push(p.x, p.y)
            }
            u += d
        }
        for (let x = 0; x < i; x++) {
            const m = x * (n + 1);
            for (let g = 0; g < n; g++) {
                const M = g + m,
                    E = M,
                    v = M + n + 1,
                    A = M + n + 2,
                    b = M + 1;
                o.push(E, v, b), o.push(v, A, b)
            }
        }
        this.setIndex(o), this.setAttribute("position", new ut(l, 3)), this.setAttribute("normal", new ut(c, 3)), this.setAttribute("uv", new ut(h, 2))
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Xh(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength)
    }
}
