const d8 = new w4(async () => {
    var n, o;
    const r = kt == null ? void 0 : kt.deref();
    if (!r || !["WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_texture_compression_bptc", "WEBGL_compressed_texture_pvrtc"].some(a => r.extensions.has(a))) throw Error("Compressed billiards textures are unavailable");
    const e = new On,
        t = new J0(e).setWorkerLimit(1).detectSupport(r);
    let s = !1,
        i;
    try {
        const a = t.loadAsync(h8).then(c => {
                if (s) throw c.dispose(), Error("Billiards atlas timed out");
                return c
            }),
            l = new Promise((c, h) => {
                i = setTimeout(() => {
                    s = !0, e.abort(), h(Error("Billiards atlas timed out"))
                }, 8e3)
            }),
            A = await Promise.race([a, l]);
        if (!A.isCompressedTexture || ((n = A.image) == null ? void 0 : n.width) !== 2048 || ((o = A.image) == null ? void 0 : o.height) !== 1024 || A.mipmaps.length !== 12) throw A.dispose(), Error("Invalid billiards texture atlas");
        return A.colorSpace = oe, A.flipY = !1, A.anisotropy = 4, A
    } finally {
        i && clearTimeout(i), t.dispose()
    }
}, r => r.dispose());

