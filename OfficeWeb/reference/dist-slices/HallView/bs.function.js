function bs(r, e, t, s, i) {
    const n = r.scale || [1, 1, 1];
    t = ge(t);
    const o = e.map((d, g) => d * n[g]),
        a = i ? ["x", "y", "z"].indexOf(i) : o.indexOf(Math.max(...o));
    if (!Number.isFinite(t) || o[a] <= 0) return [...n];
    const l = s ? .05 : .1,
        A = s ? 20 : 10;
    if (i && !s) {
        const d = Math.ceil((e[a] * l - 1e-9) / Xt) * Xt,
            g = Math.floor((e[a] * A + 1e-9) / Xt) * Xt,
            p = d <= g ? Math.max(d, Math.min(g, ge(o[a] + t))) : o[a],
            I = [...n];
        return I[a] = p / e[a], I
    }
    let c = ge(o[a] + t) / o[a],
        h = Math.max(...n.map(d => l / d)),
        u = Math.min(...n.map(d => A / d));
    return s && r.kind !== "model:__build-selection__" && (h = Math.max(h, ...o.map(d => .01 / d)), u = Math.min(u, ...o.map(d => 30 / d))), c = Math.max(h, Math.min(u, c)), n.map(d => Math.max(l, Math.min(A, d * c)))
}
