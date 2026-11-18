function I2(r, e) {
    if (!e) return null;
    const t = u3(r.model),
        s = new d3(t);
    s.clipAction(e).play();
    const i = ["mixamorig:LeftFoot", "mixamorig:RightFoot", "mixamorigLeftFoot", "mixamorigRightFoot"].map(h => t.getObjectByName(h)).filter(Boolean);
    if (i.length < 2) return null;
    const n = 120,
        o = e.duration,
        a = new T,
        l = i.slice(0, 2).map(() => []);
    for (let h = 0; h <= n; h++) s.setTime(o * h / n), t.updateMatrixWorld(!0), i.slice(0, 2).forEach((u, d) => l[d].push(u.getWorldPosition(a).z));
    let A = 0,
        c = 0;
    for (const h of l)
        for (let u = 1; u <= n; u++) h[u] < h[u - 1] && (A += h[u - 1] - h[u], c += o / n);
    return c ? A / c : null
}
let i9 = null;
