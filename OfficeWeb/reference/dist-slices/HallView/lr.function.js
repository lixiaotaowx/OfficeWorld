function lr(r, e, t, s, i) {
    const n = r.getWorldPosition(new T),
        o = e.getWorldPosition(new T),
        a = t.getWorldPosition(new T),
        l = n.distanceTo(o),
        A = o.distanceTo(a);
    if (l < 1e-5 || A < 1e-5) return;
    const c = s.clone().sub(n),
        h = ve.clamp(c.length(), Math.abs(l - A) + 1e-5, l + A - 1e-5);
    c.normalize();
    const u = (l * l - A * A + h * h) / (2 * h),
        d = i.clone().addScaledVector(c, -i.dot(c)).normalize(),
        g = n.clone().addScaledVector(c, u).addScaledVector(d, Math.sqrt(Math.max(0, l * l - u * u)));
    v1(r, e, g), v1(e, t, n.addScaledVector(c, h))
}

