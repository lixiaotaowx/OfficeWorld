function Gc(s) {
    let e, t, n, i = -1,
        r = 0;
    for (let c = 0; c < s.length; ++c) {
        const h = s[c];
        if (e === void 0 && (e = h.array.constructor), e !== h.array.constructor) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."), null;
        if (t === void 0 && (t = h.itemSize), t !== h.itemSize) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."), null;
        if (n === void 0 && (n = h.normalized), n !== h.normalized) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."), null;
        if (i === -1 && (i = h.gpuType), i !== h.gpuType) return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."), null;
        r += h.count * t
    }
    const a = new e(r),
        o = new Ft(a, t, n);
    let l = 0;
    for (let c = 0; c < s.length; ++c) {
        const h = s[c];
        if (h.isInterleavedBufferAttribute) {
            const u = l / t;
            for (let d = 0, f = h.count; d < f; d++)
                for (let p = 0; p < t; p++) {
                    const x = h.getComponent(d, p);
                    o.setComponent(d + u, p, x)
                }
        } else a.set(h.array, l);
        l += h.count * t
    }
    return i !== void 0 && (o.gpuType = i), o
}

