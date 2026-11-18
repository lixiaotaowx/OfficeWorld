class qi extends wt {
    constructor(e = 1, t = 1, n = 1, i = 1, r = 1, a = 1) {
        super(), this.type = "BoxGeometry", this.parameters = {
            width: e,
            height: t,
            depth: n,
            widthSegments: i,
            heightSegments: r,
            depthSegments: a
        };
        const o = this;
        i = Math.floor(i), r = Math.floor(r), a = Math.floor(a);
        const l = [],
            c = [],
            h = [],
            u = [];
        let d = 0,
            f = 0;
        p("z", "y", "x", -1, -1, n, t, e, a, r, 0), p("z", "y", "x", 1, -1, n, t, -e, a, r, 1), p("x", "z", "y", 1, 1, e, n, t, i, a, 2), p("x", "z", "y", 1, -1, e, n, -t, i, a, 3), p("x", "y", "z", 1, -1, e, t, n, i, r, 4), p("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(l), this.setAttribute("position", new ut(c, 3)), this.setAttribute("normal", new ut(h, 3)), this.setAttribute("uv", new ut(u, 2));

        function p(x, m, g, M, E, v, A, b, _, T, I) {
            const R = v / _,
                D = A / T,
                F = v / 2,
                V = A / 2,
                L = b / 2,
                k = _ + 1,
                X = T + 1;
            let H = 0,
                te = 0;
            const W = new N;
            for (let Q = 0; Q < X; Q++) {
                const ee = Q * D - V;
                for (let Te = 0; Te < k; Te++) {
                    const Oe = Te * R - F;
                    W[x] = Oe * M, W[m] = ee * E, W[g] = L, c.push(W.x, W.y, W.z), W[x] = 0, W[m] = 0, W[g] = b > 0 ? 1 : -1, h.push(W.x, W.y, W.z), u.push(Te / _), u.push(1 - Q / T), H += 1
                }
            }
            for (let Q = 0; Q < T; Q++)
                for (let ee = 0; ee < _; ee++) {
                    const Te = d + ee + k * Q,
                        Oe = d + ee + k * (Q + 1),
                        Y = d + (ee + 1) + k * (Q + 1),
                        _e = d + (ee + 1) + k * Q;
                    l.push(Te, Oe, _e), l.push(Oe, Y, _e), te += 6
                }
            o.addGroup(f, te, I), f += te, d += H
        }
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new qi(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments)
    }
}
