class pu extends Yi {
    constructor(e, t, n, i) {
        super(e, t, n, i)
    }
    copySampleValue_(e) {
        const t = this.resultBuffer,
            n = this.sampleValues,
            i = this.valueSize,
            r = e * i * 3 + i;
        for (let a = 0; a !== i; a++) t[a] = n[r + a];
        return t
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = o * 2,
            c = o * 3,
            h = i - t,
            u = (n - t) / h,
            d = u * u,
            f = d * u,
            p = e * c,
            x = p - c,
            m = -2 * f + 3 * d,
            g = f - d,
            M = 1 - m,
            E = g - d + u;
        for (let v = 0; v !== o; v++) {
            const A = a[x + v + o],
                b = a[x + v + l] * h,
                _ = a[p + v + o],
                T = a[p + v] * h;
            r[v] = M * A + E * b + m * _ + g * T
        }
        return r
    }
}
