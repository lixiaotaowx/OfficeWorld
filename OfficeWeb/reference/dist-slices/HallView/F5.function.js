function F5(r, e, t = "") {
    const s = r.clone(!0);
    so(s, t), s.updateMatrixWorld(!0);
    const i = new re().setFromObject(s),
        n = i.getSize(new T),
        o = i.getCenter(new T),
        a = new E0,
        l = new E0;
    if (s.position.sub(new T(o.x, i.min.y, o.z)), l.add(s), a.add(l), e) {
        const A = Math.max(n.x, n.y, n.z) || 1;
        l.scale.setScalar(Math.max(...e) / A)
    }
    return a.traverse(A => {
        const c = A;
        c.isMesh && (c.castShadow = c.receiveShadow = !0, c.userData.token = "model", c.material = Array.isArray(c.material) ? c.material.map(h => b9(h.clone())) : b9(c.material.clone()))
    }), a
}

