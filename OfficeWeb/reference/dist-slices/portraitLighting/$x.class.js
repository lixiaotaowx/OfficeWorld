class $x {
    constructor(e, t) {
        if (!t) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
        this.name = Ze.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload()
    }
    decodePrimitive(e, t) {
        const n = this.json,
            i = this.dracoLoader,
            r = e.extensions[this.name].bufferView,
            a = e.extensions[this.name].attributes,
            o = {},
            l = {},
            c = {};
        for (const h in a) {
            const u = Eo[h] || h.toLowerCase();
            o[u] = a[h]
        }
        for (const h in e.attributes) {
            const u = Eo[h] || h.toLowerCase();
            if (a[h] !== void 0) {
                const d = n.accessors[e.attributes[h]],
                    f = Bi[d.componentType];
                c[u] = f.name, l[u] = d.normalized === !0
            }
        }
        return t.getDependency("bufferView", r).then(function(h) {
            return new Promise(function(u, d) {
                i.decodeDracoFile(h, function(f) {
                    for (const p in f.attributes) {
                        const x = f.attributes[p],
                            m = l[p];
                        m !== void 0 && (x.normalized = m)
                    }
                    u(f)
                }, o, c, Xt, d)
            })
        })
    }
}
