function rr(s, e, t, n, i, r, a) {
    const o = s.geometry.attributes.position;
    if (Cr.fromBufferAttribute(o, i), Lr.fromBufferAttribute(o, r), t.distanceSqToSegment(Cr, Lr, ma, $l) > n) return;
    ma.applyMatrix4(s.matrixWorld);
    const c = e.ray.origin.distanceTo(ma);
    if (!(c < e.near || c > e.far)) return {
        distance: c,
        point: $l.clone().applyMatrix4(s.matrixWorld),
        index: a,
        face: null,
        faceIndex: null,
        barycoord: null,
        object: s
    }
}
