function yf(s, e, t = 2) {
    const n = e && e.length,
        i = n ? e[0] * t : s.length;
    let r = zh(s, 0, i, t, !0);
    const a = [];
    if (!r || r.next === r.prev) return a;
    let o, l, c;
    if (n && (r = wf(s, e, r, t)), s.length > 80 * t) {
        o = s[0], l = s[1];
        let h = o,
            u = l;
        for (let d = t; d < i; d += t) {
            const f = s[d],
                p = s[d + 1];
            f < o && (o = f), p < l && (l = p), f > h && (h = f), p > u && (u = p)
        }
        c = Math.max(h - o, u - l), c = c !== 0 ? 32767 / c : 0
    }
    return ws(r, a, t, o, l, c, 0), a
}

