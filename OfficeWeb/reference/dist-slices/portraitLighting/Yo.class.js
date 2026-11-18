class Yo extends wt {
    constructor(e = 1, t = 1, n = 1, i = 32, r = 1, a = !1, o = 0, l = Math.PI * 2) {
        super(), this.type = "CylinderGeometry", this.parameters = {
            radiusTop: e,
            radiusBottom: t,
            height: n,
            radialSegments: i,
            heightSegments: r,
            openEnded: a,
            thetaStart: o,
            thetaLength: l
        };
        const c = this;
        i = Math.floor(i), r = Math.floor(r);
        const h = [],
            u = [],
            d = [],
            f = [];
        let p = 0;
        const x = [],
            m = n / 2;
        let g = 0;
        M(), a === !1 && (e > 0 && E(!0), t > 0 && E(!1)), this.setIndex(h), this.setAttribute("position", new ut(u, 3)), this.setAttribute("normal", new ut(d, 3)), this.setAttribute("uv", new ut(f, 2));

        function M() {
            const v = new N,
                A = new N;
            let b = 0;
            const _ = (t - e) / n;
            for (let T = 0; T <= r; T++) {
                const I = [],
                    R = T / r,
                    D = R * (t - e) + e;
                for (let F = 0; F <= i; F++) {
                    const V = F / i,
                        L = V * l + o,
                        k = Math.sin(L),
                        X = Math.cos(L);
                    A.x = D * k, A.y = -R * n + m, A.z = D * X, u.push(A.x, A.y, A.z), v.set(k, _, X).normalize(), d.push(v.x, v.y, v.z), f.push(V, 1 - R), I.push(p++)
                }
                x.push(I)
            }
            for (let T = 0; T < i; T++)
                for (let I = 0; I < r; I++) {
                    const R = x[I][T],
                        D = x[I + 1][T],
                        F = x[I + 1][T + 1],
                        V = x[I][T + 1];
                    (e > 0 || I !== 0) && (h.push(R, D, V), b += 3), (t > 0 || I !== r - 1) && (h.push(D, F, V), b += 3)
                }
            c.addGroup(g, b, 0), g += b
        }

        function E(v) {
            const A = p,
                b = new re,
                _ = new N;
            let T = 0;
            const I = v === !0 ? e : t,
                R = v === !0 ? 1 : -1;
            for (let F = 1; F <= i; F++) u.push(0, m * R, 0), d.push(0, R, 0), f.push(.5, .5), p++;
            const D = p;
            for (let F = 0; F <= i; F++) {
                const L = F / i * l + o,
                    k = Math.cos(L),
                    X = Math.sin(L);
                _.x = I * X, _.y = m * R, _.z = I * k, u.push(_.x, _.y, _.z), d.push(0, R, 0), b.x = k * .5 + .5, b.y = X * .5 * R + .5, f.push(b.x, b.y), p++
            }
            for (let F = 0; F < i; F++) {
                const V = A + F,
                    L = D + F;
                v === !0 ? h.push(L, L + 1, V) : h.push(L + 1, L, V), T += 3
            }
            c.addGroup(g, T, v === !0 ? 1 : 2), g += T
        }
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Yo(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength)
    }
}
