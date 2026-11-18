function T(s) {
    const o = S(s);
    for (const i of s.look.accessories.values()) i.visible && o.union(new k().setFromObject(i, !0));
    if (o.isEmpty()) return H(s);
    const a = o.getCenter(new x),
        e = o.getSize(new x),
        t = Math.max(.27, e.x * .59, e.y * .59),
        n = new w(-t, t, t, -t, .1, 20);
    return n.position.set(a.x + .26, a.y + .065, 3), n.lookAt(a.x, a.y, 0), n
}
Promise.resolve();

