const D5 = "3060aecc-0b28-431f-8a5a-3b68a72ab633.glb",
    io = "9706055dfc4535bf204bc567e06c76eb138aff87c15d20738e10719328ade95b",
    no = "/assets/basketball-court-9706055d.ktx2";
async function ro(r, e, t, s) {
    var A, c, h;
    if (e !== D5 || t !== io) return !1;
    const i = new Set;
    r.traverse(u => {
        var g;
        const d = u;
        if (d.isMesh)
            for (const p of Array.isArray(d.material) ? d.material : [d.material]) {
                const I = p,
                    C = (g = I.map) == null ? void 0 : g.image;
                (C == null ? void 0 : C.width) === 4096 && C.height === 2048 && i.add(I)
            }
    });
    const n = new Set([...i].map(u => u.map).filter(u => !!u));
    if (n.size !== 1) return !1;
    const o = [...n][0];
    let a;
    try {
        a = await s()
    } catch {
        return !1
    }
    if (!a.isCompressedTexture || ((A = a.image) == null ? void 0 : A.width) !== 4096 || ((c = a.image) == null ? void 0 : c.height) !== 2048 || a.mipmaps.length < 2) return a.dispose(), !1;
    a.colorSpace = o.colorSpace, a.flipY = o.flipY, a.wrapS = o.wrapS, a.wrapT = o.wrapT, a.magFilter = o.magFilter, a.minFilter = o.minFilter, a.anisotropy = o.anisotropy, a.channel = o.channel, a.offset.copy(o.offset), a.repeat.copy(o.repeat), a.center.copy(o.center), a.rotation = o.rotation, a.matrixAutoUpdate = o.matrixAutoUpdate, a.matrix.copy(o.matrix);
    for (const u of i) u.map = a, u.needsUpdate = !0;
    o.dispose();
    const l = o.image;
    return (h = l == null ? void 0 : l.close) == null || h.call(l), !0
}
