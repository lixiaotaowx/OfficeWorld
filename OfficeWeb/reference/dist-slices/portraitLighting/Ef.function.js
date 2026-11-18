function Ef(s, e, t, n) {
    const i = s.prev,
        r = s,
        a = s.next;
    if (xt(i, r, a) >= 0) return !1;
    const o = i.x,
        l = r.x,
        c = a.x,
        h = i.y,
        u = r.y,
        d = a.y,
        f = Math.min(o, l, c),
        p = Math.min(h, u, d),
        x = Math.max(o, l, c),
        m = Math.max(h, u, d),
        g = _o(f, p, e, t, n),
        M = _o(x, m, e, t, n);
    let E = s.prevZ,
        v = s.nextZ;
    for (; E && E.z >= g && v && v.z <= M;) {
        if (E.x >= f && E.x <= x && E.y >= p && E.y <= m && E !== i && E !== a && hs(o, h, l, u, c, d, E.x, E.y) && xt(E.prev, E, E.next) >= 0 || (E = E.prevZ, v.x >= f && v.x <= x && v.y >= p && v.y <= m && v !== i && v !== a && hs(o, h, l, u, c, d, v.x, v.y) && xt(v.prev, v, v.next) >= 0)) return !1;
        v = v.nextZ
    }
    for (; E && E.z >= g;) {
        if (E.x >= f && E.x <= x && E.y >= p && E.y <= m && E !== i && E !== a && hs(o, h, l, u, c, d, E.x, E.y) && xt(E.prev, E, E.next) >= 0) return !1;
        E = E.prevZ
    }
    for (; v && v.z <= M;) {
        if (v.x >= f && v.x <= x && v.y >= p && v.y <= m && v !== i && v !== a && hs(o, h, l, u, c, d, v.x, v.y) && xt(v.prev, v, v.next) >= 0) return !1;
        v = v.nextZ
    }
    return !0
}

