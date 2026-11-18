function xo(r, e, t) {
    var A;
    const s = ((A = t.scale) == null ? void 0 : A[0]) || 1;
    if (r.some(c => (c.scale || [1, 1, 1]).some(h => h * s < (c.kind.startsWith("model:") ? .05 : .1) - 1e-9 || h * s > (c.kind.startsWith("model:") ? 20 : 10) + 1e-9))) throw Error("缩放超出所选零件的范围，请缩小调整幅度");
    const i = (t.rotation || 0) - (e.rotation || 0),
        n = i * K0,
        o = Math.cos(n),
        a = Math.sin(n),
        l = c => Math.round(c * 1e3) / 1e3 + 0;
    return r.map(c => ({
        ...c,
        x: l(t.x + ((c.x - e.x) * o + (c.z - e.z) * a) * s),
        y: l(t.y + (c.y - e.y) * s),
        z: l(t.z + (-(c.x - e.x) * a + (c.z - e.z) * o) * s),
        rotation: ((c.rotation + i) % 24 + 24) % 24,
        ...s === 1 ? {} : {
            scale: (c.scale || [1, 1, 1]).map(h => h * s)
        }
    }))
}
