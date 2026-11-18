function lo(r, e, t) {
    if (e !== fi || t !== L5) return !1;
    const s = [];
    if (r.traverse(A => {
            const c = A;
            c.isMesh && s.push(c)
        }), s.length !== 1 || s[0].isSkinnedMesh) return !1;
    const i = s[0].geometry,
        n = ["position", "normal", "uv"],
        o = n.map(A => i.getAttribute(A));
    if (Object.keys(i.morphAttributes).length || o.some((A, c) => !(A instanceof me) || A.normalized || !(A.array instanceof Float32Array) || A.count !== ao || A.itemSize !== (c === 2 ? 2 : 3))) return !1;
    const a = o;
    for (let A = 0; A < a.length; A++)
        for (const c of a[A].array)
            if (!Number.isFinite(c) || c < (A === 2 ? 0 : -1) || c > 1) return !1;
    const l = a.map((A, c) => {
        const h = c === 2 ? 65535 : 32767,
            u = c === 2 ? new Uint16Array(A.array.length) : new Int16Array(A.array.length);
        for (let g = 0; g < u.length; g++) u[g] = Math.round(A.array[g] * h);
        const d = new me(u, A.itemSize, !0);
        return d.name = A.name, d.setUsage(A.usage), d
    });
    return n.forEach((A, c) => i.setAttribute(A, l[c])), i.computeBoundingBox(), i.computeBoundingSphere(), !0
}
async function Ao(r, e, t, s) {
    var l, A, c, h;
    if (e !== fi || t !== L5) return !1;
    const i = [];
    if (r.traverse(u => {
            const d = u;
            d.isMesh && i.push(d)
        }), i.length !== 1 || Array.isArray(i[0].material)) return !1;
    const n = i[0].material;
    if (!n.isMeshStandardMaterial || !n.map || !n.normalMap || !n.roughnessMap || n.metalnessMap !== n.roughnessMap) return !1;
    const o = [n.map, n.normalMap, n.roughnessMap];
    if (new Set(o).size !== 3 || o.some(u => {
            const d = u.image;
            return (d == null ? void 0 : d.width) !== 1024 || (d == null ? void 0 : d.height) !== 1024
        })) return !1;
    const a = [];
    try {
        for (const u of oo) {
            const d = await s(u);
            if (a.push(d), !d.isCompressedTexture || ((l = d.image) == null ? void 0 : l.width) !== 1024 || ((A = d.image) == null ? void 0 : A.height) !== 1024 || d.mipmaps.length !== 11) throw Error("Unexpected compressed texture")
        }
    } catch {
        for (const u of a) u.dispose();
        return !1
    }
    a.forEach((u, d) => {
        const g = o[d];
        u.colorSpace = g.colorSpace, u.flipY = g.flipY, u.wrapS = g.wrapS, u.wrapT = g.wrapT, u.magFilter = g.magFilter, u.minFilter = g.minFilter, u.anisotropy = g.anisotropy, u.channel = g.channel, u.offset.copy(g.offset), u.repeat.copy(g.repeat), u.center.copy(g.center), u.rotation = g.rotation, u.matrixAutoUpdate = g.matrixAutoUpdate, u.matrix.copy(g.matrix)
    }), [n.map, n.normalMap, n.roughnessMap, n.metalnessMap] = [a[0], a[1], a[2], a[2]], n.needsUpdate = !0;
    for (const u of o) u.dispose(), (h = (c = u.image) == null ? void 0 : c.close) == null || h.call(c);
    return !0
}
