function w_(s) {
    let e = new WeakMap,
        t = new WeakMap,
        n = null;

    function i(d, f = !1) {
        return d == null ? null : f ? a(d) : r(d)
    }

    function r(d) {
        if (d && d.isTexture) {
            const f = d.mapping;
            if (f === Vr || f === Wr)
                if (e.has(d)) {
                    const p = e.get(d).texture;
                    return o(p, d.mapping)
                } else {
                    const p = d.image;
                    if (p && p.height > 0) {
                        const x = new tl(p.height);
                        return x.fromEquirectangularTexture(s, d), e.set(d, x), d.addEventListener("dispose", c), o(x.texture, d.mapping)
                    } else return null
                }
        }
        return d
    }

    function a(d) {
        if (d && d.isTexture && d.isPMREMTexture !== !0) {
            const f = d.mapping,
                p = f === Vr || f === Wr,
                x = f === hi || f === Ms;
            if (p || x) {
                let m = t.get(d);
                const g = m !== void 0 ? m.texture.pmremVersion : 0;
                if (d.isRenderTargetTexture && d.pmremVersion !== g) return n === null && (n = new Ns(s)), m = p ? n.fromEquirectangular(d, m) : n.fromCubemap(d, m), m.texture.pmremVersion = d.pmremVersion, t.set(d, m), m.texture;
                if (m !== void 0) return m.texture;
                {
                    const M = d.image;
                    return p && M && M.height > 0 || x && M && l(M) ? (n === null && (n = new Ns(s)), m = p ? n.fromEquirectangular(d) : n.fromCubemap(d), m.texture.pmremVersion = d.pmremVersion, t.set(d, m), d.addEventListener("dispose", h), m.texture) : null
                }
            }
        }
        return d
    }

    function o(d, f) {
        return f === Vr ? d.mapping = hi : f === Wr && (d.mapping = Ms), d
    }

    function l(d) {
        let f = 0;
        const p = 6;
        for (let x = 0; x < p; x++) d[x] !== void 0 && f++;
        return f === p
    }

    function c(d) {
        const f = d.target;
        f.removeEventListener("dispose", c);
        const p = e.get(f);
        p !== void 0 && (e.delete(f), p.dispose())
    }

    function h(d) {
        const f = d.target;
        f.removeEventListener("dispose", h);
        const p = t.get(f);
        p !== void 0 && (t.delete(f), p.dispose())
    }

    function u() {
        e = new WeakMap, t = new WeakMap, n !== null && (n.dispose(), n = null)
    }
    return {
        get: i,
        dispose: u
    }
}

