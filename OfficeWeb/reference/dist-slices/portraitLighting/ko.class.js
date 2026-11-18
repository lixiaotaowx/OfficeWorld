class Ko extends wt {
    constructor(e = [], t = [], n = 1, i = 0) {
        super(), this.type = "PolyhedronGeometry", this.parameters = {
            vertices: e,
            indices: t,
            radius: n,
            detail: i
        };
        const r = [],
            a = [];
        o(i), c(n), h(), this.setAttribute("position", new ut(r, 3)), this.setAttribute("normal", new ut(r.slice(), 3)), this.setAttribute("uv", new ut(a, 2)), i === 0 ? this.computeVertexNormals() : this.normalizeNormals();

        function o(M) {
            const E = new N,
                v = new N,
                A = new N;
            for (let b = 0; b < t.length; b += 3) f(t[b + 0], E), f(t[b + 1], v), f(t[b + 2], A), l(E, v, A, M)
        }

        function l(M, E, v, A) {
            const b = A + 1,
                _ = [];
            for (let T = 0; T <= b; T++) {
                _[T] = [];
                const I = M.clone().lerp(v, T / b),
                    R = E.clone().lerp(v, T / b),
                    D = b - T;
                for (let F = 0; F <= D; F++) F === 0 && T === b ? _[T][F] = I : _[T][F] = I.clone().lerp(R, F / D)
            }
            for (let T = 0; T < b; T++)
                for (let I = 0; I < 2 * (b - T) - 1; I++) {
                    const R = Math.floor(I / 2);
                    I % 2 === 0 ? (d(_[T][R + 1]), d(_[T + 1][R]), d(_[T][R])) : (d(_[T][R + 1]), d(_[T + 1][R + 1]), d(_[T + 1][R]))
                }
        }

        function c(M) {
            const E = new N;
            for (let v = 0; v < r.length; v += 3) E.x = r[v + 0], E.y = r[v + 1], E.z = r[v + 2], E.normalize().multiplyScalar(M), r[v + 0] = E.x, r[v + 1] = E.y, r[v + 2] = E.z
        }

        function h() {
            const M = new N;
            for (let E = 0; E < r.length; E += 3) {
                M.x = r[E + 0], M.y = r[E + 1], M.z = r[E + 2];
                const v = m(M) / 2 / Math.PI + .5,
                    A = g(M) / Math.PI + .5;
                a.push(v, 1 - A)
            }
            p(), u()
        }

        function u() {
            for (let M = 0; M < a.length; M += 6) {
                const E = a[M + 0],
                    v = a[M + 2],
                    A = a[M + 4],
                    b = Math.max(E, v, A),
                    _ = Math.min(E, v, A);
                b > .9 && _ < .1 && (E < .2 && (a[M + 0] += 1), v < .2 && (a[M + 2] += 1), A < .2 && (a[M + 4] += 1))
            }
        }

        function d(M) {
            r.push(M.x, M.y, M.z)
        }

        function f(M, E) {
            const v = M * 3;
            E.x = e[v + 0], E.y = e[v + 1], E.z = e[v + 2]
        }

        function p() {
            const M = new N,
                E = new N,
                v = new N,
                A = new N,
                b = new re,
                _ = new re,
                T = new re;
            for (let I = 0, R = 0; I < r.length; I += 9, R += 6) {
                M.set(r[I + 0], r[I + 1], r[I + 2]), E.set(r[I + 3], r[I + 4], r[I + 5]), v.set(r[I + 6], r[I + 7], r[I + 8]), b.set(a[R + 0], a[R + 1]), _.set(a[R + 2], a[R + 3]), T.set(a[R + 4], a[R + 5]), A.copy(M).add(E).add(v).divideScalar(3);
                const D = m(A);
                x(b, R + 0, M, D), x(_, R + 2, E, D), x(T, R + 4, v, D)
            }
        }

        function x(M, E, v, A) {
            A < 0 && M.x === 1 && (a[E] = M.x - 1), v.x === 0 && v.z === 0 && (a[E] = A / 2 / Math.PI + .5)
        }

        function m(M) {
            return Math.atan2(M.z, -M.x)
        }

        function g(M) {
            return Math.atan2(-M.y, Math.sqrt(M.x * M.x + M.z * M.z))
        }
    }
    copy(e) {
        return super.copy(e), this.parameters = Object.assign({}, e.parameters), this
    }
    static fromJSON(e) {
        return new Ko(e.vertices, e.indices, e.radius, e.detail)
    }
}
