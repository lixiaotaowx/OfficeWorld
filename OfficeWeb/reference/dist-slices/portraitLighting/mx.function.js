function mx(s, e) {
    function t(n, i = Yn) {
        let r;
        const a = Qe.getTransfer(i);
        if (n === Jt) return s.UNSIGNED_BYTE;
        if (n === Co) return s.UNSIGNED_SHORT_4_4_4_4;
        if (n === Lo) return s.UNSIGNED_SHORT_5_5_5_1;
        if (n === ch) return s.UNSIGNED_INT_5_9_9_9_REV;
        if (n === hh) return s.UNSIGNED_INT_10F_11F_11F_REV;
        if (n === oh) return s.BYTE;
        if (n === lh) return s.SHORT;
        if (n === Ss) return s.UNSIGNED_SHORT;
        if (n === Ro) return s.INT;
        if (n === Sn) return s.UNSIGNED_INT;
        if (n === jt) return s.FLOAT;
        if (n === yn) return s.HALF_FLOAT;
        if (n === uh) return s.ALPHA;
        if (n === dh) return s.RGB;
        if (n === ln) return s.RGBA;
        if (n === Qn) return s.DEPTH_COMPONENT;
        if (n === Kn) return s.DEPTH_STENCIL;
        if (n === Po) return s.RED;
        if (n === Io) return s.RED_INTEGER;
        if (n === ui) return s.RG;
        if (n === No) return s.RG_INTEGER;
        if (n === Do) return s.RGBA_INTEGER;
        if (n === _r || n === xr || n === vr || n === Mr)
            if (a === ct)
                if (r = e.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
                    if (n === _r) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                    if (n === xr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                    if (n === vr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
                    if (n === Mr) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT
                } else return null;
        else if (r = e.get("WEBGL_compressed_texture_s3tc"), r !== null) {
            if (n === _r) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
            if (n === xr) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
            if (n === vr) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
            if (n === Mr) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT
        } else return null;
        if (n === Oa || n === Ba || n === za || n === ka)
            if (r = e.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
                if (n === Oa) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (n === Ba) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (n === za) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (n === ka) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            } else return null;
        if (n === Ha || n === Ga || n === Va || n === Wa || n === Xa || n === Tr || n === qa)
            if (r = e.get("WEBGL_compressed_texture_etc"), r !== null) {
                if (n === Ha || n === Ga) return a === ct ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
                if (n === Va) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
                if (n === Wa) return r.COMPRESSED_R11_EAC;
                if (n === Xa) return r.COMPRESSED_SIGNED_R11_EAC;
                if (n === Tr) return r.COMPRESSED_RG11_EAC;
                if (n === qa) return r.COMPRESSED_SIGNED_RG11_EAC
            } else return null;
        if (n === Ya || n === Ka || n === Ja || n === Za || n === $a || n === Qa || n === ja || n === eo || n === to || n === no || n === io || n === so || n === ro || n === ao)
            if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
                if (n === Ya) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
                if (n === Ka) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
                if (n === Ja) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
                if (n === Za) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
                if (n === $a) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
                if (n === Qa) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
                if (n === ja) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
                if (n === eo) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
                if (n === to) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
                if (n === no) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
                if (n === io) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
                if (n === so) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
                if (n === ro) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
                if (n === ao) return a === ct ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR
            } else return null;
        if (n === oo || n === lo || n === co)
            if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
                if (n === oo) return a === ct ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
                if (n === lo) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
                if (n === co) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT
            } else return null;
        if (n === ho || n === uo || n === Er || n === fo)
            if (r = e.get("EXT_texture_compression_rgtc"), r !== null) {
                if (n === ho) return r.COMPRESSED_RED_RGTC1_EXT;
                if (n === uo) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
                if (n === Er) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
                if (n === fo) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT
            } else return null;
        return n === ki ? s.UNSIGNED_INT_24_8 : s[n] !== void 0 ? s[n] : null
    }
    return {
        convert: t
    }
}
