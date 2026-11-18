function I_(s, e, t) {
    const n = new WeakMap,
        i = new ht;

    function r(a, o, l) {
        const c = a.morphTargetInfluences,
            h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color,
            u = h !== void 0 ? h.length : 0;
        let d = n.get(o);
        if (d === void 0 || d.count !== u) {
            let I = function() {
                _.dispose(), n.delete(o), o.removeEventListener("dispose", I)
            };
            d !== void 0 && d.texture.dispose();
            const f = o.morphAttributes.position !== void 0,
                p = o.morphAttributes.normal !== void 0,
                x = o.morphAttributes.color !== void 0,
                m = o.morphAttributes.position || [],
                g = o.morphAttributes.normal || [],
                M = o.morphAttributes.color || [];
            let E = 0;
            f === !0 && (E = 1), p === !0 && (E = 2), x === !0 && (E = 3);
            let v = o.attributes.position.count * E,
                A = 1;
            v > e.maxTextureSize && (A = Math.ceil(v / e.maxTextureSize), v = e.maxTextureSize);
            const b = new Float32Array(v * A * 4 * u),
                _ = new Mh(b, v, A, u);
            _.type = jt, _.needsUpdate = !0;
            const T = E * 4;
            for (let R = 0; R < u; R++) {
                const D = m[R],
                    F = g[R],
                    V = M[R],
                    L = v * A * 4 * R;
                for (let k = 0; k < D.count; k++) {
                    const X = k * T;
                    f === !0 && (i.fromBufferAttribute(D, k), b[L + X + 0] = i.x, b[L + X + 1] = i.y, b[L + X + 2] = i.z, b[L + X + 3] = 0), p === !0 && (i.fromBufferAttribute(F, k), b[L + X + 4] = i.x, b[L + X + 5] = i.y, b[L + X + 6] = i.z, b[L + X + 7] = 0), x === !0 && (i.fromBufferAttribute(V, k), b[L + X + 8] = i.x, b[L + X + 9] = i.y, b[L + X + 10] = i.z, b[L + X + 11] = V.itemSize === 4 ? i.w : 1)
                }
            }
            d = {
                count: u,
                texture: _,
                size: new re(v, A)
            }, n.set(o, d), o.addEventListener("dispose", I)
        }
        if (a.isInstancedMesh === !0 && a.morphTexture !== null) l.getUniforms().setValue(s, "morphTexture", a.morphTexture, t);
        else {
            let f = 0;
            for (let x = 0; x < c.length; x++) f += c[x];
            const p = o.morphTargetsRelative ? 1 : 1 - f;
            l.getUniforms().setValue(s, "morphTargetBaseInfluence", p), l.getUniforms().setValue(s, "morphTargetInfluences", c)
        }
        l.getUniforms().setValue(s, "morphTargetsTexture", d.texture, t), l.getUniforms().setValue(s, "morphTargetsTextureSize", d.size)
    }
    return {
        update: r
    }
}

