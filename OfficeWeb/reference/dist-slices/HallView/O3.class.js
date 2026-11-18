class O3 {
    constructor() {
        m(this, "group", new E0);
        m(this, "merged", []);
        m(this, "sources", []);
        this.group.name = "hall-static-batch"
    }
    get active() {
        return this.sources.length > 0
    }
    build(e) {
        this.release(), e.updateMatrixWorld(!0);
        const t = new Map;
        e.traverse(s => {
            if (!z3(s) || !_3(s, e) || s.matrixWorld.determinant() <= 0 || s.layers.mask !== 1) return;
            const i = `${s.material.uuid}/${s.castShadow}/${s.receiveShadow}`;
            let n = t.get(i);
            n || t.set(i, n = {
                material: s.material,
                cast: s.castShadow,
                receive: s.receiveShadow,
                meshes: []
            }), n.meshes.push(s)
        });
        for (const s of t.values()) {
            if (s.meshes.length < 2) continue;
            const i = s.meshes.every(l => l.geometry.index),
                n = s.meshes.map(l => {
                    const A = l.geometry,
                        c = new k1;
                    for (const u of ["position", "normal", "uv"]) c.setAttribute(u, A.getAttribute(u).clone());
                    if (A.index && c.setIndex(A.index.clone()), i || !c.index) return c.applyMatrix4(l.matrixWorld);
                    const h = c.toNonIndexed();
                    return c.dispose(), h.applyMatrix4(l.matrixWorld)
                }),
                o = c4(n);
            if (n.forEach(l => l.dispose()), !o) continue;
            const a = new K(o, s.material);
            a.castShadow = s.cast, a.receiveShadow = s.receive, a.userData.nohit = !0, this.group.add(a), this.merged.push(a);
            for (const l of s.meshes) l.layers.set(ai), this.sources.push(l)
        }
    }
    release() {
        for (const e of this.sources) e.layers.set(0);
        for (const e of this.merged) this.group.remove(e), e.geometry.dispose();
        this.sources = [], this.merged = []
    }
}
