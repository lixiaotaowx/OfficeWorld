const kf = {
    generateTopUV: function(s, e, t, n, i) {
        const r = e[t * 3],
            a = e[t * 3 + 1],
            o = e[n * 3],
            l = e[n * 3 + 1],
            c = e[i * 3],
            h = e[i * 3 + 1];
        return [new re(r, a), new re(o, l), new re(c, h)]
    },
    generateSideWallUV: function(s, e, t, n, i, r) {
        const a = e[t * 3],
            o = e[t * 3 + 1],
            l = e[t * 3 + 2],
            c = e[n * 3],
            h = e[n * 3 + 1],
            u = e[n * 3 + 2],
            d = e[i * 3],
            f = e[i * 3 + 1],
            p = e[i * 3 + 2],
            x = e[r * 3],
            m = e[r * 3 + 1],
            g = e[r * 3 + 2];
        return Math.abs(o - h) < Math.abs(a - c) ? [new re(a, 1 - l), new re(c, 1 - u), new re(d, 1 - p), new re(x, 1 - g)] : [new re(o, 1 - l), new re(h, 1 - u), new re(f, 1 - p), new re(m, 1 - g)]
    }
};

