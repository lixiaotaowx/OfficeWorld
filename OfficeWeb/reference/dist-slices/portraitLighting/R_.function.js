function R_(s) {
    const e = {};

    function t(n) {
        if (e[n] !== void 0) return e[n];
        const i = s.getExtension(n);
        return e[n] = i, i
    }
    return {
        has: function(n) {
            return t(n) !== null
        },
        init: function() {
            t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent")
        },
        get: function(n) {
            const i = t(n);
            return i === null && Fi("WebGLRenderer: " + n + " extension not supported."), i
        }
    }
}

