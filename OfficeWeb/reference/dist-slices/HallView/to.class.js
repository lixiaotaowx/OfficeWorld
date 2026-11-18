class to {
    constructor(e) {
        this.writer = e, this.name = "EXT_mesh_gpu_instancing"
    }
    writeNode(e, t) {
        if (!e.isInstancedMesh) return;
        const s = this.writer,
            i = e,
            n = new Float32Array(i.count * 3),
            o = new Float32Array(i.count * 4),
            a = new Float32Array(i.count * 3),
            l = new Mt,
            A = new T,
            c = new Ve,
            h = new T;
        for (let d = 0; d < i.count; d++) i.getMatrixAt(d, l), l.decompose(A, c, h), A.toArray(n, d * 3), c.toArray(o, d * 4), h.toArray(a, d * 3);
        const u = {
            TRANSLATION: s.processAccessor(new me(n, 3)),
            ROTATION: s.processAccessor(new me(o, 4)),
            SCALE: s.processAccessor(new me(a, 3))
        };
        i.instanceColor && (u._COLOR_0 = s.processAccessor(i.instanceColor)), t.extensions = t.extensions || {}, t.extensions[this.name] = {
            attributes: u
        }, s.extensionsUsed[this.name] = !0, s.extensionsRequired[this.name] = !0
    }
}
Q1.Utils = {
    insertKeyframe: function(r, e) {
        const s = r.getValueSize(),
            i = new r.TimeBufferType(r.times.length + 1),
            n = new r.ValueBufferType(r.values.length + s),
            o = r.createInterpolant(new r.ValueBufferType(s));
        let a;
        if (r.times.length === 0) {
            i[0] = e;
            for (let l = 0; l < s; l++) n[l] = 0;
            a = 0
        } else if (e < r.times[0]) {
            if (Math.abs(r.times[0] - e) < .001) return 0;
            i[0] = e, i.set(r.times, 1), n.set(o.evaluate(e), 0), n.set(r.values, s), a = 0
        } else if (e > r.times[r.times.length - 1]) {
            if (Math.abs(r.times[r.times.length - 1] - e) < .001) return r.times.length - 1;
            i[i.length - 1] = e, i.set(r.times, 0), n.set(r.values, 0), n.set(o.evaluate(e), r.values.length), a = i.length - 1
        } else
            for (let l = 0; l < r.times.length; l++) {
                if (Math.abs(r.times[l] - e) < .001) return l;
                if (r.times[l] < e && r.times[l + 1] > e) {
                    i.set(r.times.slice(0, l + 1), 0), i[l + 1] = e, i.set(r.times.slice(l + 1), l + 2), n.set(r.values.slice(0, (l + 1) * s), 0), n.set(o.evaluate(e), (l + 1) * s), n.set(r.values.slice((l + 1) * s), (l + 2) * s), a = l + 1;
                    break
                }
            }
        return r.times = i, r.values = n, a
    },
    mergeMorphTargetTracks: function(r, e) {
        const t = [],
            s = {},
            i = r.tracks;
        for (let n = 0; n < i.length; ++n) {
            let o = i[n];
            const a = y9.parseTrackName(o.name),
                l = y9.findNode(e, a.nodeName);
            if (a.propertyName !== "morphTargetInfluences" || a.propertyIndex === void 0) {
                t.push(o);
                continue
            }
            if (o.createInterpolant !== o.InterpolantFactoryMethodDiscrete && o.createInterpolant !== o.InterpolantFactoryMethodLinear) {
                if (o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");
                console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."), o = o.clone(), o.setInterpolation(w3)
            }
            const A = l.morphTargetInfluences.length,
                c = l.morphTargetDictionary[a.propertyIndex];
            if (c === void 0) throw new Error("THREE.GLTFExporter: Morph target name not found: " + a.propertyIndex);
            let h;
            if (s[l.uuid] === void 0) {
                h = o.clone();
                const d = new h.ValueBufferType(A * h.times.length);
                for (let g = 0; g < h.times.length; g++) d[g * A + c] = h.values[g];
                h.name = (a.nodeName || "") + ".morphTargetInfluences", h.values = d, s[l.uuid] = h, t.push(h);
                continue
            }
            const u = o.createInterpolant(new o.ValueBufferType(1));
            h = s[l.uuid];
            for (let d = 0; d < h.times.length; d++) h.values[d * A + c] = u.evaluate(h.times[d]);
            for (let d = 0; d < o.times.length; d++) {
                const g = this.insertKeyframe(h, o.times[d]);
                h.values[g * A + c] = o.values[d]
            }
        }
        return r.tracks = t, r
    },
    toTypedBufferAttribute: function(r, e) {
        const t = new me(new e(r.count * r.itemSize), r.itemSize, !1);
        if (!r.normalized && !r.isInterleavedBufferAttribute) return t.array.set(r.array), t;
        for (let s = 0, i = r.count; s < i; s++)
            for (let n = 0; n < r.itemSize; n++) t.setComponent(s, n, r.getComponent(s, n));
        return t
    }
};
