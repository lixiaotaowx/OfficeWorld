const Ev = new Mv(async () => {
        const s = await new Lx().setDRACOLoader(Tv()).loadAsync(yv),
            e = new Set;
        return s.scene.traverse(t => {
            const n = t;
            if (n.isMesh)
                for (const i of Array.isArray(n.material) ? n.material : [n.material]) e.add(i)
        }), {
            gltf: s,
            materials: e
        }
    }, ({
        gltf: s,
        materials: e
    }) => {
        const t = new Set;
        for (const n of e)
            for (const i of Object.values(n)) i instanceof vt && t.add(i);
        for (const n of t) mv(n);
        uv(s.scene)
    }),
    Ao = new WeakMap;

