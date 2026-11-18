function Xi(s) {
    const e = {};
    for (const t in s) {
        e[t] = {};
        for (const n in s[t]) {
            const i = s[t][n];
            if (cc(i)) i.isRenderTargetTexture ? (Ce("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = i.clone();
            else if (Array.isArray(i))
                if (cc(i[0])) {
                    const r = [];
                    for (let a = 0, o = i.length; a < o; a++) r[a] = i[a].clone();
                    e[t][n] = r
                } else e[t][n] = i.slice();
            else e[t][n] = i
        }
    }
    return e
}

