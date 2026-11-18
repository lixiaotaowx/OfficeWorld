function jt(t) {
    const s = new Array(H).fill(0),
        n = new Array(H).fill(0);
    for (let d = 0; d < H; d++)
        for (let m = 0; m < H; m++) t[d * H + m] && (s[m]++, n[d]++);
    const c = Math.max(...s) * .12,
        r = Math.max(...n) * .12,
        i = (d, m) => d.findIndex(h => h > m),
        o = (d, m) => d.length - 1 - [...d].reverse().findIndex(h => h > m);
    return {
        x0: i(s, c),
        x1: o(s, c),
        y0: i(n, r),
        y1: o(n, r)
    }
}
