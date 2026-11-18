class Jx {
    constructor(e) {
        this.name = Ze.EXT_MESH_GPU_INSTANCING, this.parser = e
    }
    createNodeMesh(e) {
        const t = this.parser.json,
            n = t.nodes[e];
        if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0) return null;
        const i = t.meshes[n.mesh];
        for (const c of i.primitives)
            if (c.mode !== Qt.TRIANGLES && c.mode !== Qt.TRIANGLE_STRIP && c.mode !== Qt.TRIANGLE_FAN && c.mode !== void 0) return null;
        const a = n.extensions[this.name].attributes,
            o = [],
            l = {};
        for (const c in a) o.push(this.parser.getDependency("accessor", a[c]).then(h => (l[c] = h, l[c])));
        return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then(c => {
            const h = c.pop(),
                u = h.isGroup ? h.children : [h],
                d = c[0].count,
                f = [];
            for (const p of u) {
                const x = new We,
                    m = new N,
                    g = new en,
                    M = new N(1, 1, 1),
                    E = new wh(p.geometry, p.material, d);
                for (let A = 0; A < d; A++) l.TRANSLATION && m.fromBufferAttribute(l.TRANSLATION, A), l.ROTATION && g.fromBufferAttribute(l.ROTATION, A), l.SCALE && M.fromBufferAttribute(l.SCALE, A), E.setMatrixAt(A, x.compose(m, g, M));
                let v = null;
                for (const A in l)
                    if (A === "_COLOR_0") {
                        const b = l[A];
                        E.instanceColor = new Rr(b.array, b.itemSize, b.normalized)
                    } else if (A !== "TRANSLATION" && A !== "ROTATION" && A !== "SCALE") {
                    if (v === null) {
                        const _ = E.geometry;
                        v = new wt, v.name = _.name;
                        for (const T in _.attributes) v.setAttribute(T, _.attributes[T]);
                        for (const T in _.morphAttributes) v.morphAttributes[T] = _.morphAttributes[T];
                        _.index !== null && v.setIndex(_.index), v.morphTargetsRelative = _.morphTargetsRelative;
                        for (const T of _.groups) v.addGroup(T.start, T.count, T.materialIndex);
                        _.boundingBox !== null && (v.boundingBox = _.boundingBox.clone()), _.boundingSphere !== null && (v.boundingSphere = _.boundingSphere.clone()), v.drawRange.start = _.drawRange.start, v.drawRange.count = _.drawRange.count, v.userData = Object.assign({}, _.userData), E.geometry = v
                    }
                    const b = l[A];
                    v.setAttribute(A, new Rr(b.array, b.itemSize, b.normalized))
                }
                gt.prototype.copy.call(E, p), this.parser.assignFinalMaterial(E), f.push(E)
            }
            return h.isGroup ? (h.clear(), h.add(...f), h) : f[0]
        }))
    }
}
