function zc() {
    const s = [];
    let e = 0;
    const t = [],
        n = [],
        i = [];

    function r() {
        e = 0, t.length = 0, n.length = 0, i.length = 0
    }

    function a(d) {
        let f = 0;
        return d.isInstancedMesh && (f += 2), d.isSkinnedMesh && (f += 1), f
    }

    function o(d, f, p, x, m, g) {
        let M = s[e];
        return M === void 0 ? (M = {
            id: d.id,
            object: d,
            geometry: f,
            material: p,
            materialVariant: a(d),
            groupOrder: x,
            renderOrder: d.renderOrder,
            z: m,
            group: g
        }, s[e] = M) : (M.id = d.id, M.object = d, M.geometry = f, M.material = p, M.materialVariant = a(d), M.groupOrder = x, M.renderOrder = d.renderOrder, M.z = m, M.group = g), e++, M
    }

    function l(d, f, p, x, m, g, M) {
        M.reversedDepth === !0 && (m = -m);
        const E = o(d, f, p, x, m, g);
        p.transmission > 0 ? n.push(E) : p.transparent === !0 ? i.push(E) : t.push(E)
    }

    function c(d, f, p, x, m, g) {
        const M = o(d, f, p, x, m, g);
        p.transmission > 0 ? n.unshift(M) : p.transparent === !0 ? i.unshift(M) : t.unshift(M)
    }

    function h(d, f) {
        t.length > 1 && t.sort(d || ex), n.length > 1 && n.sort(f || Bc), i.length > 1 && i.sort(f || Bc)
    }

    function u() {
        for (let d = e, f = s.length; d < f; d++) {
            const p = s[d];
            if (p.id === null) break;
            p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null
        }
    }
    return {
        opaque: t,
        transmissive: n,
        transparent: i,
        init: r,
        push: l,
        unshift: c,
        finish: u,
        sort: h
    }
}

