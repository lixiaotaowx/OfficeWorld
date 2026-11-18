class ep extends Yi {
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = e * o,
            c = l - o,
            h = this.inTangents,
            u = this.outTangents;
        if (!h || !u) {
            const p = (n - t) / (i - t),
                x = 1 - p;
            for (let m = 0; m !== o; ++m) r[m] = a[c + m] * x + a[l + m] * p;
            return r
        }
        const d = o * 2,
            f = e - 1;
        for (let p = 0; p !== o; ++p) {
            const x = a[c + p],
                m = a[l + p],
                g = f * d + p * 2,
                M = u[g],
                E = u[g + 1],
                v = e * d + p * 2,
                A = h[v],
                b = h[v + 1],
                _ = np(n, t, M, A, i);
            r[p] = Zh(_, x, E, b, m)
        }
        return r
    }
}

