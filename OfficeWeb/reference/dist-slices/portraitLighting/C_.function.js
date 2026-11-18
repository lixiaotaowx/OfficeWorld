function C_(s, e, t, n) {
    const i = {},
        r = new WeakMap,
        a = new FinalizationRegistry(p => delete i[p]);

    function o(p) {
        l(p.target)
    }

    function l(p) {
        p.index !== null && e.remove(p.index);
        for (const m in p.attributes) e.remove(p.attributes[m]);
        p.removeEventListener("dispose", o), delete i[p.id], a.unregister(p);
        const x = r.get(p);
        x && (e.remove(x), r.delete(p)), n.releaseStatesOfGeometry(p), p.isInstancedBufferGeometry === !0 && delete p._maxInstanceCount, t.memory.geometries--
    }

    function c(p, x) {
        return i[x.id] !== void 0 || (x.addEventListener("dispose", o), i[x.id] = new WeakRef(x), a.register(x, x.id, x), t.memory.geometries++), x
    }

    function h(p) {
        const x = p.attributes;
        for (const m in x) e.update(x[m], s.ARRAY_BUFFER)
    }

    function u(p) {
        const x = p.index,
            m = p.attributes.position;
        let g = 0;
        if (m === void 0) return;
        const M = x !== null ? x.array.length : m.array.length / 3 - 1,
            E = m.count >= 65535 ? Eh : Th,
            v = new E(Math.ceil(M / 3) * 6, 1),
            A = v.array;
        if (x !== null) {
            const _ = x.array;
            g = x.version;
            for (let T = 0, I = 0; T < M; T += 3) {
                const R = _[T + 0],
                    D = _[T + 1],
                    F = _[T + 2];
                A[I++] = R, A[I++] = D, A[I++] = D, A[I++] = F, A[I++] = F, A[I++] = R
            }
        } else {
            g = m.version;
            for (let _ = 0, T = 0; _ < M; _ += 3) {
                const I = _ + 0,
                    R = _ + 1,
                    D = _ + 2;
                A[T++] = I, A[T++] = R, A[T++] = R, A[T++] = D, A[T++] = D, A[T++] = I
            }
        }
        v.version = g;
        const b = r.get(p);
        b && e.remove(b), r.set(p, v)
    }

    function d(p) {
        const x = r.get(p);
        if (x) {
            const m = p.index;
            m !== null && x.version < m.version && u(p)
        } else u(p);
        return r.get(p)
    }

    function f() {
        for (const p in i) {
            const x = i[p].deref();
            x !== void 0 && l(x)
        }
    }
    return {
        get: c,
        update: h,
        getWireframeAttribute: d,
        dispose: f
    }
}

