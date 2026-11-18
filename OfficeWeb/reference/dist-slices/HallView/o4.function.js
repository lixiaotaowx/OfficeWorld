function o4(r, e, t, s, i = () => !1) {
    const n = [],
        o = Math.max(...s) * .6 + .6,
        a = new re,
        l = new T,
        A = new T;
    for (const c of r) {
        if (!c.visible || i(c) || (a.setFromObject(c), a.isEmpty())) continue;
        a.getCenter(l).sub(e);
        const h = l.dot(t);
        h <= .3 || (l.addScaledVector(t, -h), l.length() - a.getSize(A).length() / 2 < o && n.push(c))
    }
    return n
}

