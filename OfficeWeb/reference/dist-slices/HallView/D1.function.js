function D1(r, e, t, s) {
    const i = Math.max(1, Math.ceil(Q5(e, t) / hr));
    for (let n = 0; n <= i; n++) {
        const o = n / i,
            a = e.x + (t.x - e.x) * o,
            l = e.y + (t.y - e.y) * o,
            A = e.z + (t.z - e.z) * o;
        if (r.list.some(c => !s.includes(c.partId || "") && c.x1 > a - M0 && c.x0 < a + M0 && c.z1 > A - M0 && c.z0 < A + M0 && c.y1 > l + .04 && c.y0 < l + Kt)) return !1
    }
    return !0
}

