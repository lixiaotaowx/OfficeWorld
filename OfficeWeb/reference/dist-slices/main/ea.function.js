function ea(i, e) {
    if ({
            lo: i,
            hi: e
        } = Ql(i, e), e <= 2097151) return String(_i * e + i);
    const t = i & 16777215,
        n = (i >>> 24 | e << 8) & 16777215,
        s = e >> 16 & 65535;
    let r = t + n * 6777216 + s * 6710656,
        a = n + s * 8147497,
        o = s * 2;
    const c = 1e7;
    return r >= c && (a += Math.floor(r / c), r %= c), a >= c && (o += Math.floor(a / c), a %= c), o.toString() + Sr(a) + Sr(r)
}

