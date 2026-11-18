function m_(s, e) {
    const t = s.getParameter(s.MAX_VERTEX_ATTRIBS),
        n = {},
        i = d(null);
    let r = i,
        a = !1;

    function o(D, F, V, L, k) {
        let X = !1;
        const H = u(D, L, V, F);
        r !== H && (r = H, c(r.object)), X = f(D, L, V, k), X && p(D, L, V, k), k !== null && e.update(k, s.ELEMENT_ARRAY_BUFFER), (X || a) && (a = !1, v(D, F, V, L), k !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(k).buffer))
    }

    function l() {
        return s.createVertexArray()
    }

    function c(D) {
        return s.bindVertexArray(D)
    }

    function h(D) {
        return s.deleteVertexArray(D)
    }

    function u(D, F, V, L) {
        const k = L.wireframe === !0;
        let X = n[F.id];
        X === void 0 && (X = {}, n[F.id] = X);
        const H = D.isInstancedMesh === !0 ? D.id : 0;
        let te = X[H];
        te === void 0 && (te = {}, X[H] = te);
        let W = te[V.id];
        W === void 0 && (W = {}, te[V.id] = W);
        let Q = W[k];
        return Q === void 0 && (Q = d(l()), W[k] = Q), Q
    }

    function d(D) {
        const F = [],
            V = [],
            L = [];
        for (let k = 0; k < t; k++) F[k] = 0, V[k] = 0, L[k] = 0;
        return {
            geometry: null,
            program: null,
            wireframe: !1,
            newAttributes: F,
            enabledAttributes: V,
            attributeDivisors: L,
            object: D,
            attributes: {},
            index: null
        }
    }

    function f(D, F, V, L) {
        const k = r.attributes,
            X = F.attributes;
        let H = 0;
        const te = V.getAttributes();
        for (const W in te)
            if (te[W].location >= 0) {
                const ee = k[W];
                let Te = X[W];
                if (Te === void 0 && (W === "instanceMatrix" && D.instanceMatrix && (Te = D.instanceMatrix), W === "instanceColor" && D.instanceColor && (Te = D.instanceColor)), ee === void 0 || ee.attribute !== Te || Te && ee.data !== Te.data) return !0;
                H++
            } return r.attributesNum !== H || r.index !== L
    }

    function p(D, F, V, L) {
        const k = {},
            X = F.attributes;
        let H = 0;
        const te = V.getAttributes();
        for (const W in te)
            if (te[W].location >= 0) {
                let ee = X[W];
                ee === void 0 && (W === "instanceMatrix" && D.instanceMatrix && (ee = D.instanceMatrix), W === "instanceColor" && D.instanceColor && (ee = D.instanceColor));
                const Te = {};
                Te.attribute = ee, ee && ee.data && (Te.data = ee.data), k[W] = Te, H++
            } r.attributes = k, r.attributesNum = H, r.index = L
    }

    function x() {
        const D = r.newAttributes;
        for (let F = 0, V = D.length; F < V; F++) D[F] = 0
    }

    function m(D) {
        g(D, 0)
    }

    function g(D, F) {
        const V = r.newAttributes,
            L = r.enabledAttributes,
            k = r.attributeDivisors;
        V[D] = 1, L[D] === 0 && (s.enableVertexAttribArray(D), L[D] = 1), k[D] !== F && (s.vertexAttribDivisor(D, F), k[D] = F)
    }

    function M() {
        const D = r.newAttributes,
            F = r.enabledAttributes;
        for (let V = 0, L = F.length; V < L; V++) F[V] !== D[V] && (s.disableVertexAttribArray(V), F[V] = 0)
    }

    function E(D, F, V, L, k, X, H) {
        H === !0 ? s.vertexAttribIPointer(D, F, V, k, X) : s.vertexAttribPointer(D, F, V, L, k, X)
    }

    function v(D, F, V, L) {
        x();
        const k = L.attributes,
            X = V.getAttributes(),
            H = F.defaultAttributeValues;
        for (const te in X) {
            const W = X[te];
            if (W.location >= 0) {
                let Q = k[te];
                if (Q === void 0 && (te === "instanceMatrix" && D.instanceMatrix && (Q = D.instanceMatrix), te === "instanceColor" && D.instanceColor && (Q = D.instanceColor)), Q !== void 0) {
                    const ee = Q.normalized,
                        Te = Q.itemSize,
                        Oe = e.get(Q);
                    if (Oe === void 0) continue;
                    const Y = Oe.buffer,
                        _e = Oe.type,
                        Ee = Oe.bytesPerElement,
                        Ne = _e === s.INT || _e === s.UNSIGNED_INT || Q.gpuType === Ro;
                    if (Q.isInterleavedBufferAttribute) {
                        const xe = Q.data,
                            De = xe.isInterleavedBuffer === !0 ? xe.stride : xe.itemSize,
                            mt = Q.offset;
                        if (xe.isInstancedInterleavedBuffer || xe.isInstancedBufferAttribute) {
                            for (let Be = 0; Be < W.locationSize; Be++) g(W.location + Be, xe.meshPerAttribute);
                            D.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = xe.meshPerAttribute * xe.count)
                        } else
                            for (let Be = 0; Be < W.locationSize; Be++) m(W.location + Be);
                        s.bindBuffer(s.ARRAY_BUFFER, Y);
                        for (let Be = 0; Be < W.locationSize; Be++) E(W.location + Be, Te / W.locationSize, _e, ee, De * Ee, (mt + Te / W.locationSize * Be) * Ee, Ne)
                    } else {
                        if (Q.isInstancedBufferAttribute) {
                            for (let xe = 0; xe < W.locationSize; xe++) g(W.location + xe, Q.meshPerAttribute);
                            D.isInstancedMesh !== !0 && L._maxInstanceCount === void 0 && (L._maxInstanceCount = Q.meshPerAttribute * Q.count)
                        } else
                            for (let xe = 0; xe < W.locationSize; xe++) m(W.location + xe);
                        s.bindBuffer(s.ARRAY_BUFFER, Y);
                        for (let xe = 0; xe < W.locationSize; xe++) E(W.location + xe, Te / W.locationSize, _e, ee, Te * Ee, Te / W.locationSize * xe * Ee, Ne)
                    }
                } else if (H !== void 0) {
                    const ee = H[te];
                    if (ee !== void 0) switch (ee.length) {
                        case 2:
                            s.vertexAttrib2fv(W.location, ee);
                            break;
                        case 3:
                            s.vertexAttrib3fv(W.location, ee);
                            break;
                        case 4:
                            s.vertexAttrib4fv(W.location, ee);
                            break;
                        default:
                            s.vertexAttrib1fv(W.location, ee)
                    }
                }
            }
        }
        M()
    }

    function A() {
        I();
        for (const D in n) {
            const F = n[D];
            for (const V in F) {
                const L = F[V];
                for (const k in L) {
                    const X = L[k];
                    for (const H in X) h(X[H].object), delete X[H];
                    delete L[k]
                }
            }
            delete n[D]
        }
    }

    function b(D) {
        if (n[D.id] === void 0) return;
        const F = n[D.id];
        for (const V in F) {
            const L = F[V];
            for (const k in L) {
                const X = L[k];
                for (const H in X) h(X[H].object), delete X[H];
                delete L[k]
            }
        }
        delete n[D.id]
    }

    function _(D) {
        for (const F in n) {
            const V = n[F];
            for (const L in V) {
                const k = V[L];
                if (k[D.id] === void 0) continue;
                const X = k[D.id];
                for (const H in X) h(X[H].object), delete X[H];
                delete k[D.id]
            }
        }
    }

    function T(D) {
        for (const F in n) {
            const V = n[F],
                L = D.isInstancedMesh === !0 ? D.id : 0,
                k = V[L];
            if (k !== void 0) {
                for (const X in k) {
                    const H = k[X];
                    for (const te in H) h(H[te].object), delete H[te];
                    delete k[X]
                }
                delete V[L], Object.keys(V).length === 0 && delete n[F]
            }
        }
    }

    function I() {
        R(), a = !0, r !== i && (r = i, c(r.object))
    }

    function R() {
        i.geometry = null, i.program = null, i.wireframe = !1
    }
    return {
        setup: o,
        reset: I,
        resetDefaultState: R,
        dispose: A,
        releaseStatesOfGeometry: b,
        releaseStatesOfObject: T,
        releaseStatesOfProgram: _,
        initAttributes: x,
        enableAttribute: m,
        disableUnusedAttributes: M
    }
}

