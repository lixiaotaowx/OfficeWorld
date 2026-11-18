function Tf(s) {
    const e = s.prev,
        t = s,
        n = s.next;
    if (xt(e, t, n) >= 0) return !1;
    const i = e.x,
        r = t.x,
        a = n.x,
        o = e.y,
        l = t.y,
        c = n.y,
        h = Math.min(i, r, a),
        u = Math.min(o, l, c),
        d = Math.max(i, r, a),
        f = Math.max(o, l, c);
    let p = n.next;
    for (; p !== e;) {
        if (p.x >= h && p.x <= d && p.y >= u && p.y <= f && hs(i, o, r, l, a, c, p.x, p.y) && xt(p.prev, p, p.next) >= 0) return !1;
        p = p.next
    }
    return !0
}

