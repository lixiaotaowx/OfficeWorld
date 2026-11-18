function __(s, e, t, n) {
    let i;

    function r() {
        if (i !== void 0) return i;
        if (e.has("EXT_texture_filter_anisotropic") === !0) {
            const _ = e.get("EXT_texture_filter_anisotropic");
            i = s.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
        } else i = 0;
        return i
    }

    function a(_) {
        return !(_ !== ln && n.convert(_) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))
    }

    function o(_) {
        const T = _ === yn && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
        return !(_ !== Jt && _ !== jt && !T && n.convert(_) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))
    }

    function l(_) {
        if (_ === "highp") {
            if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0) return "highp";
            _ = "mediump"
        }
        return _ === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp"
    }
    let c = t.precision !== void 0 ? t.precision : "highp";
    const h = l(c);
    h !== c && (Ce("WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
    const u = t.reversedDepthBuffer === !0 && e.has("EXT_clip_control"),
        d = t.logarithmicDepthBuffer === !0 && u === !1;
    t.reversedDepthBuffer === !0 && u === !1 && Ce("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."), t.logarithmicDepthBuffer === !0 && u === !0 && Ce("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");
    const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),
        p = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
        x = s.getParameter(s.MAX_TEXTURE_SIZE),
        m = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),
        g = s.getParameter(s.MAX_VERTEX_ATTRIBS),
        M = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),
        E = s.getParameter(s.MAX_VARYING_VECTORS),
        v = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),
        A = s.getParameter(s.MAX_SAMPLES),
        b = s.getParameter(s.SAMPLES);
    return {
        isWebGL2: !0,
        getMaxAnisotropy: r,
        getMaxPrecision: l,
        textureFormatReadable: a,
        textureTypeReadable: o,
        precision: c,
        logarithmicDepthBuffer: d,
        reversedDepthBuffer: u,
        maxTextures: f,
        maxVertexTextures: p,
        maxTextureSize: x,
        maxCubemapSize: m,
        maxAttributes: g,
        maxVertexUniforms: M,
        maxVaryings: E,
        maxFragmentUniforms: v,
        maxSamples: A,
        samples: b
    }
}

