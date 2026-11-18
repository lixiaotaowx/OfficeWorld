class af extends gt {
    constructor(e = new wt, t = new Ch) {
        super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.morphTargetDictionary = void 0, this.morphTargetInfluences = void 0, this.updateMorphTargets()
    }
    copy(e, t) {
        return super.copy(e, t), e.morphTargetInfluences !== void 0 ? this.morphTargetInfluences = e.morphTargetInfluences.slice() : this.morphTargetInfluences = void 0, e.morphTargetDictionary !== void 0 ? this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary) : this.morphTargetDictionary = void 0, this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this
    }
    intersectsFrustum(e) {
        return e.intersectsObject(this)
    }
    raycast(e, t) {
        const n = this.geometry,
            i = this.matrixWorld,
            r = e.params.Points.threshold,
            a = n.drawRange;
        if (n.boundingSphere === null && n.computeBoundingSphere(), ar.copy(n.boundingSphere), ar.applyMatrix4(i), ar.radius += r, e.ray.intersectsSphere(ar) === !1) return;
        ec.copy(i).invert(), mo.copy(e.ray).applyMatrix4(ec);
        const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3),
            l = o * o,
            c = n.index,
            u = n.attributes.position;
        if (c !== null) {
            const d = Math.max(0, a.start),
                f = Math.min(c.count, a.start + a.count);
            for (let p = d, x = f; p < x; p++) {
                const m = c.getX(p);
                or.fromBufferAttribute(u, m), tc(or, m, l, i, e, t, this)
            }
        } else {
            const d = Math.max(0, a.start),
                f = Math.min(u.count, a.start + a.count);
            for (let p = d, x = f; p < x; p++) or.fromBufferAttribute(u, p), tc(or, p, l, i, e, t, this)
        }
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
}

