function y6(r, e) {
    if (!e) return .1;
    e.updateWorldMatrix(!0, !0);
    const t = new re().setFromObject(e);
    if (t.isEmpty()) return .1;
    const s = r.getWorldDirection(new T),
        i = r.getWorldPosition(new T);
    let n = 1 / 0;
    for (const o of [t.min.x, t.max.x])
        for (const a of [t.min.y, t.max.y])
            for (const l of [t.min.z, t.max.z]) n = Math.min(n, new T(o, a, l).sub(i).dot(s));
    return Math.max(.1, n - .08)
}
