function dx(s, e, t) {
    let n = new As;
    const i = new re,
        r = new re,
        a = new ht,
        o = new Kf,
        l = new Jf,
        c = {},
        h = t.maxTextureSize,
        u = {
            [$n]: Wt,
            [Wt]: $n,
            [xn]: xn
        },
        d = new fi({
            defines: {
                VSM_SAMPLES: 8
            },
            uniforms: {
                shadow_pass: {
                    value: null
                },
                resolution: {
                    value: new re
                },
                radius: {
                    value: 4
                }
            },
            vertexShader: lx,
            fragmentShader: cx
        }),
        f = d.clone();
    f.defines.HORIZONTAL_PASS = 1;
    const p = new wt;
    p.setAttribute("position", new Ft(new Float32Array([-1, -1, .5, 3, -1, .5, -1, 3, .5]), 3));
    const x = new At(p, d),
        m = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = mr;
    let g = this.type;
    this.render = function(b, _, T) {
        if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || b.length === 0) return;
        this.type === Ru && (Ce("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."), this.type = mr);
        const I = s.getRenderTarget(),
            R = s.getActiveCubeFace(),
            D = s.getActiveMipmapLevel(),
            F = s.state;
        F.setBlending(Ui), F.buffers.depth.getReversed() === !0 ? F.buffers.color.setClear(0, 0, 0, 0) : F.buffers.color.setClear(1, 1, 1, 1), F.buffers.depth.setTest(!0), F.setScissorTest(!1);
        const V = g !== this.type;
        V && _.traverse(function(L) {
            L.material && (Array.isArray(L.material) ? L.material.forEach(k => k.needsUpdate = !0) : L.material.needsUpdate = !0)
        });
        for (let L = 0, k = b.length; L < k; L++) {
            const X = b[L],
                H = X.shadow;
            if (H === void 0) {
                Ce("WebGLShadowMap:", X, "has no shadow.");
                continue
            }
            if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
            i.copy(H.mapSize);
            const te = H.getFrameExtents();
            i.multiply(te), r.copy(H.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / te.x), i.x = r.x * te.x, H.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / te.y), i.y = r.y * te.y, H.mapSize.y = r.y));
            const W = s.state.buffers.depth.getReversed();
            if (H.camera._reversedDepth = W, H.map === null || V === !0) {
                if (H.map !== null && (H.map.depthTexture !== null && (H.map.depthTexture.dispose(), H.map.depthTexture = null), H.map.dispose()), this.type === ls) {
                    if (X.isPointLight) {
                        Ce("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");
                        continue
                    }
                    H.map = new Mn(i.x, i.y, {
                        format: ui,
                        type: yn,
                        minFilter: Ct,
                        magFilter: Ct,
                        generateMipmaps: !1
                    }), H.map.texture.name = X.name + ".shadowMap", H.map.depthTexture = new Vi(i.x, i.y, jt), H.map.depthTexture.name = X.name + ".shadowMapDepth", H.map.depthTexture.format = Qn, H.map.depthTexture.compareFunction = null, H.map.depthTexture.minFilter = Rt, H.map.depthTexture.magFilter = Rt
                } else X.isPointLight ? (H.map = new tl(i.x), H.map.depthTexture = new Ih(i.x, Sn)) : (H.map = new Mn(i.x, i.y), H.map.depthTexture = new Vi(i.x, i.y, Sn)), H.map.depthTexture.name = X.name + ".shadowMap", H.map.depthTexture.format = Qn, this.type === mr ? (H.map.depthTexture.compareFunction = W ? mh : ph, H.map.depthTexture.minFilter = Ct, H.map.depthTexture.magFilter = Ct) : (H.map.depthTexture.compareFunction = null, H.map.depthTexture.minFilter = Rt, H.map.depthTexture.magFilter = Rt);
                H.camera.updateProjectionMatrix()
            }
            H.map.isWebGLCubeRenderTarget !== !0 && (H.map.width !== i.x || H.map.height !== i.y) && H.map.setSize(i.x, i.y);
            const Q = H.map.isWebGLCubeRenderTarget ? 6 : H.getViewportCount();
            X.isPointLight !== !0 && H.updateMatrices(X, T);
            const ee = H.camera.layers.mask & 4294967294 ? H.camera.layers : T.layers;
            for (let Te = 0; Te < Q; Te++) {
                const Oe = H.getCamera(Te);
                if (X.isPointLight) {
                    const Y = H.camera,
                        _e = H.matrix,
                        Ee = X.distance || Y.far;
                    Ee !== Y.far && (Y.far = Ee, Y.updateProjectionMatrix()), as.setFromMatrixPosition(X.matrixWorld), Y.position.copy(as), ya.copy(Y.position), ya.add(hx[Te]), Y.up.copy(ux[Te]), Y.lookAt(ya), Y.updateMatrixWorld(), _e.makeTranslation(-as.x, -as.y, -as.z), Hc.multiplyMatrices(Y.projectionMatrix, Y.matrixWorldInverse), H._frustum.setFromProjectionMatrix(Hc, Y.coordinateSystem, Y.reversedDepth)
                }
                if (H.map.isWebGLCubeRenderTarget) s.setRenderTarget(H.map, Te), s.clear();
                else {
                    Te === 0 && (s.setRenderTarget(H.map), s.clear());
                    const Y = H.getViewport(Te);
                    a.set(r.x * Y.x, r.y * Y.y, r.x * Y.z, r.y * Y.w), F.viewport(a)
                }
                n = H.getFrustum(Te), v(_, T, Oe, X, ee, this.type)
            }
            H.isPointLightShadow !== !0 && this.type === ls && M(H, T), H.needsUpdate = !1
        }
        g = this.type, m.needsUpdate = !1, s.setRenderTarget(I, R, D)
    };

    function M(b, _) {
        const T = e.update(x);
        d.defines.VSM_SAMPLES !== b.blurSamples && (d.defines.VSM_SAMPLES = b.blurSamples, f.defines.VSM_SAMPLES = b.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), b.mapPass === null ? b.mapPass = new Mn(i.x, i.y, {
            format: ui,
            type: yn
        }) : (b.mapPass.width !== b.map.width || b.mapPass.height !== b.map.height) && b.mapPass.setSize(b.map.width, b.map.height), d.uniforms.shadow_pass.value = b.map.depthTexture, d.uniforms.resolution.value.set(b.map.width, b.map.height), d.uniforms.radius.value = b.radius, s.setRenderTarget(b.mapPass), s.clear(), s.renderBufferDirect(_, null, T, d, x, null), f.uniforms.shadow_pass.value = b.mapPass.texture, f.uniforms.resolution.value.set(b.map.width, b.map.height), f.uniforms.radius.value = b.radius, s.setRenderTarget(b.map), s.clear(), s.renderBufferDirect(_, null, T, f, x, null)
    }

    function E(b, _, T, I) {
        let R = null;
        const D = T.isPointLight === !0 ? b.customDistanceMaterial : b.customDepthMaterial;
        if (D !== void 0) R = D;
        else if (R = T.isPointLight === !0 ? l : o, s.localClippingEnabled && _.clipShadows === !0 && Array.isArray(_.clippingPlanes) && _.clippingPlanes.length !== 0 || _.displacementMap && _.displacementScale !== 0 || _.alphaMap && _.alphaTest > 0 || _.map && _.alphaTest > 0 || _.alphaToCoverage === !0) {
            const F = R.uuid,
                V = _.uuid;
            let L = c[F];
            L === void 0 && (L = {}, c[F] = L);
            let k = L[V];
            k === void 0 && (k = R.clone(), L[V] = k, _.addEventListener("dispose", A)), R = k
        }
        if (R.visible = _.visible, R.wireframe = _.wireframe, I === ls ? R.side = _.shadowSide !== null ? _.shadowSide : _.side : R.side = _.shadowSide !== null ? _.shadowSide : u[_.side], R.alphaMap = _.alphaMap, R.alphaTest = _.alphaToCoverage === !0 ? .5 : _.alphaTest, R.map = _.map, R.clipShadows = _.clipShadows, R.clippingPlanes = _.clippingPlanes, R.clipIntersection = _.clipIntersection, R.displacementMap = _.displacementMap, R.displacementScale = _.displacementScale, R.displacementBias = _.displacementBias, R.wireframeLinewidth = _.wireframeLinewidth, R.linewidth = _.linewidth, T.isPointLight === !0 && R.isMeshDistanceMaterial === !0) {
            const F = s.properties.get(R);
            F.light = T
        }
        return R
    }

    function v(b, _, T, I, R, D) {
        if (b.visible === !1) return;
        if (b.layers.test(R) && (b.isMesh || b.isLine || b.isPoints) && (b.castShadow || b.receiveShadow && D === ls) && (!b.frustumCulled || b.intersectsFrustum(n))) {
            b.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse, b.matrixWorld);
            const L = e.update(b),
                k = b.material;
            if (Array.isArray(k)) {
                const X = L.groups;
                for (let H = 0, te = X.length; H < te; H++) {
                    const W = X[H],
                        Q = k[W.materialIndex];
                    if (Q && Q.visible) {
                        const ee = E(b, Q, I, D);
                        b.onBeforeShadow(s, b, _, T, L, ee, W), s.renderBufferDirect(T, null, L, ee, b, W), b.onAfterShadow(s, b, _, T, L, ee, W)
                    }
                }
            } else if (k.visible) {
                const X = E(b, k, I, D);
                b.onBeforeShadow(s, b, _, T, L, X, null), s.renderBufferDirect(T, null, L, X, b, null), b.onAfterShadow(s, b, _, T, L, X, null)
            }
        }
        const V = b.children;
        for (let L = 0, k = V.length; L < k; L++) v(V[L], _, T, I, R, D)
    }

    function A(b) {
        b.target.removeEventListener("dispose", A);
        for (const T in c) {
            const I = c[T],
                R = b.target.uuid;
            R in I && (I[R].dispose(), delete I[R])
        }
    }
}

