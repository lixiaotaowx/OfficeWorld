function x_(s) {
    const e = this;
    let t = null,
        n = 0,
        i = !1,
        r = !1;
    const a = new Xn,
        o = new He,
        l = {
            value: null,
            needsUpdate: !1
        };
    this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
        const f = u.length !== 0 || d || n !== 0 || i;
        return i = d, n = u.length, f
    }, this.beginShadows = function() {
        r = !0, h(null)
    }, this.endShadows = function() {
        r = !1
    }, this.setGlobalState = function(u, d) {
        t = h(u, d, 0)
    }, this.setState = function(u, d, f) {
        const p = u.clippingPlanes,
            x = u.clipIntersection,
            m = u.clipShadows,
            g = s.get(u);
        if (!i || p === null || p.length === 0 || r && !m) r ? h(null) : c();
        else {
            const M = r ? 0 : n,
                E = M * 4;
            let v = g.clippingState || null;
            l.value = v, v = h(p, d, E, f);
            for (let A = 0; A !== E; ++A) v[A] = t[A];
            g.clippingState = v, this.numIntersection = x ? this.numPlanes : 0, this.numPlanes += M
        }
    };

    function c() {
        l.value !== t && (l.value = t, l.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0
    }

    function h(u, d, f, p) {
        const x = u !== null ? u.length : 0;
        let m = null;
        if (x !== 0) {
            if (m = l.value, p !== !0 || m === null) {
                const g = f + x * 4,
                    M = d.matrixWorldInverse;
                o.getNormalMatrix(M), (m === null || m.length < g) && (m = new Float32Array(g));
                for (let E = 0, v = f; E !== x; ++E, v += 4) a.copy(u[E]).applyMatrix4(M, o), a.normal.toArray(m, v), m[v + 3] = a.constant
            }
            l.value = m, l.needsUpdate = !0
        }
        return e.numPlanes = x, e.numIntersection = 0, m
    }
}
