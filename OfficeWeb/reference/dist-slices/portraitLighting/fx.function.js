function fx(s, e) {
    function t() {
        let C = !1;
        const Z = new ht;
        let q = null;
        const ue = new ht(0, 0, 0, 0);
        return {
            setMask: function(se) {
                q !== se && !C && (s.colorMask(se, se, se, se), q = se)
            },
            setLocked: function(se) {
                C = se
            },
            setClear: function(se, le, Pe, qe, ie) {
                ie === !0 && (se *= qe, le *= qe, Pe *= qe), Z.set(se, le, Pe, qe), ue.equals(Z) === !1 && (s.clearColor(se, le, Pe, qe), ue.copy(Z))
            },
            reset: function() {
                C = !1, q = null, ue.set(-1, 0, 0, 0)
            }
        }
    }

    function n() {
        let C = !1,
            Z = !1,
            q = null,
            ue = null,
            se = null;
        return {
            setReversed: function(le) {
                if (Z !== le) {
                    const Pe = e.get("EXT_clip_control");
                    le ? Pe.clipControlEXT(Pe.LOWER_LEFT_EXT, Pe.ZERO_TO_ONE_EXT) : Pe.clipControlEXT(Pe.LOWER_LEFT_EXT, Pe.NEGATIVE_ONE_TO_ONE_EXT), Z = le;
                    const qe = se;
                    se = null, this.setClear(qe)
                }
            },
            getReversed: function() {
                return Z
            },
            setTest: function(le) {
                le ? xe(s.DEPTH_TEST) : De(s.DEPTH_TEST)
            },
            setMask: function(le) {
                q !== le && !C && (s.depthMask(le), q = le)
            },
            setFunc: function(le) {
                if (Z && (le = fd[le]), ue !== le) {
                    switch (le) {
                        case La:
                            s.depthFunc(s.NEVER);
                            break;
                        case Pa:
                            s.depthFunc(s.ALWAYS);
                            break;
                        case Ia:
                            s.depthFunc(s.LESS);
                            break;
                        case vs:
                            s.depthFunc(s.LEQUAL);
                            break;
                        case Na:
                            s.depthFunc(s.EQUAL);
                            break;
                        case Da:
                            s.depthFunc(s.GEQUAL);
                            break;
                        case Ua:
                            s.depthFunc(s.GREATER);
                            break;
                        case Fa:
                            s.depthFunc(s.NOTEQUAL);
                            break;
                        default:
                            s.depthFunc(s.LEQUAL)
                    }
                    ue = le
                }
            },
            setLocked: function(le) {
                C = le
            },
            setClear: function(le) {
                se !== le && (se = le, Z && (le = 1 - le), s.clearDepth(le))
            },
            reset: function() {
                C = !1, q = null, ue = null, se = null, Z = !1
            }
        }
    }

    function i() {
        let C = !1,
            Z = null,
            q = null,
            ue = null,
            se = null,
            le = null,
            Pe = null,
            qe = null,
            ie = null;
        return {
            setTest: function(Ie) {
                C || (Ie ? xe(s.STENCIL_TEST) : De(s.STENCIL_TEST))
            },
            setMask: function(Ie) {
                Z !== Ie && !C && (s.stencilMask(Ie), Z = Ie)
            },
            setFunc: function(Ie, Xe, ve) {
                (q !== Ie || ue !== Xe || se !== ve) && (s.stencilFunc(Ie, Xe, ve), q = Ie, ue = Xe, se = ve)
            },
            setOp: function(Ie, Xe, ve) {
                (le !== Ie || Pe !== Xe || qe !== ve) && (s.stencilOp(Ie, Xe, ve), le = Ie, Pe = Xe, qe = ve)
            },
            setLocked: function(Ie) {
                C = Ie
            },
            setClear: function(Ie) {
                ie !== Ie && (s.clearStencil(Ie), ie = Ie)
            },
            reset: function() {
                C = !1, Z = null, q = null, ue = null, se = null, le = null, Pe = null, qe = null, ie = null
            }
        }
    }
    const r = new t,
        a = new n,
        o = new i;
    let l = {};
    const c = new WeakMap;
    let h = {},
        u = {},
        d = {},
        f = new WeakMap,
        p = [],
        x = null,
        m = !1,
        g = null,
        M = null,
        E = null,
        v = null,
        A = null,
        b = null,
        _ = null,
        T = new Fe(0, 0, 0),
        I = 0,
        R = !1,
        D = null,
        F = null,
        V = null,
        L = null,
        k = null;
    const X = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let H = !1,
        te = 0;
    const W = s.getParameter(s.VERSION);
    W.indexOf("WebGL") !== -1 ? (te = parseFloat(/^WebGL (\d)/.exec(W)[1]), H = te >= 1) : W.indexOf("OpenGL ES") !== -1 && (te = parseFloat(/^OpenGL ES (\d)/.exec(W)[1]), H = te >= 2);
    let Q = null,
        ee = {};
    const Te = s.getParameter(s.SCISSOR_BOX),
        Oe = s.getParameter(s.VIEWPORT),
        Y = new ht().fromArray(Te),
        _e = new ht().fromArray(Oe);

    function Ee(C, Z, q, ue) {
        const se = new Uint8Array(4),
            le = s.createTexture();
        s.bindTexture(C, le), s.texParameteri(C, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(C, s.TEXTURE_MAG_FILTER, s.NEAREST);
        for (let Pe = 0; Pe < q; Pe++) C === s.TEXTURE_3D || C === s.TEXTURE_2D_ARRAY ? s.texImage3D(Z, 0, s.RGBA, 1, 1, ue, 0, s.RGBA, s.UNSIGNED_BYTE, se) : s.texImage2D(Z + Pe, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, se);
        return le
    }
    const Ne = {};
    Ne[s.TEXTURE_2D] = Ee(s.TEXTURE_2D, s.TEXTURE_2D, 1), Ne[s.TEXTURE_CUBE_MAP] = Ee(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), Ne[s.TEXTURE_2D_ARRAY] = Ee(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), Ne[s.TEXTURE_3D] = Ee(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), xe(s.DEPTH_TEST), a.setFunc(vs), ye(!1), ge(xl), xe(s.CULL_FACE), ce(Ui);

    function xe(C) {
        h[C] !== !0 && (s.enable(C), h[C] = !0)
    }

    function De(C) {
        h[C] !== !1 && (s.disable(C), h[C] = !1)
    }

    function mt(C, Z) {
        return d[C] !== Z ? (s.bindFramebuffer(C, Z), d[C] = Z, C === s.DRAW_FRAMEBUFFER && (d[s.FRAMEBUFFER] = Z), C === s.FRAMEBUFFER && (d[s.DRAW_FRAMEBUFFER] = Z), !0) : !1
    }

    function Be(C, Z) {
        let q = p,
            ue = !1;
        if (C) {
            q = f.get(Z), q === void 0 && (q = [], f.set(Z, q));
            const se = C.textures;
            if (q.length !== se.length || q[0] !== s.COLOR_ATTACHMENT0) {
                for (let le = 0, Pe = se.length; le < Pe; le++) q[le] = s.COLOR_ATTACHMENT0 + le;
                q.length = se.length, ue = !0
            }
        } else q[0] !== s.BACK && (q[0] = s.BACK, ue = !0);
        ue && s.drawBuffers(q)
    }

    function Je(C) {
        return x !== C ? (s.useProgram(C), x = C, !0) : !1
    }
    const je = {
        [Li]: s.FUNC_ADD,
        [Lu]: s.FUNC_SUBTRACT,
        [Pu]: s.FUNC_REVERSE_SUBTRACT
    };
    je[Iu] = s.MIN, je[Nu] = s.MAX;
    const j = {
        [Du]: s.ZERO,
        [Uu]: s.ONE,
        [Fu]: s.SRC_COLOR,
        [Zc]: s.SRC_ALPHA,
        [Gu]: s.SRC_ALPHA_SATURATE,
        [ku]: s.DST_COLOR,
        [Bu]: s.DST_ALPHA,
        [Ou]: s.ONE_MINUS_SRC_COLOR,
        [$c]: s.ONE_MINUS_SRC_ALPHA,
        [Hu]: s.ONE_MINUS_DST_COLOR,
        [zu]: s.ONE_MINUS_DST_ALPHA,
        [Vu]: s.CONSTANT_COLOR,
        [Wu]: s.ONE_MINUS_CONSTANT_COLOR,
        [Xu]: s.CONSTANT_ALPHA,
        [qu]: s.ONE_MINUS_CONSTANT_ALPHA
    };

    function ce(C, Z, q, ue, se, le, Pe, qe, ie, Ie) {
        if (C === Ui) {
            m === !0 && (De(s.BLEND), m = !1);
            return
        }
        if (m === !1 && (xe(s.BLEND), m = !0), C !== Cu) {
            if (C !== g || Ie !== R) {
                if ((M !== Li || A !== Li) && (s.blendEquation(s.FUNC_ADD), M = Li, A = Li), Ie) switch (C) {
                    case fs:
                        s.blendFuncSeparate(s.ONE, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
                        break;
                    case vl:
                        s.blendFunc(s.ONE, s.ONE);
                        break;
                    case Ml:
                        s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
                        break;
                    case Sl:
                        s.blendFuncSeparate(s.DST_COLOR, s.ONE_MINUS_SRC_ALPHA, s.ZERO, s.ONE);
                        break;
                    default:
                        ze("WebGLState: Invalid blending: ", C);
                        break
                } else switch (C) {
                    case fs:
                        s.blendFuncSeparate(s.SRC_ALPHA, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
                        break;
                    case vl:
                        s.blendFuncSeparate(s.SRC_ALPHA, s.ONE, s.ONE, s.ONE);
                        break;
                    case Ml:
                        ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");
                        break;
                    case Sl:
                        ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");
                        break;
                    default:
                        ze("WebGLState: Invalid blending: ", C);
                        break
                }
                E = null, v = null, b = null, _ = null, T.set(0, 0, 0), I = 0, g = C, R = Ie
            }
            return
        }
        se = se || Z, le = le || q, Pe = Pe || ue, (Z !== M || se !== A) && (s.blendEquationSeparate(je[Z], je[se]), M = Z, A = se), (q !== E || ue !== v || le !== b || Pe !== _) && (s.blendFuncSeparate(j[q], j[ue], j[le], j[Pe]), E = q, v = ue, b = le, _ = Pe), (qe.equals(T) === !1 || ie !== I) && (s.blendColor(qe.r, qe.g, qe.b, ie), T.copy(qe), I = ie), g = C, R = !1
    }

    function ae(C, Z) {
        C.side === xn ? De(s.CULL_FACE) : xe(s.CULL_FACE);
        let q = C.side === Wt;
        Z && (q = !q), ye(q), C.blending === fs && C.transparent === !1 ? ce(Ui) : ce(C.blending, C.blendEquation, C.blendSrc, C.blendDst, C.blendEquationAlpha, C.blendSrcAlpha, C.blendDstAlpha, C.blendColor, C.blendAlpha, C.premultipliedAlpha), a.setFunc(C.depthFunc), a.setTest(C.depthTest), a.setMask(C.depthWrite), r.setMask(C.colorWrite);
        const ue = C.stencilWrite;
        o.setTest(ue), ue && (o.setMask(C.stencilWriteMask), o.setFunc(C.stencilFunc, C.stencilRef, C.stencilFuncMask), o.setOp(C.stencilFail, C.stencilZFail, C.stencilZPass)), Le(C.polygonOffset, C.polygonOffsetFactor, C.polygonOffsetUnits), C.alphaToCoverage === !0 ? xe(s.SAMPLE_ALPHA_TO_COVERAGE) : De(s.SAMPLE_ALPHA_TO_COVERAGE)
    }

    function ye(C) {
        D !== C && (C ? s.frontFace(s.CW) : s.frontFace(s.CCW), D = C)
    }

    function ge(C) {
        C !== Au ? (xe(s.CULL_FACE), C !== F && (C === xl ? s.cullFace(s.BACK) : C === wu ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : De(s.CULL_FACE), F = C
    }

    function Ve(C) {
        C !== V && (H && s.lineWidth(C), V = C)
    }

    function Le(C, Z, q) {
        C ? (xe(s.POLYGON_OFFSET_FILL), (L !== Z || k !== q) && (L = Z, k = q, a.getReversed() && (Z = -Z, q = -q), s.polygonOffset(Z, q))) : De(s.POLYGON_OFFSET_FILL)
    }

    function et(C) {
        C ? xe(s.SCISSOR_TEST) : De(s.SCISSOR_TEST)
    }

    function tt(C) {
        C === void 0 && (C = s.TEXTURE0 + X - 1), Q !== C && (s.activeTexture(C), Q = C)
    }

    function rt(C, Z, q) {
        q === void 0 && (Q === null ? q = s.TEXTURE0 + X - 1 : q = Q);
        let ue = ee[q];
        ue === void 0 && (ue = {
            type: void 0,
            texture: void 0
        }, ee[q] = ue), (ue.type !== C || ue.texture !== Z) && (Q !== q && (s.activeTexture(q), Q = q), s.bindTexture(C, Z || Ne[C]), ue.type = C, ue.texture = Z)
    }

    function U() {
        const C = ee[Q];
        C !== void 0 && C.type !== void 0 && (s.bindTexture(C.type, null), C.type = void 0, C.texture = void 0)
    }

    function yt() {
        try {
            s.compressedTexImage2D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function $e() {
        try {
            s.compressedTexImage3D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function dt() {
        try {
            s.texSubImage2D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function fe() {
        try {
            s.texSubImage3D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function St() {
        try {
            s.compressedTexSubImage2D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function Ue() {
        try {
            s.compressedTexSubImage3D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function ke() {
        try {
            s.texStorage2D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function w() {
        try {
            s.texStorage3D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function S() {
        try {
            s.texImage2D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function B() {
        try {
            s.texImage3D(...arguments)
        } catch (C) {
            ze("WebGLState:", C)
        }
    }

    function ne(C) {
        return u[C] !== void 0 ? u[C] : s.getParameter(C)
    }

    function $(C, Z) {
        u[C] !== Z && (s.pixelStorei(C, Z), u[C] = Z)
    }

    function oe(C) {
        Y.equals(C) === !1 && (s.scissor(C.x, C.y, C.z, C.w), Y.copy(C))
    }

    function pe(C) {
        _e.equals(C) === !1 && (s.viewport(C.x, C.y, C.z, C.w), _e.copy(C))
    }

    function K(C, Z) {
        let q = c.get(Z);
        q === void 0 && (q = new WeakMap, c.set(Z, q));
        let ue = q.get(C);
        ue === void 0 && (ue = s.getUniformBlockIndex(Z, C.name), s.uniformBlockBinding(Z, ue, ue), q.set(C, ue))
    }

    function J(C, Z, q) {
        const se = c.get(Z).get(C);
        l[se] !== q && (s.bindBufferBase(s.UNIFORM_BUFFER, se, q), l[se] = q)
    }

    function he() {
        s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), a.setReversed(!1), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), s.pixelStorei(s.PACK_ALIGNMENT, 4), s.pixelStorei(s.UNPACK_ALIGNMENT, 4), s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, !1), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, s.BROWSER_DEFAULT_WEBGL), s.pixelStorei(s.PACK_ROW_LENGTH, 0), s.pixelStorei(s.PACK_SKIP_PIXELS, 0), s.pixelStorei(s.PACK_SKIP_ROWS, 0), s.pixelStorei(s.UNPACK_ROW_LENGTH, 0), s.pixelStorei(s.UNPACK_IMAGE_HEIGHT, 0), s.pixelStorei(s.UNPACK_SKIP_PIXELS, 0), s.pixelStorei(s.UNPACK_SKIP_ROWS, 0), s.pixelStorei(s.UNPACK_SKIP_IMAGES, 0), h = {}, u = {}, Q = null, ee = {}, d = {}, l = {}, f = new WeakMap, p = [], x = null, m = !1, g = null, M = null, E = null, v = null, A = null, b = null, _ = null, T = new Fe(0, 0, 0), I = 0, R = !1, D = null, F = null, V = null, L = null, k = null, Y.set(0, 0, s.canvas.width, s.canvas.height), _e.set(0, 0, s.canvas.width, s.canvas.height), r.reset(), a.reset(), o.reset()
    }
    return {
        buffers: {
            color: r,
            depth: a,
            stencil: o
        },
        enable: xe,
        disable: De,
        bindFramebuffer: mt,
        drawBuffers: Be,
        useProgram: Je,
        setBlending: ce,
        setMaterial: ae,
        setFlipSided: ye,
        setCullFace: ge,
        setLineWidth: Ve,
        setPolygonOffset: Le,
        setScissorTest: et,
        activeTexture: tt,
        bindTexture: rt,
        unbindTexture: U,
        compressedTexImage2D: yt,
        compressedTexImage3D: $e,
        texImage2D: S,
        texImage3D: B,
        pixelStorei: $,
        getParameter: ne,
        updateUBOMapping: K,
        uniformBlockBinding: J,
        texStorage2D: ke,
        texStorage3D: w,
        texSubImage2D: dt,
        texSubImage3D: fe,
        compressedTexSubImage2D: St,
        compressedTexSubImage3D: Ue,
        scissor: oe,
        viewport: pe,
        reset: he
    }
}

