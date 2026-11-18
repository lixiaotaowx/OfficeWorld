function t9(r, e, t, s, i, n) {
    const o = [],
        a = Math.hypot(s - e, i - t),
        l = Math.max(1, Math.round(a / .55)),
        A = Math.abs(s - e) > Math.abs(i - t),
        c = (e + s) / 2,
        h = (t + i) / 2;
    for (let u = 0; u <= l; u++) o.push([.035, 1, .035, e + (s - e) * u / l, n + .5, t + (i - t) * u / l, l0.ink]);
    for (const u of [1, .5]) o.push(A ? [a, .035, .035, c, n + u, h, l0.ink] : [.035, .035, a, c, n + u, h, l0.ink]);
    return ui(o, r)
}
