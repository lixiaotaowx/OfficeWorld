class At extends gt {
    constructor(e = new wt, t = new Ni) {
        super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.count = 1, this.updateMorphTargets()
    }
    copy(e, t) {
        return super.copy(e, t), e.morphTargetInfluences !== void 0 ? this.morphTargetInfluences = e.morphTargetInfluences.slice() : this.morphTargetInfluences = void 0, e.morphTargetDictionary !== void 0 ? this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary) : this.morphTargetDictionary = void 0, this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes,
            n = Object.keys(t);
        if (n.length > 0) {
            const i = t[n[0]];
            if (i !== void 0) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let r = 0, a = i.length; r < a; r++) {
                    const o = i[r].name || String(r);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r
                }
            }
        }
    }
    getVertexPosition(e, t) {
        const n = this.geometry,
            i = n.attributes.position,
            r = n.morphAttributes.position,
            a = n.morphTargetsRelative;
        t.fromBufferAttribute(i, e);
        const o = this.morphTargetInfluences;
        if (r && o) {
            Qs.set(0, 0, 0);
            for (let l = 0, c = r.length; l < c; l++) {
                const h = o[l],
                    u = r[l];
                h !== 0 && (da.fromBufferAttribute(u, e), a ? Qs.addScaledVector(da, h) : Qs.addScaledVector(da.sub(t), h))
            }
            t.add(Qs)
        }
        return t
    }
    intersectsFrustum(e) {
        return e.intersectsObject(this)
    }
    raycast(e, t) {
        const n = this.geometry,
            i = this.material,
            r = this.matrixWorld;
        i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Ks.copy(n.boundingSphere), Ks.applyMatrix4(r), ri.copy(e.ray).recast(e.near), !(Ks.containsPoint(ri.origin) === !1 && (ri.intersectSphere(Ks, kl) === null || ri.origin.distanceToSquared(kl) > (e.far - e.near) ** 2)) && (zl.copy(r).invert(), ri.copy(e.ray).applyMatrix4(zl), !(n.boundingBox !== null && ri.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, ri)))
    }
    _computeIntersections(e, t, n) {
        let i;
        const r = this.geometry,
            a = this.material,
            o = r.index,
            l = r.attributes.position,
            c = r.attributes.uv,
            h = r.attributes.uv1,
            u = r.attributes.normal,
            d = r.groups,
            f = r.drawRange;
        if (o !== null)
            if (Array.isArray(a))
                for (let p = 0, x = d.length; p < x; p++) {
                    const m = d[p],
                        g = a[m.materialIndex],
                        M = Math.max(m.start, f.start),
                        E = Math.min(o.count, Math.min(m.start + m.count, f.start + f.count));
                    for (let v = M, A = E; v < A; v += 3) {
                        const b = o.getX(v),
                            _ = o.getX(v + 1),
                            T = o.getX(v + 2);
                        i = er(this, g, e, n, c, h, u, b, _, T), i && (i.faceIndex = Math.floor(v / 3), i.face.materialIndex = m.materialIndex, t.push(i))
                    }
                } else {
                    const p = Math.max(0, f.start),
                        x = Math.min(o.count, f.start + f.count);
                    for (let m = p, g = x; m < g; m += 3) {
                        const M = o.getX(m),
                            E = o.getX(m + 1),
                            v = o.getX(m + 2);
                        i = er(this, a, e, n, c, h, u, M, E, v), i && (i.faceIndex = Math.floor(m / 3), t.push(i))
                    }
                } else if (l !== void 0)
                    if (Array.isArray(a))
                        for (let p = 0, x = d.length; p < x; p++) {
                            const m = d[p],
                                g = a[m.materialIndex],
                                M = Math.max(m.start, f.start),
                                E = Math.min(l.count, Math.min(m.start + m.count, f.start + f.count));
                            for (let v = M, A = E; v < A; v += 3) {
                                const b = v,
                                    _ = v + 1,
                                    T = v + 2;
                                i = er(this, g, e, n, c, h, u, b, _, T), i && (i.faceIndex = Math.floor(v / 3), i.face.materialIndex = m.materialIndex, t.push(i))
                            }
                        } else {
                            const p = Math.max(0, f.start),
                                x = Math.min(l.count, f.start + f.count);
                            for (let m = p, g = x; m < g; m += 3) {
                                const M = m,
                                    E = m + 1,
                                    v = m + 2;
                                i = er(this, a, e, n, c, h, u, M, E, v), i && (i.faceIndex = Math.floor(m / 3), t.push(i))
                            }
                        }
    }
}

