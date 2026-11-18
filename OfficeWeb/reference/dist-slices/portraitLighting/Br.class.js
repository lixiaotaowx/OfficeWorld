class Br extends wt {
    constructor(e = 1, t = 1, n = 1, i = 1) {
        super(), this.type = "PlaneGeometry", this.parameters = {
            width: e,
            height: t,
            widthSegments: n,
            heightSegments: i
        };
        const r = e / 2,
            a = t / 2,
            o = Math.floor(n),
            l = Math.floor(i),
            c = o + 1,
            h = l + 1,
            u = e / o,
            d = t / l,
            f = [],
            p = [],
            x = [],
            m = [];
        for (let g = 0; g < h; g++) {
            const M = g * d - a;
            for (let E = 0; E < c; E++) {
                const v = E * u - r;
                p.push(v, -M, 0), x.push(0, 0, 1), m.push(E / o), m.push(1 - g / l)
            }
        }
        for (let g = 0; g < l; g++)
            for (let M = 0; M < o; M++) {
                const E = M + c * g,
                    v = M + c * (g + 1),
                    A = M + 1 + c * (g + 1),
                    b = M + 1 + c * g;
                f.push(E, v, b), f.push(v, A, b)
            }
        this.setIndex(f), this.setAttribute("position", new ut(p, 3)), this.setAttribute("normal", new ut(x, 3)), this.setAttribute("uv", new ut(m, 2))
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Br(e.width, e.height, e.widthSegments, e.heightSegments)
    }
}
