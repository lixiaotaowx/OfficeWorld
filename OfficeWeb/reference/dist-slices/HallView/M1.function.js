function M1(r) {
    var t;
    const e = R5.get(r);
    if (!e) return !1;
    if (e.disposed) return !0;
    e.disposed = !0;
    try {
        R9(r), r.clear()
    } finally {
        (t = e.release) == null || t.call(e), e.release = void 0
    }
    return !0
}
async function ho(r, e) {
    const t = await fetch(r);
    if (!t.ok) throw Error(`Model load failed: ${t.status}`);
    const s = await t.arrayBuffer(),
        i = (await F9.parseAsync(s, "")).scene,
        n = Dt == null ? void 0 : Dt.deref();
    try {
        if (!n || !crypto.subtle || !["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(l => n.extensions.has(l))) return i;
        const o = await crypto.subtle.digest("SHA-256", s),
            a = [...new Uint8Array(o)].map(l => l.toString(16).padStart(2, "0")).join("");
        await ro(i, e, a, async () => {
            const l = new J0().setWorkerLimit(1).detectSupport(n);
            try {
                return await l.loadAsync(no)
            } finally {
                l.dispose()
            }
        })
    } catch {}
    return i
}
async function uo(r, e) {
    const t = await fetch(r);
    if (!t.ok) throw Error(`Model load failed: ${t.status}`);
    const s = await t.arrayBuffer(),
        i = (await F9.parseAsync(s, "")).scene;
    try {
        if (!crypto.subtle) return i;
        const n = await crypto.subtle.digest("SHA-256", s),
            o = [...new Uint8Array(n)].map(l => l.toString(16).padStart(2, "0")).join("");
        lo(i, e, o);
        const a = Dt == null ? void 0 : Dt.deref();
        if (a && ["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(l => a.extensions.has(l))) {
            const l = new J0().setWorkerLimit(1).detectSupport(a);
            try {
                await Ao(i, e, o, A => l.loadAsync(A))
            } finally {
                l.dispose()
            }
        }
    } catch {}
    return i
}
