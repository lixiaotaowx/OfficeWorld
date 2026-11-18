class Q8 {
    constructor(e = Math) {
        this.grad3 = [
            [1, 1, 0],
            [-1, 1, 0],
            [1, -1, 0],
            [-1, -1, 0],
            [1, 0, 1],
            [-1, 0, 1],
            [1, 0, -1],
            [-1, 0, -1],
            [0, 1, 1],
            [0, -1, 1],
            [0, 1, -1],
            [0, -1, -1]
        ], this.grad4 = [
            [0, 1, 1, 1],
            [0, 1, 1, -1],
            [0, 1, -1, 1],
            [0, 1, -1, -1],
            [0, -1, 1, 1],
            [0, -1, 1, -1],
            [0, -1, -1, 1],
            [0, -1, -1, -1],
            [1, 0, 1, 1],
            [1, 0, 1, -1],
            [1, 0, -1, 1],
            [1, 0, -1, -1],
            [-1, 0, 1, 1],
            [-1, 0, 1, -1],
            [-1, 0, -1, 1],
            [-1, 0, -1, -1],
            [1, 1, 0, 1],
            [1, 1, 0, -1],
            [1, -1, 0, 1],
            [1, -1, 0, -1],
            [-1, 1, 0, 1],
            [-1, 1, 0, -1],
            [-1, -1, 0, 1],
            [-1, -1, 0, -1],
            [1, 1, 1, 0],
            [1, 1, -1, 0],
            [1, -1, 1, 0],
            [1, -1, -1, 0],
            [-1, 1, 1, 0],
            [-1, 1, -1, 0],
            [-1, -1, 1, 0],
            [-1, -1, -1, 0]
        ], this.p = [];
        for (let t = 0; t < 256; t++) this.p[t] = Math.floor(e.random() * 256);
        this.perm = [];
        for (let t = 0; t < 512; t++) this.perm[t] = this.p[t & 255];
        this.simplex = [
            [0, 1, 2, 3],
            [0, 1, 3, 2],
            [0, 0, 0, 0],
            [0, 2, 3, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 2, 3, 0],
            [0, 2, 1, 3],
            [0, 0, 0, 0],
            [0, 3, 1, 2],
            [0, 3, 2, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 3, 2, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 2, 0, 3],
            [0, 0, 0, 0],
            [1, 3, 0, 2],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 3, 0, 1],
            [2, 3, 1, 0],
            [1, 0, 2, 3],
            [1, 0, 3, 2],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 0, 3, 1],
            [0, 0, 0, 0],
            [2, 1, 3, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [2, 0, 1, 3],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [3, 0, 1, 2],
            [3, 0, 2, 1],
            [0, 0, 0, 0],
            [3, 1, 2, 0],
            [2, 1, 0, 3],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [3, 1, 0, 2],
            [0, 0, 0, 0],
            [3, 2, 0, 1],
            [3, 2, 1, 0]
        ]
    }
    noise(e, t) {
        let s, i, n;
        const o = .5 * (Math.sqrt(3) - 1),
            a = (e + t) * o,
            l = Math.floor(e + a),
            A = Math.floor(t + a),
            c = (3 - Math.sqrt(3)) / 6,
            h = (l + A) * c,
            u = l - h,
            d = A - h,
            g = e - u,
            p = t - d;
        let I, C;
        g > p ? (I = 1, C = 0) : (I = 0, C = 1);
        const E = g - I + c,
            x = p - C + c,
            B = g - 1 + 2 * c,
            b = p - 1 + 2 * c,
            v = l & 255,
            L = A & 255,
            D = this.perm[v + this.perm[L]] % 12,
            P = this.perm[v + I + this.perm[L + C]] % 12,
            U = this.perm[v + 1 + this.perm[L + 1]] % 12;
        let R = .5 - g * g - p * p;
        R < 0 ? s = 0 : (R *= R, s = R * R * this._dot(this.grad3[D], g, p));
        let Q = .5 - E * E - x * x;
        Q < 0 ? i = 0 : (Q *= Q, i = Q * Q * this._dot(this.grad3[P], E, x));
        let H = .5 - B * B - b * b;
        return H < 0 ? n = 0 : (H *= H, n = H * H * this._dot(this.grad3[U], B, b)), 70 * (s + i + n)
    }
    noise3d(e, t, s) {
        let i, n, o, a;
        const A = (e + t + s) * .3333333333333333,
            c = Math.floor(e + A),
            h = Math.floor(t + A),
            u = Math.floor(s + A),
            d = 1 / 6,
            g = (c + h + u) * d,
            p = c - g,
            I = h - g,
            C = u - g,
            E = e - p,
            x = t - I,
            B = s - C;
        let b, v, L, D, P, U;
        E >= x ? x >= B ? (b = 1, v = 0, L = 0, D = 1, P = 1, U = 0) : E >= B ? (b = 1, v = 0, L = 0, D = 1, P = 0, U = 1) : (b = 0, v = 0, L = 1, D = 1, P = 0, U = 1) : x < B ? (b = 0, v = 0, L = 1, D = 0, P = 1, U = 1) : E < B ? (b = 0, v = 1, L = 0, D = 0, P = 1, U = 1) : (b = 0, v = 1, L = 0, D = 1, P = 1, U = 0);
        const R = E - b + d,
            Q = x - v + d,
            H = B - L + d,
            N = E - D + 2 * d,
            G = x - P + 2 * d,
            q = B - U + 2 * d,
            j = E - 1 + 3 * d,
            h0 = x - 1 + 3 * d,
            i0 = B - 1 + 3 * d,
            u0 = c & 255,
            W = h & 255,
            t0 = u & 255,
            o0 = this.perm[u0 + this.perm[W + this.perm[t0]]] % 12,
            d0 = this.perm[u0 + b + this.perm[W + v + this.perm[t0 + L]]] % 12,
            Re = this.perm[u0 + D + this.perm[W + P + this.perm[t0 + U]]] % 12,
            Z = this.perm[u0 + 1 + this.perm[W + 1 + this.perm[t0 + 1]]] % 12;
        let le = .6 - E * E - x * x - B * B;
        le < 0 ? i = 0 : (le *= le, i = le * le * this._dot3(this.grad3[o0], E, x, B));
        let H0 = .6 - R * R - Q * Q - H * H;
        H0 < 0 ? n = 0 : (H0 *= H0, n = H0 * H0 * this._dot3(this.grad3[d0], R, Q, H));
        let Z0 = .6 - N * N - G * G - q * q;
        Z0 < 0 ? o = 0 : (Z0 *= Z0, o = Z0 * Z0 * this._dot3(this.grad3[Re], N, G, q));
        let j0 = .6 - j * j - h0 * h0 - i0 * i0;
        return j0 < 0 ? a = 0 : (j0 *= j0, a = j0 * j0 * this._dot3(this.grad3[Z], j, h0, i0)), 32 * (i + n + o + a)
    }
    noise4d(e, t, s, i) {
        const n = this.grad4,
            o = this.simplex,
            a = this.perm,
            l = (Math.sqrt(5) - 1) / 4,
            A = (5 - Math.sqrt(5)) / 20;
        let c, h, u, d, g;
        const p = (e + t + s + i) * l,
            I = Math.floor(e + p),
            C = Math.floor(t + p),
            E = Math.floor(s + p),
            x = Math.floor(i + p),
            B = (I + C + E + x) * A,
            b = I - B,
            v = C - B,
            L = E - B,
            D = x - B,
            P = e - b,
            U = t - v,
            R = s - L,
            Q = i - D,
            H = P > U ? 32 : 0,
            N = P > R ? 16 : 0,
            G = U > R ? 8 : 0,
            q = P > Q ? 4 : 0,
            j = U > Q ? 2 : 0,
            h0 = R > Q ? 1 : 0,
            i0 = H + N + G + q + j + h0,
            u0 = o[i0][0] >= 3 ? 1 : 0,
            W = o[i0][1] >= 3 ? 1 : 0,
            t0 = o[i0][2] >= 3 ? 1 : 0,
            o0 = o[i0][3] >= 3 ? 1 : 0,
            d0 = o[i0][0] >= 2 ? 1 : 0,
            Re = o[i0][1] >= 2 ? 1 : 0,
            Z = o[i0][2] >= 2 ? 1 : 0,
            le = o[i0][3] >= 2 ? 1 : 0,
            H0 = o[i0][0] >= 1 ? 1 : 0,
            Z0 = o[i0][1] >= 1 ? 1 : 0,
            j0 = o[i0][2] >= 1 ? 1 : 0,
            Je = o[i0][3] >= 1 ? 1 : 0,
            gt = P - u0 + A,
            z0 = U - W + A,
            Ke = R - t0 + A,
            F = Q - o0 + A,
            z = P - d0 + 2 * A,
            a0 = U - Re + 2 * A,
            V = R - Z + 2 * A,
            p0 = Q - le + 2 * A,
            A0 = P - H0 + 3 * A,
            Q0 = U - Z0 + 3 * A,
            C0 = R - j0 + 3 * A,
            n0 = Q - Je + 3 * A,
            R0 = P - 1 + 4 * A,
            Ee = U - 1 + 4 * A,
            Ae = R - 1 + 4 * A,
            $0 = Q - 1 + 4 * A,
            y0 = I & 255,
            ee = C & 255,
            te = E & 255,
            Fe = x & 255,
            Nt = a[y0 + a[ee + a[te + a[Fe]]]] % 32,
            Pt = a[y0 + u0 + a[ee + W + a[te + t0 + a[Fe + o0]]]] % 32,
            a1 = a[y0 + d0 + a[ee + Re + a[te + Z + a[Fe + le]]]] % 32,
            Xe = a[y0 + H0 + a[ee + Z0 + a[te + j0 + a[Fe + Je]]]] % 32,
            Ut = a[y0 + 1 + a[ee + 1 + a[te + 1 + a[Fe + 1]]]] % 32;
        let Qe = .6 - P * P - U * U - R * R - Q * Q;
        Qe < 0 ? c = 0 : (Qe *= Qe, c = Qe * Qe * this._dot4(n[Nt], P, U, R, Q));
        let Ze = .6 - gt * gt - z0 * z0 - Ke * Ke - F * F;
        Ze < 0 ? h = 0 : (Ze *= Ze, h = Ze * Ze * this._dot4(n[Pt], gt, z0, Ke, F));
        let $e = .6 - z * z - a0 * a0 - V * V - p0 * p0;
        $e < 0 ? u = 0 : ($e *= $e, u = $e * $e * this._dot4(n[a1], z, a0, V, p0));
        let et = .6 - A0 * A0 - Q0 * Q0 - C0 * C0 - n0 * n0;
        et < 0 ? d = 0 : (et *= et, d = et * et * this._dot4(n[Xe], A0, Q0, C0, n0));
        let Ne = .6 - R0 * R0 - Ee * Ee - Ae * Ae - $0 * $0;
        return Ne < 0 ? g = 0 : (Ne *= Ne, g = Ne * Ne * this._dot4(n[Ut], R0, Ee, Ae, $0)), 27 * (c + h + u + d + g)
    }
    _dot(e, t, s) {
        return e[0] * t + e[1] * s
    }
    _dot3(e, t, s, i) {
        return e[0] * t + e[1] * s + e[2] * i
    }
    _dot4(e, t, s, i, n) {
        return e[0] * t + e[1] * s + e[2] * i + e[3] * n
    }
}
