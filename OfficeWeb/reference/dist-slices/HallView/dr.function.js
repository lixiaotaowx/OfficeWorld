function dr(r, e, t) {
    const s = Math.abs(t.y - e.top.y) <= P0,
        i = e.bottom;
    if (t.y < i.y - P0 || t.y > e.up[0].y + P0 || Math.hypot(t.x - i.x, t.z - i.z) > .7) return null;
    const n = {
        x: i.x,
        y: Math.max(i.y, Math.min(t.y, e.up[0].y)),
        z: i.z,
        climb: e.ids,
        climbEntry: !0,
        face: e.up[0].face
    };
    if (s) {
        const o = [...e.up.slice(0, -1).reverse(), {
            ...e.bottom,
            climb: e.ids,
            face: e.up[0].face
        }];
        return D1(r, t, o[0], e.ids) ? o : null
    }
    return S5(r, t, n, e.ids) ? [n, ...e.up] : null
}

