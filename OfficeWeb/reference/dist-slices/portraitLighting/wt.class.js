class wt extends jn {
    constructor() {
        super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
            value: Jd++
        }), this.uuid = hn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.indirectOffset = 0, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }, this.userData = {}, this._transformed = !1
    }
    getIndex() {
        return this.index
    }
    setIndex(e) {
        return Array.isArray(e) ? this.index = new(cd(e) ? Eh : Th)(e, 1) : this.index = e, this
    }
    setIndirect(e, t = 0) {
        return this.indirect = e, this.indirectOffset = t, this
    }
    getIndirect() {
        return this.indirect
    }
    getAttribute(e) {
        return this.attributes[e]
    }
    setAttribute(e, t) {
        return this.attributes[e] = t, this
    }
    deleteAttribute(e) {
        return delete this.attributes[e], this
    }
    hasAttribute(e) {
        return this.attributes[e] !== void 0
    }
    addGroup(e, t, n = 0) {
        this.groups.push({
            start: e,
            count: t,
            materialIndex: n
        })
    }
    clearGroups() {
        this.groups = []
    }
    setDrawRange(e, t) {
        this.drawRange.start = e, this.drawRange.count = t
    }
    applyMatrix4(e) {
        const t = this.attributes.position;
        t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
        const n = this.attributes.normal;
        if (n !== void 0) {
            const r = new He().getNormalMatrix(e);
            n.applyNormalMatrix(r), n.needsUpdate = !0
        }
        const i = this.attributes.tangent;
        return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this._transformed = !0, this
    }
    applyQuaternion(e) {
        return $t.makeRotationFromQuaternion(e), this.applyMatrix4($t), this
    }
    rotateX(e) {
        return $t.makeRotationX(e), this.applyMatrix4($t), this
    }
    rotateY(e) {
        return $t.makeRotationY(e), this.applyMatrix4($t), this
    }
    rotateZ(e) {
        return $t.makeRotationZ(e), this.applyMatrix4($t), this
    }
    translate(e, t, n) {
        return $t.makeTranslation(e, t, n), this.applyMatrix4($t), this
    }
    scale(e, t, n) {
        return $t.makeScale(e, t, n), this.applyMatrix4($t), this
    }
    lookAt(e) {
        return ca.lookAt(e), ca.updateMatrix(), this.applyMatrix4(ca.matrix), this
    }
    center() {
        return this.computeBoundingBox(), this.boundingBox.getCenter(Ei).negate(), this.translate(Ei.x, Ei.y, Ei.z), this
    }
    setFromPoints(e) {
        const t = this.getAttribute("position");
        if (t === void 0) {
            const n = [];
            for (let i = 0, r = e.length; i < r; i++) {
                const a = e[i];
                n.push(a.x, a.y, a.z || 0)
            }
            this.setAttribute("position", new ut(n, 3))
        } else {
            const n = Math.min(e.length, t.count);
            for (let i = 0; i < n; i++) {
                const r = e[i];
                t.setXYZ(i, r.x, r.y, r.z || 0)
            }
            e.length > t.count && Ce("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), t.needsUpdate = !0
        }
        return this
    }
    computeBoundingBox() {
        this.boundingBox === null && (this.boundingBox = new un);
        const e = this.attributes.position,
            t = this.morphAttributes.position;
        if (e && e.isGLBufferAttribute) {
            ze("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new N(-1 / 0, -1 / 0, -1 / 0), new N(1 / 0, 1 / 0, 1 / 0));
            return
        }
        if (e !== void 0) {
            if (this.boundingBox.setFromBufferAttribute(e), t)
                for (let n = 0, i = t.length; n < i; n++) {
                    const r = t[n];
                    Yt.setFromBufferAttribute(r), this.morphTargetsRelative ? (Dt.addVectors(this.boundingBox.min, Yt.min), this.boundingBox.expandByPoint(Dt), Dt.addVectors(this.boundingBox.max, Yt.max), this.boundingBox.expandByPoint(Dt)) : (this.boundingBox.expandByPoint(Yt.min), this.boundingBox.expandByPoint(Yt.max))
                }
        } else this.boundingBox.makeEmpty();
        (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && ze('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this)
    }
    computeBoundingSphere() {
        this.boundingSphere === null && (this.boundingSphere = new En);
        const e = this.attributes.position,
            t = this.morphAttributes.position;
        if (e && e.isGLBufferAttribute) {
            ze("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N, 1 / 0);
            return
        }
        if (e) {
            const n = this.boundingSphere.center;
            if (Yt.setFromBufferAttribute(e), t)
                for (let r = 0, a = t.length; r < a; r++) {
                    const o = t[r];
                    ts.setFromBufferAttribute(o), this.morphTargetsRelative ? (Dt.addVectors(Yt.min, ts.min), Yt.expandByPoint(Dt), Dt.addVectors(Yt.max, ts.max), Yt.expandByPoint(Dt)) : (Yt.expandByPoint(ts.min), Yt.expandByPoint(ts.max))
                }
            Yt.getCenter(n);
            let i = 0;
            for (let r = 0, a = e.count; r < a; r++) Dt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(Dt));
            if (t)
                for (let r = 0, a = t.length; r < a; r++) {
                    const o = t[r],
                        l = this.morphTargetsRelative;
                    for (let c = 0, h = o.count; c < h; c++) Dt.fromBufferAttribute(o, c), l && (Ei.fromBufferAttribute(e, c), Dt.add(Ei)), i = Math.max(i, n.distanceToSquared(Dt))
                }
            this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && ze('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this)
        }
    }
    computeTangents() {
        const e = this.index,
            t = this.attributes;
        if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
            ze("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
            return
        }
        const n = t.position,
            i = t.normal,
            r = t.uv;
        let a = this.getAttribute("tangent");
        (a === void 0 || a.count !== n.count) && (a = new Ft(new Float32Array(4 * n.count), 4), this.setAttribute("tangent", a));
        const o = [],
            l = [],
            c = new Uint8Array(n.count);
        for (let I = 0; I < n.count; I++) o[I] = new N, l[I] = new N;
        const h = new N,
            u = new N,
            d = new N,
            f = new re,
            p = new re,
            x = new re,
            m = new N,
            g = new N;

        function M(I, R, D) {
            c[I] = c[R] = c[D] = 1, h.fromBufferAttribute(n, I), u.fromBufferAttribute(n, R), d.fromBufferAttribute(n, D), f.fromBufferAttribute(r, I), p.fromBufferAttribute(r, R), x.fromBufferAttribute(r, D), u.sub(h), d.sub(h), p.sub(f), x.sub(f);
            const F = 1 / (p.x * x.y - x.x * p.y);
            isFinite(F) && (m.copy(u).multiplyScalar(x.y).addScaledVector(d, -p.y).multiplyScalar(F), g.copy(d).multiplyScalar(p.x).addScaledVector(u, -x.x).multiplyScalar(F), o[I].add(m), o[R].add(m), o[D].add(m), l[I].add(g), l[R].add(g), l[D].add(g))
        }
        let E = this.groups;
        E.length === 0 && (E = [{
            start: 0,
            count: e.count
        }]);
        for (let I = 0, R = E.length; I < R; ++I) {
            const D = E[I],
                F = D.start,
                V = D.count;
            for (let L = F, k = F + V; L < k; L += 3) M(e.getX(L + 0), e.getX(L + 1), e.getX(L + 2))
        }
        const v = new N,
            A = new N,
            b = new N,
            _ = new N;

        function T(I) {
            b.fromBufferAttribute(i, I), _.copy(b);
            const R = o[I];
            v.copy(R), v.sub(b.multiplyScalar(b.dot(R))).normalize(), A.crossVectors(_, R);
            const F = A.dot(l[I]) < 0 ? -1 : 1;
            a.setXYZW(I, v.x, v.y, v.z, F)
        }
        for (let I = 0, R = n.count; I < R; ++I) c[I] && T(I);
        this._transformed = !0
    }
    computeVertexNormals() {
        const e = this.index,
            t = this.getAttribute("position");
        if (t !== void 0) {
            let n = this.getAttribute("normal");
            if (n === void 0 || n.count !== t.count) n = new Ft(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
            else
                for (let d = 0, f = n.count; d < f; d++) n.setXYZ(d, 0, 0, 0);
            const i = new N,
                r = new N,
                a = new N,
                o = new N,
                l = new N,
                c = new N,
                h = new N,
                u = new N;
            if (e)
                for (let d = 0, f = e.count; d < f; d += 3) {
                    const p = e.getX(d + 0),
                        x = e.getX(d + 1),
                        m = e.getX(d + 2);
                    i.fromBufferAttribute(t, p), r.fromBufferAttribute(t, x), a.fromBufferAttribute(t, m), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), o.fromBufferAttribute(n, p), l.fromBufferAttribute(n, x), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(p, o.x, o.y, o.z), n.setXYZ(x, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z)
                } else
                    for (let d = 0, f = t.count; d < f; d += 3) i.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
            this.normalizeNormals(), n.needsUpdate = !0
        }
    }
    normalizeNormals() {
        const e = this.attributes.normal;
        for (let t = 0, n = e.count; t < n; t++) Dt.fromBufferAttribute(e, t), Dt.normalize(), e.setXYZ(t, Dt.x, Dt.y, Dt.z)
    }
    toNonIndexed() {
        function e(o, l) {
            const c = o.array,
                h = o.itemSize,
                u = o.normalized,
                d = new c.constructor(l.length * h);
            let f = 0,
                p = 0;
            for (let x = 0, m = l.length; x < m; x++) {
                o.isInterleavedBufferAttribute ? f = l[x] * o.data.stride + o.offset : f = l[x] * h;
                for (let g = 0; g < h; g++) d[p++] = c[f++]
            }
            return new Ft(d, h, u)
        }
        if (this.index === null) return Ce("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
        const t = new wt,
            n = this.index.array,
            i = this.attributes;
        for (const o in i) {
            const l = i[o],
                c = e(l, n);
            t.setAttribute(o, c)
        }
        const r = this.morphAttributes;
        for (const o in r) {
            const l = [],
                c = r[o];
            for (let h = 0, u = c.length; h < u; h++) {
                const d = c[h],
                    f = e(d, n);
                l.push(f)
            }
            t.morphAttributes[o] = l
        }
        t.morphTargetsRelative = this.morphTargetsRelative;
        const a = this.groups;
        for (let o = 0, l = a.length; o < l; o++) {
            const c = a[o];
            t.addGroup(c.start, c.count, c.materialIndex)
        }
        return t
    }
    toJSON() {
        const e = {
            metadata: {
                version: 4.7,
                type: "BufferGeometry",
                generator: "BufferGeometry.toJSON"
            }
        };
        if (e.uuid = this.uuid, e.type = this.parameters !== void 0 && this._transformed === !0 ? "BufferGeometry" : this.type, e.name = this.name, Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0 && this._transformed !== !0) {
            const l = this.parameters;
            for (const c in l) l[c] !== void 0 && (e[c] = l[c]);
            return e
        }
        e.data = {
            attributes: {}
        };
        const t = this.index;
        t !== null && (e.data.index = {
            type: t.array.constructor.name,
            array: Array.prototype.slice.call(t.array)
        });
        const n = this.attributes;
        for (const l in n) {
            const c = n[l];
            e.data.attributes[l] = c.toJSON(e.data)
        }
        const i = {};
        let r = !1;
        for (const l in this.morphAttributes) {
            const c = this.morphAttributes[l],
                h = [];
            for (let u = 0, d = c.length; u < d; u++) {
                const f = c[u];
                h.push(f.toJSON(e.data))
            }
            h.length > 0 && (i[l] = h, r = !0)
        }
        r && (e.data.morphAttributes = i, e.data.morphTargetsRelative = this.morphTargetsRelative);
        const a = this.groups;
        a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
        const o = this.boundingSphere;
        return o !== null && (e.data.boundingSphere = o.toJSON()), e
    }
    clone() {
        return new this.constructor().copy(this)
    }
    copy(e) {
        this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
        const t = {};
        this.name = e.name;
        const n = e.index;
        n !== null && this.setIndex(n.clone());
        const i = e.attributes;
        for (const c in i) {
            const h = i[c];
            this.setAttribute(c, h.clone(t))
        }
        const r = e.morphAttributes;
        for (const c in r) {
            const h = [],
                u = r[c];
            for (let d = 0, f = u.length; d < f; d++) h.push(u[d].clone(t));
            this.morphAttributes[c] = h
        }
        this.morphTargetsRelative = e.morphTargetsRelative;
        const a = e.groups;
        for (let c = 0, h = a.length; c < h; c++) {
            const u = a[c];
            this.addGroup(u.start, u.count, u.materialIndex)
        }
        const o = e.boundingBox;
        o !== null && (this.boundingBox = o.clone());
        const l = e.boundingSphere;
        return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this._transformed = e._transformed, this
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
}
