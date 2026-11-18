function hv(s, e, t) {
    const n = e.attributes,
        i = new un;
    if (n.POSITION !== void 0) {
        const o = t.json.accessors[n.POSITION],
            l = o.min,
            c = o.max;
        if (l !== void 0 && c !== void 0) {
            if (i.set(new N(l[0], l[1], l[2]), new N(c[0], c[1], c[2])), o.normalized) {
                const h = bo(Bi[o.componentType]);
                i.min.multiplyScalar(h), i.max.multiplyScalar(h)
            }
        } else {
            console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
            return
        }
    } else return;
    const r = e.targets;
    if (r !== void 0) {
        const o = new N,
            l = new N;
        for (let c = 0, h = r.length; c < h; c++) {
            const u = r[c];
            if (u.POSITION !== void 0) {
                const d = t.json.accessors[u.POSITION],
                    f = d.min,
                    p = d.max;
                if (f !== void 0 && p !== void 0) {
                    if (l.setX(Math.max(Math.abs(f[0]), Math.abs(p[0]))), l.setY(Math.max(Math.abs(f[1]), Math.abs(p[1]))), l.setZ(Math.max(Math.abs(f[2]), Math.abs(p[2]))), d.normalized) {
                        const x = bo(Bi[d.componentType]);
                        l.multiplyScalar(x)
                    }
                    o.max(l)
                } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")
            }
        }
        i.expandByVector(o)
    }
    s.boundingBox = i;
    const a = new En;
    i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a
}

