function S(s) {
    const o = new k;
    return s.model.updateMatrixWorld(!0), s.model.traverseVisible(a => {
        const e = a;
        if (!e.isMesh || s.look.accessories.has(e.name) || s.look.slots.has(e.name)) return;
        const t = Array.isArray(e.material) ? e.material : [e.material];
        t.length && (t.some(n => (n == null ? void 0 : n.name) === s.look.bodyMaterial) || o.union(new k().setFromObject(e, !0)))
    }), o
}
