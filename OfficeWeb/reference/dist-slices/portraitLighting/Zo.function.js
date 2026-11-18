function Zo() {
    let s = 0,
        e = 0,
        t = 0,
        n = 0;

    function i(r, a, o, l) {
        s = r, e = o, t = -3 * r + 3 * a - 2 * o - l, n = 2 * r - 2 * a + o + l
    }
    return {
        initCatmullRom: function(r, a, o, l, c) {
            i(a, o, c * (o - r), c * (l - a))
        },
        initNonuniformCatmullRom: function(r, a, o, l, c, h, u) {
            let d = (a - r) / c - (o - r) / (c + h) + (o - a) / h,
                f = (o - a) / h - (l - a) / (h + u) + (l - o) / u;
            d *= h, f *= h, i(a, o, d, f)
        },
        calc: function(r) {
            const a = r * r,
                o = a * r;
            return s + e * r + t * a + n * o
        }
    }
}
