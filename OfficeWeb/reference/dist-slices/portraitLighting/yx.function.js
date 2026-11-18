function yx(s, e, t, n) {
    let i = {},
        r = {};

    function a(M, E) {
        const v = E.program;
        n.uniformBlockBinding(M, v, i[M.id])
    }

    function o(M, E) {
        let v = i[M.id];
        v === void 0 && (p(M), v = l(M), i[M.id] = v, M.addEventListener("dispose", m));
        const A = E.program;
        n.updateUBOMapping(M, A);
        const b = e.render.frame;
        r[M.id] !== b && (c(M), r[M.id] = b)
    }

    function l(M) {
        const E = s.createBuffer(),
            v = M.__size,
            A = M.usage;
        return s.bindBuffer(s.UNIFORM_BUFFER, E), s.bufferData(s.UNIFORM_BUFFER, v, A), s.bindBuffer(s.UNIFORM_BUFFER, null), E
    }

    function c(M) {
        const E = i[M.id],
            v = M.uniforms,
            A = M.__cache;
        s.bindBuffer(s.UNIFORM_BUFFER, E);
        for (let b = 0, _ = v.length; b < _; b++) {
            const T = v[b];
            if (Array.isArray(T))
                for (let I = 0, R = T.length; I < R; I++) h(T[I], b, I, A);
            else h(T, b, 0, A)
        }
        s.bindBuffer(s.UNIFORM_BUFFER, null)
    }

    function h(M, E, v, A) {
        if (d(M, E, v, A) === !0) {
            const b = M.__offset,
                _ = M.value;
            if (Array.isArray(_)) {
                let T = 0;
                for (let I = 0; I < _.length; I++) {
                    const R = _[I],
                        D = x(R, !0);
                    u(R, M.__data, T), T += D.storage / Float32Array.BYTES_PER_ELEMENT
                }
            } else u(_, M.__data, 0);
            s.bufferSubData(s.UNIFORM_BUFFER, b, M.__data)
        }
    }

    function u(M, E, v) {
        typeof M == "number" || typeof M == "boolean" ? E[v] = M : M.isMatrix3 ? (E[v] = M.elements[0], E[v + 1] = M.elements[1], E[v + 2] = M.elements[2], E[v + 3] = 0, E[v + 4] = M.elements[3], E[v + 5] = M.elements[4], E[v + 6] = M.elements[5], E[v + 7] = 0, E[v + 8] = M.elements[6], E[v + 9] = M.elements[7], E[v + 10] = M.elements[8], E[v + 11] = 0) : ArrayBuffer.isView(M) ? E.set(M.subarray(0, E.length - v), v) : M.toArray(E, v)
    }

    function d(M, E, v, A) {
        const b = M.value,
            _ = E + "_" + v;
        if (Array.isArray(b)) {
            A[_] === void 0 && (A[_] = []);
            const T = A[_];
            let I = !1;
            for (let R = 0; R < b.length; R++) f(b[R], T, R) === !0 && (I = !0);
            return I
        }
        return f(b, A, _)
    }

    function f(M, E, v) {
        if (E[v] === void 0) return typeof M == "number" || typeof M == "boolean" ? E[v] = M : ArrayBuffer.isView(M) ? E[v] = M.slice() : E[v] = M.clone(), !0;
        {
            const A = E[v];
            if (typeof M == "number" || typeof M == "boolean") {
                if (A !== M) return E[v] = M, !0
            } else {
                if (ArrayBuffer.isView(M)) return !0;
                if (A.equals(M) === !1) return A.copy(M), !0
            }
        }
        return !1
    }

    function p(M) {
        const E = M.uniforms;
        let v = 0;
        const A = 16;
        for (let _ = 0, T = E.length; _ < T; _++) {
            const I = Array.isArray(E[_]) ? E[_] : [E[_]];
            for (let R = 0, D = I.length; R < D; R++) {
                const F = I[R],
                    V = Array.isArray(F.value) ? F.value : [F.value],
                    L = Array.isArray(E[_]) || Array.isArray(F.value);
                let k = v;
                for (let H = 0, te = V.length; H < te; H++) {
                    const W = V[H],
                        Q = x(W, L),
                        ee = v % A,
                        Te = ee % Q.boundary,
                        Oe = ee + Te;
                    v += Te, Oe !== 0 && A - Oe < Q.storage && (v += A - Oe), H === 0 && (k = v), v += Q.storage
                }
                const X = F.type === "int" ? Int32Array : F.type === "uint" ? Uint32Array : Float32Array;
                F.__data = new X((v - k) / Float32Array.BYTES_PER_ELEMENT), F.__offset = k
            }
        }
        const b = v % A;
        return b > 0 && (v += A - b), M.__size = v, M.__cache = {}, this
    }

    function x(M, E) {
        const v = {
            boundary: 0,
            storage: 0
        };
        return typeof M == "number" || typeof M == "boolean" ? (v.boundary = 4, v.storage = 4) : M.isVector2 ? (v.boundary = 8, v.storage = 8) : M.isVector3 || M.isColor ? (v.boundary = 16, v.storage = 12) : M.isVector4 ? (v.boundary = 16, v.storage = 16) : M.isMatrix3 ? (v.boundary = 16, v.storage = 48) : M.isMatrix4 ? (v.boundary = 16, v.storage = 64) : M.isTexture ? Ce("WebGLRenderer: Texture samplers can not be part of an uniforms group.") : ArrayBuffer.isView(M) ? (v.boundary = 16, v.storage = M.byteLength) : Ce("WebGLRenderer: Unsupported uniform value type.", M), E === !0 && (v.boundary = 16, v.storage = Math.ceil(v.storage / 16) * 16), v
    }

    function m(M) {
        const E = M.target;
        E.removeEventListener("dispose", m), s.deleteBuffer(i[E.id]), delete i[E.id], delete r[E.id]
    }

    function g() {
        for (const M in i) s.deleteBuffer(i[M]);
        i = {}, r = {}
    }
    return {
        bind: a,
        update: o,
        dispose: g
    }
}
