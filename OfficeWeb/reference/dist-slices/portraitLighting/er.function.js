function er(s, e, t, n, i, r, a, o, l, c) {
    s.getVertexPosition(o, Js), s.getVertexPosition(l, Zs), s.getVertexPosition(c, $s);
    const h = jd(s, e, t, n, Js, Zs, $s, Hl);
    if (h) {
        const u = new N;
        an.getBarycoord(Hl, Js, Zs, $s, u), i && (h.uv = an.getInterpolatedAttribute(i, o, l, c, u, new re)), r && (h.uv1 = an.getInterpolatedAttribute(r, o, l, c, u, new re)), a && (h.normal = an.getInterpolatedAttribute(a, o, l, c, u, new N), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
        const d = {
            a: o,
            b: l,
            c,
            normal: new N,
            materialIndex: 0
        };
        an.getNormal(Js, Zs, $s, d.normal), h.face = d, h.barycoord = u
    }
    return h
}
