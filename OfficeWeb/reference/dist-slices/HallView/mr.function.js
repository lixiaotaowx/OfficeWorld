function mr(r, e) {
    let t = null;
    for (const s of e) {
        const i = s.userData.part;
        if ((i == null ? void 0 : i.kind) !== "ladder") continue;
        let n = !0;
        for (let A = s; A; A = A.parent) A.visible || (n = !1);
        if (!n) continue;
        s.updateWorldMatrix(!0, !1);
        const a = r.ray.clone().applyMatrix4(s.matrixWorld.clone().invert()).intersectBox(new re(new T(-.31, 0, -.09), new T(.31, 2, .09)), new T);
        if (!a) continue;
        a.applyMatrix4(s.matrixWorld);
        const l = a.distanceTo(r.ray.origin);
        l < r.near || l > r.far || t && l >= t.distance || (t = {
            id: i.id,
            point: a,
            distance: l
        })
    }
    return t
}
