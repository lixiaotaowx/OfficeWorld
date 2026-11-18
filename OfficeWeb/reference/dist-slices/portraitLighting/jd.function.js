function jd(s, e, t, n, i, r, a, o) {
    let l;
    if (e.side === Wt ? l = n.intersectTriangle(a, r, i, !0, o) : l = n.intersectTriangle(i, r, a, e.side === $n, o), l === null) return null;
    js.copy(o), js.applyMatrix4(s.matrixWorld);
    const c = t.ray.origin.distanceTo(js);
    return c < t.near || c > t.far ? null : {
        distance: c,
        point: js.clone(),
        object: s
    }
}

