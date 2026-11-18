function pv(s) {
    const e = new Map,
        t = new Map,
        n = new Map,
        i = new Map,
        r = new Set;
    for (const h of Ra)
        for (const u of Ca[h]) u.mesh && r.add(u.mesh);
    s.traverse(h => {
        const u = h;
        if (!u.isMesh && !u.isSkinnedMesh) return;
        const f = (Array.isArray(u.material) ? u.material : [u.material]).map(p => p.clone());
        u.material = Array.isArray(u.material) ? f : f[0], f.forEach((p, x) => {
            const m = dv(p);
            if (!m || ((m.name === "Material.005" || m.name === "Material.006") && (m.roughness = m.name === "Material.005" ? .2 : .42, m.metalness = 0), e.set(m.name, m), r.has(u.name))) return;
            const g = fv(u.geometry, x, f.length);
            i.set(m.name, (i.get(m.name) ?? 0) + g)
        }), r.has(u.name) && t.set(u.name, u)
    });
    for (const h of Ra)
        for (const u of Ca[h]) u.mesh && n.set(u.mesh, h);
    const a = [...i.keys()].filter(h => {
            var u;
            return (u = e.get(h)) == null ? void 0 : u.map
        }),
        o = a.length ? a : [...i.keys()];
    let l = null,
        c = -1;
    for (const h of o) {
        const u = i.get(h);
        u > c && (c = u, l = h)
    }
    return {
        materials: e,
        accessories: t,
        slots: n,
        bodyMaterial: l,
        weights: Object.fromEntries(i)
    }
}

