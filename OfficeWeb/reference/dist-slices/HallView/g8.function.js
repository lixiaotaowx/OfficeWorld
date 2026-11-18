function g8(r, e, t, s, i, n, o = 0) {
    e.updateWorldMatrix(!0, !1);
    const a = Math.cos(s),
        l = Math.sin(s),
        A = e.localToWorld(new T(t.x - a * .95, x0.height + .25, t.z - l * .95)),
        c = e.localToWorld(new T(t.x + a * .65, x0.height + x0.radius + o, t.z + l * .65));
    r.position.copy(A), r.up.set(0, 1, 0).transformDirection(e.matrixWorld), r.aspect = Math.max(1, i) / Math.max(1, n), r.zoom = 1, r.fov = ve.radToDeg(2 * Math.atan(Math.tan(ve.degToRad(54) / 2) / Math.min(1, r.aspect)));
    const h = e.getWorldScale(new T);
    return r.near = Math.max(.005, .02 * Math.min(h.x, h.y, h.z)), r.far = Math.max(200, A.distanceTo(c) * 100), r.lookAt(c), r.updateProjectionMatrix(), r.updateMatrixWorld(!0), c
}

