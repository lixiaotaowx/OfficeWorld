class Hv {
    constructor(e = {}) {
        const {
            canvas: t = ud(),
            context: n = null,
            depth: i = !0,
            stencil: r = !1,
            alpha: a = !1,
            antialias: o = !1,
            premultipliedAlpha: l = !0,
            preserveDrawingBuffer: c = !1,
            powerPreference: h = "default",
            failIfMajorPerformanceCaveat: u = !1,
            reversedDepthBuffer: d = !1,
            outputBufferType: f = Jt
        } = e;
        this.isWebGLRenderer = !0;
        let p;
        if (n !== null) {
            if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
            p = n.getContextAttributes().alpha
        } else p = a;
        const x = f,
            m = new Set([Do, No, Io]),
            g = new Set([Jt, Sn, Ss, ki, Co, Lo]),
            M = new Uint32Array(4),
            E = new Int32Array(4),
            v = {
                textures: [],
                min: [],
                max: [],
                resolution: []
            };
        let A = null,
            b = null;
        const _ = [],
            T = [];
        let I = null;
        this.domElement = t, this.debug = {
            checkShaderErrors: !0,
            diagnostics: {
                keywords: !1
            },
            onShaderError: null
        }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this.toneMapping = Un, this.toneMappingExposure = 1, this.transmissionResolutionScale = 1;
        const R = this;
        let D = !1,
            F = null,
            V = null,
            L = null,
            k = null;
        this._outputColorSpace = bt;
        let X = 0,
            H = 0,
            te = null,
            W = -1,
            Q = null;
        const ee = new ht,
            Te = new ht;
        let Oe = null;
        const Y = new Fe(0);
        let _e = 0,
            Ee = t.width,
            Ne = t.height,
            xe = 1,
            De = null,
            mt = null;
        const Be = new ht(0, 0, Ee, Ne),
            Je = new ht(0, 0, Ee, Ne);
        let je = !1;
        const j = new As,
            ce = new Wo;
        let ae = !1,
            ye = !1;
        const ge = new We,
            Ve = new N,
            Le = new ht,
            et = {
                background: null,
                fog: null,
                environment: null,
                overrideMaterial: null,
                isScene: !0
            };
        let tt = !1;

        function rt() {
            return te === null ? xe : 1
        }
        let U = n;

        function yt(y, P) {
            return t.getContext(y, P)
        }
        let $e, dt, fe, St, Ue, ke, w, S, B, ne, $, oe, pe, K, J, he, C, Z, q, ue, se, le, Pe;
        try {
            const y = {
                alpha: !0,
                depth: i,
                stencil: r,
                antialias: o,
                premultipliedAlpha: l,
                preserveDrawingBuffer: c,
                powerPreference: h,
                failIfMajorPerformanceCaveat: u
            };
            if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${wo}`), t.addEventListener("webglcontextlost", Ie, !1), t.addEventListener("webglcontextrestored", Xe, !1), t.addEventListener("webglcontextcreationerror", ve, !1), U === null) {
                const P = "webgl2";
                if (U = yt(P, y), U === null) throw yt(P) ? new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.") : new Error("THREE.WebGLRenderer: Error creating WebGL context.")
            }
            qe()
        } catch (y) {
            throw t.removeEventListener("webglcontextlost", Ie, !1), t.removeEventListener("webglcontextrestored", Xe, !1), t.removeEventListener("webglcontextcreationerror", ve, !1), ze("WebGLRenderer: " + y.message), y
        }

        function qe() {
            $e = new R_(U), $e.init(), se = new mx(U, $e), dt = new __(U, $e, e, se), fe = new fx(U, $e), dt.reversedDepthBuffer && d && fe.buffers.depth.setReversed(!0), V = U.createFramebuffer(), L = U.createFramebuffer(), k = U.createFramebuffer(), St = new P_(U), Ue = new j0, ke = new px(U, $e, fe, Ue, dt, se, St), w = new w_(R), S = new Np(U), le = new m_(U, S), B = new C_(U, S, St, le), ne = new N_(U, B, S, le, St), Z = new I_(U, dt, ke), J = new x_(Ue), $ = new Q0(R, w, $e, dt, le, J), oe = new Sx(R, Ue), pe = new tx, K = new ox($e), C = new p_(R, w, fe, ne, p, l), he = new dx(R, ne, dt), Pe = new yx(U, St, dt, fe), q = new g_(U, $e, St), ue = new L_(U, $e, St), St.programs = $.programs, R.capabilities = dt, R.extensions = $e, R.properties = Ue, R.renderLists = pe, R.shadowMap = he, R.state = fe, R.info = St
        }
        x !== Jt && (I = new U_(x, t.width, t.height, o, i, r));
        const ie = new vx(R, U);
        this.xr = ie, this.getContext = function() {
            return U
        }, this.getContextAttributes = function() {
            return U.getContextAttributes()
        }, this.forceContextLoss = function() {
            const y = $e.get("WEBGL_lose_context");
            y && y.loseContext()
        }, this.forceContextRestore = function() {
            const y = $e.get("WEBGL_lose_context");
            y && y.restoreContext()
        }, this.getPixelRatio = function() {
            return xe
        }, this.setPixelRatio = function(y) {
            y !== void 0 && (xe = y, this.setSize(Ee, Ne, !1))
        }, this.getSize = function(y) {
            return y.set(Ee, Ne)
        }, this.setSize = function(y, P, G = !0) {
            if (ie.isPresenting) {
                Ce("WebGLRenderer: Can't change size while VR device is presenting.");
                return
            }
            Ee = y, Ne = P, t.width = Math.floor(y * xe), t.height = Math.floor(P * xe), G === !0 && (t.style.width = y + "px", t.style.height = P + "px"), I !== null && I.setSize(t.width, t.height), this.setViewport(0, 0, y, P)
        }, this.getDrawingBufferSize = function(y) {
            return y.set(Ee * xe, Ne * xe).floor()
        }, this.setDrawingBufferSize = function(y, P, G) {
            Ee = y, Ne = P, xe = G, t.width = Math.floor(y * G), t.height = Math.floor(P * G), this.setViewport(0, 0, y, P)
        }, this.setEffects = function(y) {
            if (x === Jt) {
                ze("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");
                return
            }
            if (y) {
                for (let P = 0; P < y.length; P++)
                    if (y[P].isOutputPass === !0) {
                        Ce("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");
                        break
                    }
            }
            I.setEffects(y || [])
        }, this.getCurrentViewport = function(y) {
            return y.copy(ee)
        }, this.getViewport = function(y) {
            return y.copy(Be)
        }, this.setViewport = function(y, P, G, O) {
            y.isVector4 ? Be.set(y.x, y.y, y.z, y.w) : Be.set(y, P, G, O), fe.viewport(ee.copy(Be).multiplyScalar(rt()).round())
        }, this.getScissor = function(y) {
            return y.copy(Je)
        }, this.setScissor = function(y, P, G, O) {
            y.isVector4 ? Je.set(y.x, y.y, y.z, y.w) : Je.set(y, P, G, O), fe.scissor(Te.copy(Je).multiplyScalar(rt()).round())
        }, this.getScissorTest = function() {
            return je
        }, this.setScissorTest = function(y) {
            fe.setScissorTest(je = y)
        }, this.setOpaqueSort = function(y) {
            De = y
        }, this.setTransparentSort = function(y) {
            mt = y
        }, this.getClearColor = function(y) {
            return y.copy(C.getClearColor())
        }, this.setClearColor = function() {
            C.setClearColor(...arguments)
        }, this.getClearAlpha = function() {
            return C.getClearAlpha()
        }, this.setClearAlpha = function() {
            C.setClearAlpha(...arguments)
        }, this.clear = function(y = !0, P = !0, G = !0) {
            let O = 0;
            if (y) {
                let z = !1;
                if (te !== null) {
                    const me = te.texture.format;
                    z = m.has(me)
                }
                if (z) {
                    const me = te.texture.type,
                        be = g.has(me),
                        de = C.getClearColor(),
                        Se = C.getClearAlpha(),
                        Re = de.r,
                        Ge = de.g,
                        nt = de.b;
                    be ? (M[0] = Re, M[1] = Ge, M[2] = nt, M[3] = Se, U.clearBufferuiv(U.COLOR, 0, M)) : (E[0] = Re, E[1] = Ge, E[2] = nt, E[3] = Se, U.clearBufferiv(U.COLOR, 0, E))
                } else O |= U.COLOR_BUFFER_BIT
            }
            P && (O |= U.DEPTH_BUFFER_BIT, this.state.buffers.depth.setMask(!0)), G && (O |= U.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), O !== 0 && U.clear(O)
        }, this.clearColor = function() {
            this.clear(!0, !1, !1)
        }, this.clearDepth = function() {
            this.clear(!1, !0, !1)
        }, this.clearStencil = function() {
            this.clear(!1, !1, !0)
        }, this.setNodesHandler = function(y) {
            y.setRenderer(this), F = y
        }, this.dispose = function() {
            t.removeEventListener("webglcontextlost", Ie, !1), t.removeEventListener("webglcontextrestored", Xe, !1), t.removeEventListener("webglcontextcreationerror", ve, !1), C.dispose(), pe.dispose(), K.dispose(), ke.dispose(), Ue.dispose(), w.dispose(), ne.dispose(), B.dispose(), le.dispose(), Pe.dispose(), $.dispose(), ie.dispose(), ie.removeEventListener("sessionstart", ol), ie.removeEventListener("sessionend", ll), ei.stop()
        };

        function Ie(y) {
            y.preventDefault(), wr("WebGLRenderer: Context Lost."), D = !0
        }

        function Xe() {
            wr("WebGLRenderer: Context Restored."), D = !1;
            const y = St.autoReset,
                P = he.enabled,
                G = he.autoUpdate,
                O = he.needsUpdate,
                z = he.type;
            qe(), St.autoReset = y, he.enabled = P, he.autoUpdate = G, he.needsUpdate = O, he.type = z
        }

        function ve(y) {
            ze("WebGLRenderer: A WebGL context could not be created. Reason: ", y.statusMessage)
        }

        function lt(y) {
            const P = y.target;
            P.removeEventListener("dispose", lt), It(P)
        }

        function It(y) {
            On(y), Ue.remove(y)
        }

        function On(y) {
            const P = Ue.get(y).programs;
            P !== void 0 && (P.forEach(function(G) {
                $.releaseProgram(G)
            }), y.isShaderMaterial && $.releaseShaderCache(y))
        }
        this.renderBufferDirect = function(y, P, G, O, z, me) {
            P === null && (P = et);
            const be = z.isMesh && z.matrixWorld.determinantAffine() < 0,
                de = vu(y, P, G, O, z);
            fe.setMaterial(O, be);
            let Se = G.index,
                Re = 1;
            if (O.wireframe === !0) {
                if (Se = B.getWireframeAttribute(G), Se === void 0) return;
                Re = 2
            }
            const Ge = G.drawRange,
                nt = G.attributes.position;
            let Ae = Ge.start * Re,
                it = (Ge.start + Ge.count) * Re;
            me !== null && (Ae = Math.max(Ae, me.start * Re), it = Math.min(it, (me.start + me.count) * Re)), Se !== null ? (Ae = Math.max(Ae, 0), it = Math.min(it, Se.count)) : nt != null && (Ae = Math.max(Ae, 0), it = Math.min(it, nt.count));
            const Tt = it - Ae;
            if (Tt < 0 || Tt === 1 / 0) return;
            le.setup(z, O, de, G, Se);
            let pt, ft = q;
            if (Se !== null && (pt = S.get(Se), ft = ue, ft.setIndex(pt)), z.isMesh) O.wireframe === !0 ? (fe.setLineWidth(O.wireframeLinewidth * rt()), ft.setMode(U.LINES)) : ft.setMode(U.TRIANGLES);
            else if (z.isLine) {
                let Ot = O.linewidth;
                Ot === void 0 && (Ot = 1), fe.setLineWidth(Ot * rt()), z.isLineSegments ? ft.setMode(U.LINES) : z.isLineLoop ? ft.setMode(U.LINE_LOOP) : ft.setMode(U.LINE_STRIP)
            } else z.isPoints ? ft.setMode(U.POINTS) : z.isSprite && ft.setMode(U.TRIANGLES);
            if (z.isBatchedMesh)
                if ($e.get("WEBGL_multi_draw")) ft.renderMultiDraw(z._multiDrawStarts, z._multiDrawCounts, z._multiDrawCount);
                else {
                    const Ot = z._multiDrawStarts,
                        we = z._multiDrawCounts,
                        Ht = z._multiDrawCount,
                        at = Se ? S.get(Se).bytesPerElement : 1,
                        ti = Ue.get(O).currentProgram.getUniforms();
                    for (let Bt = 0; Bt < Ht; Bt++) ti.setValue(U, "_gl_DrawID", Bt), ft.render(Ot[Bt] / at, we[Bt])
                }
            else if (z.isInstancedMesh) ft.renderInstances(Ae, Tt, z.count);
            else if (G.isInstancedBufferGeometry) {
                const Ot = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0,
                    we = Math.min(G.instanceCount, Ot);
                ft.renderInstances(Ae, Tt, we)
            } else ft.render(Ae, Tt)
        };

        function al(y, P, G, O) {
            F !== null && y.isNodeMaterial && F.setObject(O, y), ae === !0 && J.setState(y, G, !1), y.transparent === !0 && y.side === xn && y.forceSinglePass === !1 ? (y.side = Wt, y.needsUpdate = !0, $i(y, P, O), y.side = $n, y.needsUpdate = !0, $i(y, P, O), y.side = xn) : $i(y, P, O)
        }
        this.compile = function(y, P, G = null) {
            G === null && (G = y), F !== null && F.renderStart(y, P, G), b = K.get(G), b.init(P), T.push(b), G.traverseVisible(function(z) {
                z.isLight && z.layers.test(P.layers) && (b.pushLight(z), z.castShadow && b.pushShadow(z))
            }), y !== G && y.traverseVisible(function(z) {
                z.isLight && z.layers.test(P.layers) && (b.pushLight(z), z.castShadow && b.pushShadow(z))
            }), b.setupLights(), F !== null && F.updateLights(b.state.lightsArray), ye = this.localClippingEnabled, ae = J.init(this.clippingPlanes, ye), ae === !0 && J.setGlobalState(this.clippingPlanes, P), F !== null && he.render(b.state.shadowsArray, G, P);
            const O = new Set;
            return y.traverse(function(z) {
                if (!(z.isMesh || z.isPoints || z.isLine || z.isSprite)) return;
                const me = z.material;
                if (me)
                    if (Array.isArray(me))
                        for (let be = 0; be < me.length; be++) {
                            const de = me[be];
                            al(de, G, P, z), O.add(de)
                        } else al(me, G, P, z), O.add(me)
            }), b = T.pop(), F !== null && F.renderEnd(), O
        }, this.compileAsync = function(y, P, G = null) {
            const O = this.compile(y, P, G);
            return new Promise(z => {
                function me() {
                    if (O.forEach(function(be) {
                            const Se = Ue.get(be).currentProgram;
                            (Se === void 0 || Se.isReady()) && O.delete(be)
                        }), O.size === 0) {
                        z(y);
                        return
                    }
                    setTimeout(me, 10)
                }
                $e.get("KHR_parallel_shader_compile") !== null ? me() : setTimeout(me, 10)
            })
        };
        let Hr = null;

        function _u(y) {
            Hr && Hr(y)
        }

        function ol() {
            ei.stop()
        }

        function ll() {
            ei.start()
        }
        const ei = new eu;
        ei.setAnimationLoop(_u), typeof self < "u" && ei.setContext(self), this.setAnimationLoop = function(y) {
            Hr = y, ie.setAnimationLoop(y), y === null ? ei.stop() : ei.start()
        }, ie.addEventListener("sessionstart", ol), ie.addEventListener("sessionend", ll), this.render = function(y, P) {
            if (P !== void 0 && P.isCamera !== !0) {
                ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");
                return
            }
            if (D === !0) return;
            F !== null && F.renderStart(y, P);
            const G = ie.enabled === !0 && ie.isPresenting === !0,
                O = I !== null && (te === null || G) && I.begin(R, te);
            if (y.matrixWorldAutoUpdate === !0 && y.updateMatrixWorld(), P.parent === null && P.matrixWorldAutoUpdate === !0 && P.updateMatrixWorld(), ie.enabled === !0 && ie.isPresenting === !0 && (I === null || I.isCompositing() === !1) && (ie.cameraAutoUpdate === !0 && ie.updateCamera(P), P = ie.getCamera()), y.isScene === !0 && y.onBeforeRender(R, y, P, te), b = K.get(y, T.length), b.init(P), b.state.textureUnits = ke.getTextureUnits(), T.push(b), ge.multiplyMatrices(P.projectionMatrix, P.matrixWorldInverse), P.isArrayCamera ? ce.setFromArrayCamera(P) : j.setFromProjectionMatrix(ge, cn, P.reversedDepth), ye = this.localClippingEnabled, ae = J.init(this.clippingPlanes, ye), A = pe.get(y, _.length), A.init(), _.push(A), this.info.render.frame++, ie.enabled === !0 && ie.isPresenting === !0) {
                const be = R.xr.getDepthSensingMesh();
                be !== null && Gr(be, P, -1 / 0, R.sortObjects)
            }
            Gr(y, P, 0, R.sortObjects), A.finish(), F !== null && F.updateLights(b.state.lightsArray), R.sortObjects === !0 && A.sort(De, mt), tt = ie.enabled === !1 || ie.isPresenting === !1 || ie.hasDepthSensing() === !1, tt && C.addToRenderList(A, y), this.info.autoReset === !0 && this.info.reset(), ae === !0 && J.beginShadows();
            const z = b.state.shadowsArray;
            if (he.render(z, y, P), ae === !0 && J.endShadows(), (O && I.hasRenderPass()) === !1) {
                const be = A.opaque,
                    de = A.transmissive;
                if (b.setupLights(), P.isArrayCamera) {
                    const Se = P.cameras;
                    if (de.length > 0)
                        for (let Re = 0, Ge = Se.length; Re < Ge; Re++) {
                            const nt = Se[Re];
                            hl(be, de, y, nt)
                        }
                    tt && C.render(y);
                    for (let Re = 0, Ge = Se.length; Re < Ge; Re++) {
                        const nt = Se[Re];
                        cl(A, y, nt, nt.viewport)
                    }
                } else de.length > 0 && hl(be, de, y, P), tt && C.render(y), cl(A, y, P)
            }
            te !== null && H === 0 && (ke.updateMultisampleRenderTarget(te), ke.updateRenderTargetMipmap(te)), O && I.end(R), y.isScene === !0 && y.onAfterRender(R, y, P), le.resetDefaultState(), W = -1, Q = null, T.pop(), T.length > 0 ? (b = T[T.length - 1], ke.setTextureUnits(b.state.textureUnits), ae === !0 && J.setGlobalState(R.clippingPlanes, b.state.camera)) : b = null, _.pop(), _.length > 0 ? A = _[_.length - 1] : A = null, F !== null && F.renderEnd()
        };

        function Gr(y, P, G, O) {
            if (y.visible === !1) return;
            if (y.layers.test(P.layers)) {
                if (y.isGroup) G = y.renderOrder;
                else if (y.isLOD) y.autoUpdate === !0 && y.update(P);
                else if (y.isLight) b.pushLight(y), y.castShadow && b.pushShadow(y);
                else if (y.isSprite) {
                    const be = P.isArrayCamera ? ce : j;
                    if (!y.frustumCulled || y.intersectsFrustum(be)) {
                        O && Le.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ge);
                        const de = ne.update(y),
                            Se = y.material;
                        Se.visible && A.push(y, de, Se, G, Le.z, null, P)
                    }
                } else if (y.isMesh || y.isLine || y.isPoints) {
                    const be = P.isArrayCamera ? ce : j;
                    if (!y.frustumCulled || y.intersectsFrustum(be)) {
                        const de = ne.update(y),
                            Se = y.material;
                        if (O && (y.boundingSphere !== void 0 ? (y.boundingSphere === null && y.computeBoundingSphere(), Le.copy(y.boundingSphere.center)) : (de.boundingSphere === null && de.computeBoundingSphere(), Le.copy(de.boundingSphere.center)), Le.applyMatrix4(y.matrixWorld).applyMatrix4(ge)), Array.isArray(Se)) {
                            const Re = de.groups;
                            for (let Ge = 0, nt = Re.length; Ge < nt; Ge++) {
                                const Ae = Re[Ge],
                                    it = Se[Ae.materialIndex];
                                it && it.visible && A.push(y, de, it, G, Le.z, Ae, P)
                            }
                        } else Se.visible && A.push(y, de, Se, G, Le.z, null, P)
                    }
                }
            }
            const me = y.children;
            for (let be = 0, de = me.length; be < de; be++) Gr(me[be], P, G, O)
        }

        function cl(y, P, G, O) {
            const {
                opaque: z,
                transmissive: me,
                transparent: be
            } = y;
            b.setupLightsView(G), ae === !0 && J.setGlobalState(R.clippingPlanes, G), O && fe.viewport(ee.copy(O)), z.length > 0 && Os(z, P, G), me.length > 0 && Os(me, P, G), be.length > 0 && Os(be, P, G), fe.buffers.depth.setTest(!0), fe.buffers.depth.setMask(!0), fe.buffers.color.setMask(!0), fe.setPolygonOffset(!1)
        }

        function hl(y, P, G, O) {
            if ((G.isScene === !0 ? G.overrideMaterial : null) !== null) return;
            if (b.state.transmissionRenderTarget[O.id] === void 0) {
                const Ae = $e.has("EXT_color_buffer_half_float") || $e.has("EXT_color_buffer_float");
                b.state.transmissionRenderTarget[O.id] = new Mn(1, 1, {
                    generateMipmaps: !0,
                    type: Ae ? yn : Jt,
                    minFilter: vn,
                    samples: Math.max(4, dt.samples),
                    stencilBuffer: r,
                    resolveDepthBuffer: !1,
                    resolveStencilBuffer: !1,
                    storeMultisampledDepthBuffer: !1,
                    storeMultisampledStencilBuffer: !1,
                    colorSpace: Qe.workingColorSpace
                })
            }
            const me = b.state.transmissionRenderTarget[O.id],
                be = O.viewport || ee;
            me.setSize(be.z * R.transmissionResolutionScale, be.w * R.transmissionResolutionScale);
            const de = R.getRenderTarget(),
                Se = R.getActiveCubeFace(),
                Re = R.getActiveMipmapLevel();
            R.setRenderTarget(me), R.getClearColor(Y), _e = R.getClearAlpha(), _e < 1 && R.setClearColor(16777215, .5), R.clear(), tt && C.render(G);
            const Ge = R.toneMapping;
            R.toneMapping = Un;
            const nt = O.viewport;
            if (O.viewport !== void 0 && (O.viewport = void 0), b.setupLightsView(O), ae === !0 && J.setGlobalState(R.clippingPlanes, O), Os(y, G, O), ke.updateMultisampleRenderTarget(me), ke.updateRenderTargetMipmap(me), $e.has("WEBGL_multisampled_render_to_texture") === !1) {
                let Ae = !1;
                for (let it = 0, Tt = P.length; it < Tt; it++) {
                    const pt = P[it],
                        {
                            object: ft,
                            geometry: Ot,
                            material: we,
                            group: Ht
                        } = pt;
                    if (we.side === xn && ft.layers.test(O.layers)) {
                        const at = we.side;
                        we.side = Wt, we.needsUpdate = !0, ul(ft, G, O, Ot, we, Ht), we.side = at, we.needsUpdate = !0, Ae = !0
                    }
                }
                Ae === !0 && (ke.updateMultisampleRenderTarget(me), ke.updateRenderTargetMipmap(me))
            }
            R.setRenderTarget(de, Se, Re), R.setClearColor(Y, _e), nt !== void 0 && (O.viewport = nt), R.toneMapping = Ge
        }

        function Os(y, P, G) {
            const O = P.isScene === !0 ? P.overrideMaterial : null;
            for (let z = 0, me = y.length; z < me; z++) {
                const be = y[z],
                    {
                        object: de,
                        geometry: Se,
                        group: Re
                    } = be;
                let Ge = be.material;
                Ge.allowOverride === !0 && O !== null && (Ge = O), de.layers.test(G.layers) && ul(de, P, G, Se, Ge, Re)
            }
        }

        function ul(y, P, G, O, z, me) {
            F !== null && z.isNodeMaterial && F.setObject(y, z), y.onBeforeRender(R, P, G, O, z, me), y.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, y.matrixWorld), y.normalMatrix.getNormalMatrix(y.modelViewMatrix), z.onBeforeRender(R, P, G, O, y, me), z.transparent === !0 && z.side === xn && z.forceSinglePass === !1 ? (z.side = Wt, z.needsUpdate = !0, R.renderBufferDirect(G, P, O, z, y, me), z.side = $n, z.needsUpdate = !0, R.renderBufferDirect(G, P, O, z, y, me), z.side = xn) : R.renderBufferDirect(G, P, O, z, y, me), y.onAfterRender(R, P, G, O, z, me)
        }

        function dl(y) {
            let P = 0;
            for (const G of y) G.texture !== null && P++;
            return P
        }

        function $i(y, P, G) {
            P.isScene !== !0 && (P = et);
            const O = Ue.get(y),
                z = b.state.lights,
                me = b.state.shadowsArray,
                be = z.state.version,
                de = $.getParameters(y, z.state, me, P, G, b.state.lightProbeGridArray),
                Se = $.getProgramCacheKey(de);
            let Re = O.programs;
            O.environment = y.isMeshStandardMaterial || y.isMeshLambertMaterial || y.isMeshPhongMaterial ? P.environment : null, O.fog = P.fog;
            const Ge = y.isMeshStandardMaterial || y.isMeshLambertMaterial && !y.envMap || y.isMeshPhongMaterial && !y.envMap;
            O.envMap = w.get(y.envMap || O.environment, Ge), O.envMapRotation = O.environment !== null && y.envMap === null ? P.environmentRotation : y.envMapRotation, Re === void 0 && (y.addEventListener("dispose", lt), Re = new Map, O.programs = Re, O.programVariants = new Map);
            let nt = Re.get(Se);
            if (nt !== void 0) {
                if (O.currentProgram === nt && O.lightsStateVersion === be) return pl(y, de), nt
            } else de.uniforms = $.getUniforms(y), F !== null && y.isNodeMaterial && F.build(y, G, de), y.onBeforeCompile(de, R), nt = $.acquireProgram(de, Se), Re.set(Se, nt), O.uniforms = de.uniforms;
            const Ae = O.uniforms;
            return (!y.isShaderMaterial && !y.isRawShaderMaterial || y.clipping === !0) && (Ae.clippingPlanes = J.uniform), pl(y, de), O.needsLights = Su(y), O.lightsStateVersion = be, O.needsLights && (Ae.ambientLightColor.value = z.state.ambient, Ae.lightProbe.value = z.state.probe, Ae.sunLights.value = z.state.sun, Ae.sunLightShadows.value = z.state.sunShadow, Ae.directionalLights.value = z.state.directional, Ae.directionalLightShadows.value = z.state.directionalShadow, Ae.spotLights.value = z.state.spot, Ae.spotLightShadows.value = z.state.spotShadow, Ae.rectAreaLights.value = z.state.rectArea, Ae.ltc_1.value = z.state.rectAreaLTC1, Ae.ltc_2.value = z.state.rectAreaLTC2, Ae.pointLights.value = z.state.point, Ae.pointLightShadows.value = z.state.pointShadow, Ae.hemisphereLights.value = z.state.hemi, Ae.sunShadowMatrix.value = z.state.sunShadowMatrix, Ae.sunShadowCascade.value = z.state.sunShadowCascade, Ae.directionalShadowMatrix.value = z.state.directionalShadowMatrix, Ae.spotLightMatrix.value = z.state.spotLightMatrix, Ae.spotLightMap.value = z.state.spotLightMap, Ae.pointShadowMatrix.value = z.state.pointShadowMatrix), O.numLightProbeGrids = dl(b.state.lightProbeGridArray), O.currentProgram = nt, O.uniformsList = null, nt
        }

        function xu(y, P, G, O, z) {
            const me = Ue.get(y),
                be = me.currentProgram.id + "," + O + "," + z;
            let de = me.programVariants.get(be);
            return de === void 0 ? (de = $i(y, P, G), me.programVariants.set(be, de)) : (me.currentProgram = de, me.uniformsList = null, me.outputColorSpace = O, me.toneMapping = z), de
        }

        function fl(y) {
            if (y.uniformsList === null) {
                const P = y.currentProgram.getUniforms();
                y.uniformsList = Sr.seqWithValue(P.seq, y.uniforms)
            }
            return y.uniformsList
        }

        function pl(y, P) {
            const G = Ue.get(y);
            G.outputColorSpace = P.outputColorSpace, G.batching = P.batching, G.batchingColor = P.batchingColor, G.instancing = P.instancing, G.instancingColor = P.instancingColor, G.instancingMorph = P.instancingMorph, G.skinning = P.skinning, G.morphTargets = P.morphTargets, G.morphNormals = P.morphNormals, G.morphColors = P.morphColors, G.morphTargetsCount = P.morphTargetsCount, G.numClippingPlanes = P.numClippingPlanes, G.numIntersection = P.numClipIntersection, G.vertexAlphas = P.vertexAlphas, G.vertexTangents = P.vertexTangents, G.toneMapping = P.toneMapping
        }

        function vu(y, P, G, O, z) {
            P.isScene !== !0 && (P = et), ke.resetTextureUnits();
            const me = P.fog,
                be = O.isMeshStandardMaterial || O.isMeshLambertMaterial || O.isMeshPhongMaterial ? P.environment : null,
                de = te === null ? R.outputColorSpace : te.isXRRenderTarget === !0 ? te.texture.colorSpace : Qe.workingColorSpace,
                Se = O.isMeshStandardMaterial || O.isMeshLambertMaterial && !O.envMap || O.isMeshPhongMaterial && !O.envMap,
                Re = w.get(O.envMap || be, Se),
                Ge = O.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4,
                nt = !!G.attributes.tangent && (!!O.normalMap || O.anisotropy > 0),
                Ae = !!G.morphAttributes.position,
                it = !!G.morphAttributes.normal,
                Tt = !!G.morphAttributes.color;
            let pt = Un;
            O.toneMapped && (te === null || te.isXRRenderTarget === !0) && (pt = R.toneMapping);
            const ft = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color,
                Ot = ft !== void 0 ? ft.length : 0,
                we = Ue.get(O),
                Ht = b.state.lights;
            if (ae === !0 && (ye === !0 || y !== Q)) {
                const _t = y === Q && O.id === W;
                J.setState(O, y, _t)
            }
            let at = !1,
                ti = !1;
            O.version === we.__version ? we.needsLights && we.lightsStateVersion !== Ht.state.version || z.isBatchedMesh && we.batching === !1 || !z.isBatchedMesh && we.batching === !0 || z.isBatchedMesh && we.batchingColor === !0 && z._colorsTexture === null || z.isBatchedMesh && we.batchingColor === !1 && z._colorsTexture !== null || z.isInstancedMesh && we.instancing === !1 || !z.isInstancedMesh && we.instancing === !0 || z.isSkinnedMesh && we.skinning === !1 || !z.isSkinnedMesh && we.skinning === !0 || z.isInstancedMesh && we.instancingColor === !0 && z.instanceColor === null || z.isInstancedMesh && we.instancingColor === !1 && z.instanceColor !== null || z.isInstancedMesh && we.instancingMorph === !0 && z.morphTexture === null || z.isInstancedMesh && we.instancingMorph === !1 && z.morphTexture !== null || we.envMap !== Re || O.fog === !0 && we.fog !== me || we.numClippingPlanes !== void 0 && (we.numClippingPlanes !== J.numPlanes || we.numIntersection !== J.numIntersection) || we.vertexAlphas !== Ge || we.vertexTangents !== nt || we.morphTargets !== Ae || we.morphNormals !== it || we.morphColors !== Tt || we.morphTargetsCount !== Ot || we.numLightProbeGrids !== dl(b.state.lightProbeGridArray) ? at = !0 : (we.outputColorSpace !== de || we.toneMapping !== pt) && (ti = !0) : (at = !0, we.__version = O.version);
            let Bt = we.currentProgram;
            (at === !0 || ti === !0) && (Bt = ti === !0 ? xu(O, P, z, de, pt) : $i(O, P, z), F && O.isNodeMaterial && F.onUpdateProgram(O, Bt, we));
            let Bs = !1,
                Bn = !1,
                ni = !1;
            const st = Bt.getUniforms(),
                Ut = we.uniforms;
            if (fe.useProgram(Bt.program) && (Bs = !0, Bn = !0, ni = !0), O.id !== W && (W = O.id, Bn = !0), Bs || Q !== y) {
                fe.buffers.depth.getReversed() && y.reversedDepth !== !0 && (y._reversedDepth = !0, y.updateProjectionMatrix()), st.setValue(U, "projectionMatrix", y.projectionMatrix), st.setValue(U, "viewMatrix", y.matrixWorldInverse);
                const Nt = st.map.cameraPosition;
                Nt !== void 0 && Nt.setValue(U, Ve.setFromMatrixPosition(y.matrixWorld)), dt.logarithmicDepthBuffer && st.setValue(U, "logDepthBufFC", 2 / (Math.log(y.far + 1) / Math.LN2)), (O.isMeshPhongMaterial || O.isMeshToonMaterial || O.isMeshLambertMaterial || O.isMeshBasicMaterial || O.isMeshStandardMaterial || O.isShaderMaterial) && st.setValue(U, "isOrthographic", y.isOrthographicCamera === !0), Q !== y && (Q = y, Bn = !0, ni = !0)
            }
            if (we.needsLights && (Ht.state.sunShadowMap.length > 0 && st.setValue(U, "sunShadowMap", Ht.state.sunShadowMap, ke), Ht.state.directionalShadowMap.length > 0 && st.setValue(U, "directionalShadowMap", Ht.state.directionalShadowMap, ke), Ht.state.spotShadowMap.length > 0 && st.setValue(U, "spotShadowMap", Ht.state.spotShadowMap, ke), Ht.state.pointShadowMap.length > 0 && st.setValue(U, "pointShadowMap", Ht.state.pointShadowMap, ke)), z.isSkinnedMesh) {
                st.setOptional(U, z, "bindMatrix"), st.setOptional(U, z, "bindMatrixInverse");
                const _t = z.skeleton;
                _t && (_t.boneTexture === null && _t.computeBoneTexture(), st.setValue(U, "boneTexture", _t.boneTexture, ke))
            }
            z.isBatchedMesh && (st.setOptional(U, z, "batchingTexture"), st.setValue(U, "batchingTexture", z._matricesTexture, ke), st.setOptional(U, z, "batchingIdTexture"), st.setValue(U, "batchingIdTexture", z._indirectTexture, ke), st.setOptional(U, z, "batchingColorTexture"), z._colorsTexture !== null && st.setValue(U, "batchingColorTexture", z._colorsTexture, ke));
            const tn = G.morphAttributes;
            if ((tn.position !== void 0 || tn.normal !== void 0 || tn.color !== void 0) && Z.update(z, G, Bt), (Bn || we.receiveShadow !== z.receiveShadow) && (we.receiveShadow = z.receiveShadow, st.setValue(U, "receiveShadow", z.receiveShadow)), (O.isMeshStandardMaterial || O.isMeshLambertMaterial || O.isMeshPhongMaterial) && O.envMap === null && P.environment !== null && (Ut.envMapIntensity.value = P.environmentIntensity), Ut.dfgLUT !== void 0 && (Ut.dfgLUT.value = Ex()), Bn) {
                if (st.setValue(U, "toneMappingExposure", R.toneMappingExposure), we.needsLights && Mu(Ut, ni), me && O.fog === !0 && oe.refreshFogUniforms(Ut, me), oe.refreshMaterialUniforms(Ut, O, xe, Ne, b.state.transmissionRenderTarget[y.id]), we.needsLights && we.numLightProbeGrids > 0) {
                    const _t = v;
                    let Nt = 0;
                    for (const An of b.state.lightProbeGridArray) An.texture !== null && (_t.textures[Nt] = An.texture, _t.min[Nt] = An.boundingBox.min, _t.max[Nt] = An.boundingBox.max, _t.resolution[Nt] = An.resolution, Nt++);
                    for (const An in _t) _t[An].length = Nt;
                    Ut.probesSH.value = _t.textures, Ut.probesMin.value = _t.min, Ut.probesMax.value = _t.max, Ut.probesResolution.value = _t.resolution
                }
                Sr.upload(U, fl(we), Ut, ke)
            }
            if (O.isShaderMaterial && O.uniformsNeedUpdate === !0 && (Sr.upload(U, fl(we), Ut, ke), O.uniformsNeedUpdate = !1), O.isSpriteMaterial && st.setValue(U, "center", z.center), st.setValue(U, "modelViewMatrix", z.modelViewMatrix), st.setValue(U, "normalMatrix", z.normalMatrix), st.setValue(U, "modelMatrix", z.matrixWorld), O.uniformsGroups !== void 0) {
                const _t = O.uniformsGroups;
                for (let Nt = 0, An = _t.length; Nt < An; Nt++) {
                    const gl = _t[Nt];
                    Pe.update(gl, Bt), Pe.bind(gl, Bt)
                }
            }
            return Bt
        }

        function Mu(y, P) {
            y.ambientLightColor.needsUpdate = P, y.lightProbe.needsUpdate = P, y.sunLights.needsUpdate = P, y.sunLightShadows.needsUpdate = P, y.directionalLights.needsUpdate = P, y.directionalLightShadows.needsUpdate = P, y.pointLights.needsUpdate = P, y.pointLightShadows.needsUpdate = P, y.spotLights.needsUpdate = P, y.spotLightShadows.needsUpdate = P, y.rectAreaLights.needsUpdate = P, y.hemisphereLights.needsUpdate = P
        }

        function Su(y) {
            return y.isMeshLambertMaterial || y.isMeshToonMaterial || y.isMeshPhongMaterial || y.isMeshStandardMaterial || y.isShadowMaterial || y.isShaderMaterial && y.lights === !0
        }
        this.getActiveCubeFace = function() {
            return X
        }, this.getActiveMipmapLevel = function() {
            return H
        }, this.getRenderTarget = function() {
            return te
        }, this.setRenderTargetTextures = function(y, P, G) {
            const O = Ue.get(y);
            O.__autoAllocateDepthBuffer = y.resolveDepthBuffer === !1, O.__autoAllocateDepthBuffer === !1 && (O.__useRenderToTexture = !1), Ue.get(y.texture).__webglTexture = P, Ue.get(y.depthTexture).__webglTexture = O.__autoAllocateDepthBuffer ? void 0 : G, O.__hasExternalTextures = !0
        }, this.setRenderTargetFramebuffer = function(y, P) {
            const G = Ue.get(y);
            G.__webglFramebuffer = P, G.__useDefaultFramebuffer = P === void 0
        }, this.setRenderTarget = function(y, P = 0, G = 0) {
            te = y, X = P, H = G;
            let O = null,
                z = !1,
                me = !1;
            if (y) {
                const de = Ue.get(y);
                if (de.__useDefaultFramebuffer !== void 0) {
                    fe.bindFramebuffer(U.FRAMEBUFFER, de.__webglFramebuffer), ee.copy(y.viewport), Te.copy(y.scissor), Oe = y.scissorTest, fe.viewport(ee), fe.scissor(Te), fe.setScissorTest(Oe), W = -1;
                    return
                } else if (de.__webglFramebuffer === void 0) ke.setupRenderTarget(y);
                else if (de.__hasExternalTextures) ke.rebindTextures(y, Ue.get(y.texture).__webglTexture, Ue.get(y.depthTexture).__webglTexture);
                else if (y.depthBuffer) {
                    const Ge = y.depthTexture;
                    if (de.__boundDepthTexture !== Ge) {
                        if (Ge !== null && Ue.has(Ge) && (y.width !== Ge.image.width || y.height !== Ge.image.height)) throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");
                        ke.setupDepthRenderbuffer(y)
                    }
                }
                const Se = y.texture;
                (Se.isData3DTexture || Se.isDataArrayTexture || Se.isCompressedArrayTexture) && (me = !0);
                const Re = Ue.get(y).__webglFramebuffer;
                y.isWebGLCubeRenderTarget ? (Array.isArray(Re[P]) ? O = Re[P][G] : O = Re[P], z = !0) : y.samples > 0 && ke.useMultisampledRTT(y) === !1 ? O = Ue.get(y).__webglMultisampledFramebuffer : Array.isArray(Re) ? O = Re[G] : O = Re, ee.copy(y.viewport), Te.copy(y.scissor), Oe = y.scissorTest
            } else ee.copy(Be).multiplyScalar(xe).floor(), Te.copy(Je).multiplyScalar(xe).floor(), Oe = je;
            if (G !== 0 && (O = V), fe.bindFramebuffer(U.FRAMEBUFFER, O) && fe.drawBuffers(y, O), fe.viewport(ee), fe.scissor(Te), fe.setScissorTest(Oe), z) {
                const de = Ue.get(y.texture);
                U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + P, de.__webglTexture, G)
            } else if (me) {
                const de = P;
                for (let Se = 0; Se < y.textures.length; Se++) {
                    const Re = Ue.get(y.textures[Se]);
                    U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0 + Se, Re.__webglTexture, G, de)
                }
            } else if (y !== null && G !== 0) {
                const de = Ue.get(y.texture);
                U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, de.__webglTexture, G)
            }
            W = -1
        };

        function ml(y) {
            const P = Ue.get(y);
            return (P.__readFormat !== y.format || P.__readType !== y.type) && (P.__readFormat = y.format, P.__readType = y.type, P.__formatReadable = dt.textureFormatReadable(y.format), P.__typeReadable = dt.textureTypeReadable(y.type)), P
        }
        this.readRenderTargetPixels = function(y, P, G, O, z, me, be, de = 0) {
            if (!(y && y.isWebGLRenderTarget)) {
                ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
                return
            }
            let Se = Ue.get(y).__webglFramebuffer;
            if (y.isWebGLCubeRenderTarget && be !== void 0 && (Se = Se[be], Array.isArray(Se) && (Se = Se[0])), Se) {
                fe.bindFramebuffer(U.FRAMEBUFFER, Se);
                try {
                    const Re = y.textures[de],
                        Ge = Re.format,
                        nt = Re.type;
                    y.textures.length > 1 && U.readBuffer(U.COLOR_ATTACHMENT0 + de);
                    const Ae = ml(Re);
                    if (Ae.__formatReadable === !1) {
                        ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
                        return
                    }
                    if (Ae.__typeReadable === !1) {
                        ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
                        return
                    }
                    P >= 0 && P <= y.width - O && G >= 0 && G <= y.height - z && U.readPixels(P, G, O, z, se.convert(Ge), se.convert(nt), me)
                } finally {
                    const Re = te !== null ? Ue.get(te).__webglFramebuffer : null;
                    fe.bindFramebuffer(U.FRAMEBUFFER, Re)
                }
            }
        }, this.readRenderTargetPixelsAsync = async function(y, P, G, O, z, me, be, de = 0) {
            if (!(y && y.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            let Se = Ue.get(y).__webglFramebuffer;
            if (y.isWebGLCubeRenderTarget && be !== void 0 && (Se = Se[be], Array.isArray(Se) && (Se = Se[0])), Se)
                if (P >= 0 && P <= y.width - O && G >= 0 && G <= y.height - z) {
                    fe.bindFramebuffer(U.FRAMEBUFFER, Se);
                    const Re = y.textures[de],
                        Ge = Re.format,
                        nt = Re.type;
                    y.textures.length > 1 && U.readBuffer(U.COLOR_ATTACHMENT0 + de);
                    const Ae = ml(Re);
                    if (Ae.__formatReadable === !1) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
                    if (Ae.__typeReadable === !1) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
                    const it = U.createBuffer();
                    U.bindBuffer(U.PIXEL_PACK_BUFFER, it), U.bufferData(U.PIXEL_PACK_BUFFER, me.byteLength, U.STREAM_READ), U.readPixels(P, G, O, z, se.convert(Ge), se.convert(nt), 0), U.bindBuffer(U.PIXEL_PACK_BUFFER, null);
                    const Tt = te !== null ? Ue.get(te).__webglFramebuffer : null;
                    fe.bindFramebuffer(U.FRAMEBUFFER, Tt);
                    const pt = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
                    return U.flush(), await dd(U, pt, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, it), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, me), U.bindBuffer(U.PIXEL_PACK_BUFFER, null), U.deleteBuffer(it), U.deleteSync(pt), me
                } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")
        }, this.copyFramebufferToTexture = function(y, P = null, G = 0) {
            const O = Math.pow(2, -G),
                z = Math.floor(y.image.width * O),
                me = Math.floor(y.image.height * O),
                be = P !== null ? P.x : 0,
                de = P !== null ? P.y : 0;
            ke.setTexture2D(y, 0), U.copyTexSubImage2D(U.TEXTURE_2D, G, 0, 0, be, de, z, me), fe.unbindTexture()
        }, this.copyTextureToTexture = function(y, P, G = null, O = null, z = 0, me = 0) {
            let be, de, Se, Re, Ge, nt, Ae, it, Tt;
            const pt = y.isCompressedTexture ? y.mipmaps[me] : y.image;
            if (G !== null) be = G.max.x - G.min.x, de = G.max.y - G.min.y, Se = G.isBox3 ? G.max.z - G.min.z : 1, Re = G.min.x, Ge = G.min.y, nt = G.isBox3 ? G.min.z : 0;
            else {
                const st = Math.pow(2, -z);
                be = Math.floor(pt.width * st), de = Math.floor(pt.height * st), y.isDataArrayTexture ? Se = pt.depth : y.isData3DTexture ? Se = Math.floor(pt.depth * st) : Se = 1, Re = 0, Ge = 0, nt = 0
            }
            O !== null ? (Ae = O.x, it = O.y, Tt = O.z) : (Ae = 0, it = 0, Tt = 0);
            const ft = se.convert(P.format),
                Ot = se.convert(P.type);
            let we;
            P.isData3DTexture ? (ke.setTexture3D(P, 0), we = U.TEXTURE_3D) : P.isDataArrayTexture || P.isCompressedArrayTexture ? (ke.setTexture2DArray(P, 0), we = U.TEXTURE_2D_ARRAY) : (ke.setTexture2D(P, 0), we = U.TEXTURE_2D), fe.activeTexture(U.TEXTURE0), fe.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, P.flipY), fe.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, P.premultiplyAlpha), fe.pixelStorei(U.UNPACK_ALIGNMENT, P.unpackAlignment);
            const Ht = fe.getParameter(U.UNPACK_ROW_LENGTH),
                at = fe.getParameter(U.UNPACK_IMAGE_HEIGHT),
                ti = fe.getParameter(U.UNPACK_SKIP_PIXELS),
                Bt = fe.getParameter(U.UNPACK_SKIP_ROWS),
                Bs = fe.getParameter(U.UNPACK_SKIP_IMAGES);
            fe.pixelStorei(U.UNPACK_ROW_LENGTH, pt.width), fe.pixelStorei(U.UNPACK_IMAGE_HEIGHT, pt.height), fe.pixelStorei(U.UNPACK_SKIP_PIXELS, Re), fe.pixelStorei(U.UNPACK_SKIP_ROWS, Ge), fe.pixelStorei(U.UNPACK_SKIP_IMAGES, nt);
            const Bn = y.isDataArrayTexture || y.isData3DTexture,
                ni = P.isDataArrayTexture || P.isData3DTexture;
            if (y.isDepthTexture) {
                const st = Ue.get(y),
                    Ut = Ue.get(P),
                    tn = Ue.get(st.__renderTarget),
                    _t = Ue.get(Ut.__renderTarget);
                fe.bindFramebuffer(U.READ_FRAMEBUFFER, tn.__webglFramebuffer), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, _t.__webglFramebuffer);
                for (let Nt = 0; Nt < Se; Nt++) Bn && (U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ue.get(y).__webglTexture, z, nt + Nt), U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ue.get(P).__webglTexture, me, Tt + Nt)), U.blitFramebuffer(Re, Ge, Re + be, Ge + de, Ae, it, Ae + be, it + de, U.DEPTH_BUFFER_BIT, U.NEAREST);
                fe.bindFramebuffer(U.READ_FRAMEBUFFER, null), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, null)
            } else if (z !== 0 || y.isRenderTargetTexture || Ue.has(y)) {
                const st = Ue.get(y),
                    Ut = Ue.get(P);
                fe.bindFramebuffer(U.READ_FRAMEBUFFER, L), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, k);
                for (let tn = 0; tn < Se; tn++) Bn ? U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, st.__webglTexture, z, nt + tn) : U.framebufferTexture2D(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, st.__webglTexture, z), ni ? U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ut.__webglTexture, me, Tt + tn) : U.framebufferTexture2D(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_2D, Ut.__webglTexture, me), z !== 0 ? U.blitFramebuffer(Re, Ge, Re + be, Ge + de, Ae, it, Ae + be, it + de, U.COLOR_BUFFER_BIT, U.NEAREST) : ni ? U.copyTexSubImage3D(we, me, Ae, it, Tt + tn, Re, Ge, be, de) : U.copyTexSubImage2D(we, me, Ae, it, Re, Ge, be, de);
                fe.bindFramebuffer(U.READ_FRAMEBUFFER, null), fe.bindFramebuffer(U.DRAW_FRAMEBUFFER, null)
            } else ni ? y.isDataTexture || y.isData3DTexture ? U.texSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, Ot, pt.data) : P.isCompressedArrayTexture ? U.compressedTexSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, pt.data) : U.texSubImage3D(we, me, Ae, it, Tt, be, de, Se, ft, Ot, pt) : y.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, me, Ae, it, be, de, ft, Ot, pt.data) : y.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, me, Ae, it, pt.width, pt.height, ft, pt.data) : U.texSubImage2D(U.TEXTURE_2D, me, Ae, it, be, de, ft, Ot, pt);
            fe.pixelStorei(U.UNPACK_ROW_LENGTH, Ht), fe.pixelStorei(U.UNPACK_IMAGE_HEIGHT, at), fe.pixelStorei(U.UNPACK_SKIP_PIXELS, ti), fe.pixelStorei(U.UNPACK_SKIP_ROWS, Bt), fe.pixelStorei(U.UNPACK_SKIP_IMAGES, Bs), me === 0 && P.generateMipmaps === !0 && P.mipmapsAutoUpdate === !0 && U.generateMipmap(we), fe.unbindTexture()
        }, this.initRenderTarget = function(y) {
            Ue.get(y).__webglFramebuffer === void 0 && ke.setupRenderTarget(y)
        }, this.initTexture = function(y) {
            y.isCubeTexture ? ke.setTextureCube(y, 0) : y.isData3DTexture ? ke.setTexture3D(y, 0) : y.isDataArrayTexture || y.isCompressedArrayTexture ? ke.setTexture2DArray(y, 0) : ke.setTexture2D(y, 0), fe.unbindTexture()
        }, this.resetState = function() {
            X = 0, H = 0, te = null, fe.reset(), le.reset()
        }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }))
    }
    get coordinateSystem() {
        return cn
    }
    get outputColorSpace() {
        return this._outputColorSpace
    }
    set outputColorSpace(e) {
        this._outputColorSpace = e;
        const t = this.getContext();
        t.drawingBufferColorSpace = Qe._getDrawingBufferColorSpace(e), t.unpackColorSpace = Qe._getUnpackColorSpace()
    }
}
