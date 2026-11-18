function D(x, e) {
    const t = x.find(h => h.id === 0);
    if (!t || t.pocketed) return null;
    const i = Math.cos(e),
        a = Math.sin(e),
        n = c.radius * 2;
    let f = 1 / 0,
        b = null;
    for (const [h, u, s] of [
            [t.x, i, c.halfX - c.radius],
            [t.z, a, c.halfZ - c.radius]
        ]) Math.abs(u) > 1e-4 && (f = Math.min(f, ((u > 0 ? s : -s) - h) / u));
    for (const h of x) {
        if (!h.id || h.pocketed) continue;
        const u = h.x - t.x,
            s = h.z - t.z,
            l = u * i + s * a,
            o = u * u + s * s - l * l;
        if (l <= 0 || o > n * n) continue;
        const p = Math.max(0, l - Math.sqrt(Math.max(0, n * n - o)));
        if (p >= f) continue;
        const r = (t.x + i * p - h.x) / n,
            m = (t.z + a * p - h.z) / n;
        f = p, b = {
            ballId: h.id,
            x: h.x + r * c.radius,
            z: h.z + m * c.radius,
            nx: r,
            nz: m
        }
    }
    return b
}
