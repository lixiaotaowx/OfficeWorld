function px(s, e, t, n, i, r, a) {
    const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null,
        l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent),
        c = new re,
        h = new WeakMap,
        u = new Set;
    let d;
    const f = new WeakMap,
        p = new Set,
        x = new FinalizationRegistry(w => p.delete(w));
    let m = !1;
    try {
        m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null
    } catch {}

    function g(w, S) {
        return m ? new OffscreenCanvas(w, S) : bs("canvas")
    }

    function M(w, S, B) {
        let ne = 1;
        const $ = ke(w);
        if (($.width > B || $.height > B) && (ne = B / Math.max($.width, $.height)), ne < 1)
            if (typeof HTMLImageElement < "u" && w instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && w instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && w instanceof ImageBitmap || typeof VideoFrame < "u" && w instanceof VideoFrame) {
                const oe = Math.floor(ne * $.width),
                    pe = Math.floor(ne * $.height);
                d === void 0 && (d = g(oe, pe));
                const K = S ? g(oe, pe) : d;
                return K.width = oe, K.height = pe, K.getContext("2d").drawImage(w, 0, 0, oe, pe), Ce("WebGLRenderer: Texture has been resized from (" + $.width + "x" + $.height + ") to (" + oe + "x" + pe + ")."), K
            } else return "data" in w && Ce("WebGLRenderer: Image in DataTexture is too big (" + $.width + "x" + $.height + ")."), w;
        return w
    }

    function E(w) {
        return w.generateMipmaps
    }

    function v(w) {
        s.generateMipmap(w)
    }

    function A(w) {
        return w.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : w.isWebGL3DRenderTarget ? s.TEXTURE_3D : w.isWebGLArrayRenderTarget || w.isCompressedArrayTexture ? s.TEXTURE_2D_ARRAY : s.TEXTURE_2D
    }

    function b(w, S, B, ne, $, oe = !1) {
        if (w !== null) {
            if (s[w] !== void 0) return s[w];
            Ce("WebGLRenderer: Attempt to use non-existing WebGL internal format '" + w + "'")
        }
        let pe;
        ne && (pe = e.get("EXT_texture_norm16"), pe || Ce("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));
        let K = S;
        if (S === s.RED && (B === s.FLOAT && (K = s.R32F), B === s.HALF_FLOAT && (K = s.R16F), B === s.UNSIGNED_BYTE && (K = s.R8), B === s.UNSIGNED_SHORT && pe && (K = pe.R16_EXT), B === s.SHORT && pe && (K = pe.R16_SNORM_EXT)), S === s.RED_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.R8UI), B === s.UNSIGNED_SHORT && (K = s.R16UI), B === s.UNSIGNED_INT && (K = s.R32UI), B === s.BYTE && (K = s.R8I), B === s.SHORT && (K = s.R16I), B === s.INT && (K = s.R32I)), S === s.RG && (B === s.FLOAT && (K = s.RG32F), B === s.HALF_FLOAT && (K = s.RG16F), B === s.UNSIGNED_BYTE && (K = s.RG8), B === s.UNSIGNED_SHORT && pe && (K = pe.RG16_EXT), B === s.SHORT && pe && (K = pe.RG16_SNORM_EXT)), S === s.RG_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RG8UI), B === s.UNSIGNED_SHORT && (K = s.RG16UI), B === s.UNSIGNED_INT && (K = s.RG32UI), B === s.BYTE && (K = s.RG8I), B === s.SHORT && (K = s.RG16I), B === s.INT && (K = s.RG32I)), S === s.RGB_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RGB8UI), B === s.UNSIGNED_SHORT && (K = s.RGB16UI), B === s.UNSIGNED_INT && (K = s.RGB32UI), B === s.BYTE && (K = s.RGB8I), B === s.SHORT && (K = s.RGB16I), B === s.INT && (K = s.RGB32I)), S === s.RGBA_INTEGER && (B === s.UNSIGNED_BYTE && (K = s.RGBA8UI), B === s.UNSIGNED_SHORT && (K = s.RGBA16UI), B === s.UNSIGNED_INT && (K = s.RGBA32UI), B === s.BYTE && (K = s.RGBA8I), B === s.SHORT && (K = s.RGBA16I), B === s.INT && (K = s.RGBA32I)), S === s.RGB && (B === s.UNSIGNED_SHORT && pe && (K = pe.RGB16_EXT), B === s.SHORT && pe && (K = pe.RGB16_SNORM_EXT), B === s.UNSIGNED_INT_5_9_9_9_REV && (K = s.RGB9_E5), B === s.UNSIGNED_INT_10F_11F_11F_REV && (K = s.R11F_G11F_B10F)), S === s.RGBA) {
            const J = oe ? Ar : Qe.getTransfer($);
            B === s.FLOAT && (K = s.RGBA32F), B === s.HALF_FLOAT && (K = s.RGBA16F), B === s.UNSIGNED_BYTE && (K = J === ct ? s.SRGB8_ALPHA8 : s.RGBA8), B === s.UNSIGNED_SHORT && pe && (K = pe.RGBA16_EXT), B === s.SHORT && pe && (K = pe.RGBA16_SNORM_EXT), B === s.UNSIGNED_SHORT_4_4_4_4 && (K = s.RGBA4), B === s.UNSIGNED_SHORT_5_5_5_1 && (K = s.RGB5_A1)
        }
        return (K === s.R16F || K === s.R32F || K === s.RG16F || K === s.RG32F || K === s.RGBA16F || K === s.RGBA32F) && e.get("EXT_color_buffer_float"), K
    }

    function _(w, S) {
        let B;
        return w ? S === null || S === Sn || S === ki ? B = s.DEPTH24_STENCIL8 : S === jt ? B = s.DEPTH32F_STENCIL8 : S === Ss && (B = s.DEPTH24_STENCIL8, Ce("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : S === null || S === Sn || S === ki ? B = s.DEPTH_COMPONENT24 : S === jt ? B = s.DEPTH_COMPONENT32F : S === Ss && (B = s.DEPTH_COMPONENT16), B
    }

    function T(w, S) {
        return E(w) === !0 || w.isFramebufferTexture && w.minFilter !== Rt && w.minFilter !== Ct ? Math.log2(Math.max(S.width, S.height)) + 1 : w.mipmaps.length > 0 ? w.mipmaps.length : w.isCompressedTexture && Array.isArray(w.image) ? S.mipmaps.length : 1
    }

    function I(w) {
        const S = new WeakRef(w);
        n.get(w).__ref = S, p.add(S), x.register(w, S, S)
    }

    function R(w) {
        const S = n.get(w).__ref;
        S !== void 0 && (p.delete(S), x.unregister(S))
    }

    function D(w) {
        V(w.target)
    }

    function F(w) {
        L(w.target)
    }

    function V(w) {
        w.removeEventListener("dispose", D), R(w), X(w), w.isVideoTexture && h.delete(w), w.isHTMLTexture && u.delete(w)
    }

    function L(w) {
        w.removeEventListener("dispose", F), R(w), te(w)
    }

    function k() {
        for (const w of p) {
            const S = w.deref();
            S !== void 0 && (S.isRenderTarget === !0 ? L(S) : V(S))
        }
        p.clear(), u.clear()
    }

    function X(w) {
        const S = n.get(w);
        if (S.__webglInit === void 0) return;
        const B = w.source,
            ne = f.get(B);
        if (ne) {
            const $ = ne[S.__cacheKey];
            $.usedTimes--, $.usedTimes === 0 && H(w), Object.keys(ne).length === 0 && f.delete(B)
        }
        n.remove(w)
    }

    function H(w) {
        const S = n.get(w);
        s.deleteTexture(S.__webglTexture);
        const B = w.source,
            ne = f.get(B);
        delete ne[S.__cacheKey], a.memory.textures--
    }

    function te(w) {
        const S = n.get(w);
        S.__depthDisposeCallback && S.__depthDisposeCallback();
        const B = w.depthTexture;
        if (B && B.renderTarget === w && V(B), w.isWebGLCubeRenderTarget)
            for (let $ = 0; $ < 6; $++) {
                if (Array.isArray(S.__webglFramebuffer[$]))
                    for (let oe = 0; oe < S.__webglFramebuffer[$].length; oe++) s.deleteFramebuffer(S.__webglFramebuffer[$][oe]);
                else s.deleteFramebuffer(S.__webglFramebuffer[$]);
                S.__webglDepthbuffer && s.deleteRenderbuffer(S.__webglDepthbuffer[$])
            } else {
                if (Array.isArray(S.__webglFramebuffer))
                    for (let $ = 0; $ < S.__webglFramebuffer.length; $++) s.deleteFramebuffer(S.__webglFramebuffer[$]);
                else s.deleteFramebuffer(S.__webglFramebuffer);
                if (S.__webglDepthbuffer && s.deleteRenderbuffer(S.__webglDepthbuffer), S.__webglMultisampledFramebuffer && s.deleteFramebuffer(S.__webglMultisampledFramebuffer), S.__webglColorRenderbuffer)
                    for (let $ = 0; $ < S.__webglColorRenderbuffer.length; $++) S.__webglColorRenderbuffer[$] && s.deleteRenderbuffer(S.__webglColorRenderbuffer[$]);
                S.__webglDepthRenderbuffer && s.deleteRenderbuffer(S.__webglDepthRenderbuffer)
            }
        const ne = w.textures;
        for (let $ = 0, oe = ne.length; $ < oe; $++) {
            const pe = n.get(ne[$]);
            pe.__webglTexture && (s.deleteTexture(pe.__webglTexture), a.memory.textures--), n.remove(ne[$])
        }
        n.remove(w)
    }
    let W = 0;

    function Q() {
        W = 0
    }

    function ee() {
        return W
    }

    function Te(w) {
        W = w
    }

    function Oe() {
        const w = W;
        return w >= i.maxTextures && Ce("WebGLTextures: Trying to use " + (w + 1) + " texture units while this GPU supports only " + i.maxTextures), W += 1, w
    }

    function Y(w) {
        const S = [];
        return S.push(w.wrapS), S.push(w.wrapT), S.push(w.wrapR || 0), S.push(w.magFilter), S.push(w.minFilter), S.push(w.anisotropy), S.push(w.internalFormat), S.push(w.format), S.push(w.type), S.push(w.generateMipmaps), S.push(w.mipmapsAutoUpdate), S.push(w.premultiplyAlpha), S.push(w.flipY), S.push(w.unpackAlignment), S.push(w.colorSpace), S.join()
    }

    function _e(w, S) {
        const B = n.get(w);
        if (w.isVideoTexture && St(w), w.isRenderTargetTexture === !1 && w.isExternalTexture !== !0 && w.version > 0 && B.__version !== w.version) {
            const ne = w.image;
            if (ne === null) Ce("WebGLRenderer: Texture marked for update but no image data found.");
            else if (ne.complete === !1) Ce("WebGLRenderer: Texture marked for update but image is incomplete");
            else {
                ae(B, w, S);
                return
            }
        } else w.isExternalTexture && (B.__webglTexture = w.sourceTexture ? w.sourceTexture : null);
        t.bindTexture(s.TEXTURE_2D, B.__webglTexture, s.TEXTURE0 + S)
    }

    function Ee(w, S) {
        const B = n.get(w);
        if (w.isRenderTargetTexture === !1 && w.version > 0 && B.__version !== w.version) {
            ae(B, w, S);
            return
        } else w.isExternalTexture && (B.__webglTexture = w.sourceTexture ? w.sourceTexture : null);
        t.bindTexture(s.TEXTURE_2D_ARRAY, B.__webglTexture, s.TEXTURE0 + S)
    }

    function Ne(w, S) {
        const B = n.get(w);
        if (w.isRenderTargetTexture === !1 && w.version > 0 && B.__version !== w.version) {
            ae(B, w, S);
            return
        }
        t.bindTexture(s.TEXTURE_3D, B.__webglTexture, s.TEXTURE0 + S)
    }

    function xe(w, S) {
        const B = n.get(w);
        if (w.version > 0 && B.__version !== w.version) {
            ye(B, w, S);
            return
        }
        t.bindTexture(s.TEXTURE_CUBE_MAP, B.__webglTexture, s.TEXTURE0 + S)
    }
    const De = {
            [zi]: s.REPEAT,
            [on]: s.CLAMP_TO_EDGE,
            [yr]: s.MIRRORED_REPEAT
        },
        mt = {
            [Rt]: s.NEAREST,
            [ah]: s.NEAREST_MIPMAP_NEAREST,
            [cs]: s.NEAREST_MIPMAP_LINEAR,
            [Ct]: s.LINEAR,
            [gr]: s.LINEAR_MIPMAP_NEAREST,
            [vn]: s.LINEAR_MIPMAP_LINEAR
        },
        Be = {
            [sd]: s.NEVER,
            [gh]: s.ALWAYS,
            [rd]: s.LESS,
            [ph]: s.LEQUAL,
            [ad]: s.EQUAL,
            [mh]: s.GEQUAL,
            [od]: s.GREATER,
            [ld]: s.NOTEQUAL
        };

    function Je(w, S) {
        if (S.type === jt && e.has("OES_texture_float_linear") === !1 && (S.magFilter === Ct || S.magFilter === gr || S.magFilter === cs || S.magFilter === vn || S.minFilter === Ct || S.minFilter === gr || S.minFilter === cs || S.minFilter === vn) && Ce("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(w, s.TEXTURE_WRAP_S, De[S.wrapS]), s.texParameteri(w, s.TEXTURE_WRAP_T, De[S.wrapT]), (w === s.TEXTURE_3D || w === s.TEXTURE_2D_ARRAY) && s.texParameteri(w, s.TEXTURE_WRAP_R, De[S.wrapR]), s.texParameteri(w, s.TEXTURE_MAG_FILTER, mt[S.magFilter]), s.texParameteri(w, s.TEXTURE_MIN_FILTER, mt[S.minFilter]), S.compareFunction && (s.texParameteri(w, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(w, s.TEXTURE_COMPARE_FUNC, Be[S.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
            if (S.magFilter === Rt || S.minFilter !== cs && S.minFilter !== vn || S.type === jt && e.has("OES_texture_float_linear") === !1) return;
            if (S.anisotropy > 1 || n.get(S).__currentAnisotropy) {
                const B = e.get("EXT_texture_filter_anisotropic");
                s.texParameterf(w, B.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(S.anisotropy, i.getMaxAnisotropy())), n.get(S).__currentAnisotropy = S.anisotropy
            }
        }
    }

    function je(w, S) {
        let B = !1;
        w.__webglInit === void 0 && (w.__webglInit = !0, S.addEventListener("dispose", D), I(S));
        const ne = S.source;
        let $ = f.get(ne);
        $ === void 0 && ($ = {}, f.set(ne, $));
        const oe = Y(S);
        if (oe !== w.__cacheKey) {
            $[oe] === void 0 && ($[oe] = {
                texture: s.createTexture(),
                usedTimes: 0
            }, a.memory.textures++, B = !0), $[oe].usedTimes++;
            const pe = $[w.__cacheKey];
            pe !== void 0 && ($[w.__cacheKey].usedTimes--, pe.usedTimes === 0 && H(S)), w.__cacheKey = oe, w.__webglTexture = $[oe].texture
        }
        return B
    }

    function j(w, S, B) {
        return Math.floor(Math.floor(w / B) / S)
    }

    function ce(w, S, B, ne) {
        const oe = w.updateRanges;
        if (oe.length === 0) t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, S.width, S.height, B, ne, S.data);
        else {
            oe.sort((C, Z) => C.start - Z.start);
            let pe = 0;
            for (let C = 1; C < oe.length; C++) {
                const Z = oe[pe],
                    q = oe[C],
                    ue = Z.start + Z.count,
                    se = j(q.start, S.width, 4),
                    le = j(Z.start, S.width, 4);
                q.start <= ue + 1 && se === le && j(q.start + q.count - 1, S.width, 4) === se ? Z.count = Math.max(Z.count, q.start + q.count - Z.start) : (++pe, oe[pe] = q)
            }
            oe.length = pe + 1;
            const K = t.getParameter(s.UNPACK_ROW_LENGTH),
                J = t.getParameter(s.UNPACK_SKIP_PIXELS),
                he = t.getParameter(s.UNPACK_SKIP_ROWS);
            t.pixelStorei(s.UNPACK_ROW_LENGTH, S.width);
            for (let C = 0, Z = oe.length; C < Z; C++) {
                const q = oe[C],
                    ue = Math.floor(q.start / 4),
                    se = Math.ceil(q.count / 4),
                    le = ue % S.width,
                    Pe = Math.floor(ue / S.width),
                    qe = se,
                    ie = 1;
                t.pixelStorei(s.UNPACK_SKIP_PIXELS, le), t.pixelStorei(s.UNPACK_SKIP_ROWS, Pe), t.texSubImage2D(s.TEXTURE_2D, 0, le, Pe, qe, ie, B, ne, S.data)
            }
            w.clearUpdateRanges(), t.pixelStorei(s.UNPACK_ROW_LENGTH, K), t.pixelStorei(s.UNPACK_SKIP_PIXELS, J), t.pixelStorei(s.UNPACK_SKIP_ROWS, he)
        }
    }

    function ae(w, S, B) {
        let ne = s.TEXTURE_2D;
        (S.isDataArrayTexture || S.isCompressedArrayTexture) && (ne = s.TEXTURE_2D_ARRAY), S.isData3DTexture && (ne = s.TEXTURE_3D);
        const $ = je(w, S),
            oe = S.source;
        t.bindTexture(ne, w.__webglTexture, s.TEXTURE0 + B);
        const pe = n.get(oe);
        if (oe.version !== pe.__version || $ === !0) {
            if (t.activeTexture(s.TEXTURE0 + B), (typeof ImageBitmap < "u" && S.image instanceof ImageBitmap) === !1) {
                const ie = Qe.getPrimaries(Qe.workingColorSpace),
                    Ie = S.colorSpace === Yn ? null : Qe.getPrimaries(S.colorSpace),
                    Xe = S.colorSpace === Yn || ie === Ie ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
                t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, S.flipY), t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, Xe)
            }
            t.pixelStorei(s.UNPACK_ALIGNMENT, S.unpackAlignment);
            let J = M(S.image, !1, i.maxTextureSize);
            J = Ue(S, J);
            const he = r.convert(S.format, S.colorSpace),
                C = r.convert(S.type);
            let Z = b(S.internalFormat, he, C, S.normalized, S.colorSpace, S.isVideoTexture);
            Je(ne, S);
            let q;
            const ue = S.mipmaps,
                se = S.isVideoTexture !== !0,
                le = pe.__version === void 0 || $ === !0,
                Pe = oe.dataReady,
                qe = T(S, J);
            if (S.isDepthTexture) Z = _(S.format === Kn, S.type), le && (se ? t.texStorage2D(s.TEXTURE_2D, 1, Z, J.width, J.height) : t.texImage2D(s.TEXTURE_2D, 0, Z, J.width, J.height, 0, he, C, null));
            else if (S.isDataTexture)
                if (ue.length > 0) {
                    se && le && t.texStorage2D(s.TEXTURE_2D, qe, Z, ue[0].width, ue[0].height);
                    for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, C, q.data) : t.texImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, he, C, q.data);
                    S.generateMipmaps = !1
                } else se ? (le && t.texStorage2D(s.TEXTURE_2D, qe, Z, J.width, J.height), Pe && ce(S, J, he, C)) : t.texImage2D(s.TEXTURE_2D, 0, Z, J.width, J.height, 0, he, C, J.data);
            else if (S.isCompressedTexture)
                if (S.isCompressedArrayTexture) {
                    se && le && t.texStorage3D(s.TEXTURE_2D_ARRAY, qe, Z, ue[0].width, ue[0].height, J.depth);
                    for (let ie = 0, Ie = ue.length; ie < Ie; ie++)
                        if (q = ue[ie], S.format !== ln)
                            if (he !== null)
                                if (se) {
                                    if (Pe)
                                        if (S.layerUpdates.size > 0) {
                                            const Xe = Mc(q.width, q.height, S.format, S.type);
                                            for (const ve of S.layerUpdates) {
                                                const lt = q.data.subarray(ve * Xe / q.data.BYTES_PER_ELEMENT, (ve + 1) * Xe / q.data.BYTES_PER_ELEMENT);
                                                t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, ve, q.width, q.height, 1, he, lt)
                                            }
                                        } else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, 0, q.width, q.height, J.depth, he, q.data)
                                } else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, ie, Z, q.width, q.height, J.depth, 0, q.data, 0, 0);
                    else Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
                    else se ? Pe && t.texSubImage3D(s.TEXTURE_2D_ARRAY, ie, 0, 0, 0, q.width, q.height, J.depth, he, C, q.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, ie, Z, q.width, q.height, J.depth, 0, he, C, q.data);
                    S.layerUpdates.size > 0 && S.clearLayerUpdates()
                } else {
                    se && le && t.texStorage2D(s.TEXTURE_2D, qe, Z, ue[0].width, ue[0].height);
                    for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], S.format !== ln ? he !== null ? se ? Pe && t.compressedTexSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, q.data) : t.compressedTexImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, q.data) : Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, q.width, q.height, he, C, q.data) : t.texImage2D(s.TEXTURE_2D, ie, Z, q.width, q.height, 0, he, C, q.data)
                }
            else if (S.isDataArrayTexture)
                if (se) {
                    if (le && t.texStorage3D(s.TEXTURE_2D_ARRAY, qe, Z, J.width, J.height, J.depth), Pe)
                        if (S.layerUpdates.size > 0) {
                            const ie = Mc(J.width, J.height, S.format, S.type);
                            for (const Ie of S.layerUpdates) {
                                const Xe = J.data.subarray(Ie * ie / J.data.BYTES_PER_ELEMENT, (Ie + 1) * ie / J.data.BYTES_PER_ELEMENT);
                                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, Ie, J.width, J.height, 1, he, C, Xe)
                            }
                            S.clearLayerUpdates()
                        } else t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, J.width, J.height, J.depth, he, C, J.data)
                } else t.texImage3D(s.TEXTURE_2D_ARRAY, 0, Z, J.width, J.height, J.depth, 0, he, C, J.data);
            else if (S.isData3DTexture) se ? (le && t.texStorage3D(s.TEXTURE_3D, qe, Z, J.width, J.height, J.depth), Pe && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, J.width, J.height, J.depth, he, C, J.data)) : t.texImage3D(s.TEXTURE_3D, 0, Z, J.width, J.height, J.depth, 0, he, C, J.data);
            else if (S.isFramebufferTexture) {
                if (le)
                    if (se) t.texStorage2D(s.TEXTURE_2D, qe, Z, J.width, J.height);
                    else {
                        let ie = J.width,
                            Ie = J.height;
                        for (let Xe = 0; Xe < qe; Xe++) t.texImage2D(s.TEXTURE_2D, Xe, Z, ie, Ie, 0, he, C, null), ie >>= 1, Ie >>= 1
                    }
            } else if (S.isHTMLTexture) {
                if ("texElementImage2D" in s) {
                    const ie = s.canvas;
                    if (ie.hasAttribute("layoutsubtree") || ie.setAttribute("layoutsubtree", "true"), J.parentNode !== ie) {
                        ie.appendChild(J), u.add(S), ie.onpaint = Ie => {
                            const Xe = Ie.changedElements;
                            for (const ve of u) Xe.includes(ve.image) && (ve.needsUpdate = !0)
                        }, ie.requestPaint();
                        return
                    }
                    if (s.texElementImage2D.length === 3) s.texElementImage2D(s.TEXTURE_2D, s.RGBA8, J);
                    else {
                        const Xe = s.RGBA,
                            ve = s.RGBA,
                            lt = s.UNSIGNED_BYTE;
                        s.texElementImage2D(s.TEXTURE_2D, 0, Xe, ve, lt, J)
                    }
                    s.texParameteri(s.TEXTURE_2D, s.TEXTURE_MIN_FILTER, s.LINEAR), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_S, s.CLAMP_TO_EDGE), s.texParameteri(s.TEXTURE_2D, s.TEXTURE_WRAP_T, s.CLAMP_TO_EDGE)
                }
            } else if (ue.length > 0) {
                if (se && le) {
                    const ie = ke(ue[0]);
                    t.texStorage2D(s.TEXTURE_2D, qe, Z, ie.width, ie.height)
                }
                for (let ie = 0, Ie = ue.length; ie < Ie; ie++) q = ue[ie], se ? Pe && t.texSubImage2D(s.TEXTURE_2D, ie, 0, 0, he, C, q) : t.texImage2D(s.TEXTURE_2D, ie, Z, he, C, q);
                S.generateMipmaps = !1
            } else if (se) {
                if (le) {
                    const ie = ke(J);
                    t.texStorage2D(s.TEXTURE_2D, qe, Z, ie.width, ie.height)
                }
                Pe && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, he, C, J)
            } else t.texImage2D(s.TEXTURE_2D, 0, Z, he, C, J);
            E(S) && S.mipmapsAutoUpdate === !0 && v(ne), pe.__version = oe.version, S.onUpdate && S.onUpdate(S)
        }
        w.__version = S.version
    }

    function ye(w, S, B) {
        if (S.image.length !== 6) return;
        const ne = je(w, S),
            $ = S.source;
        t.bindTexture(s.TEXTURE_CUBE_MAP, w.__webglTexture, s.TEXTURE0 + B);
        const oe = n.get($);
        if ($.version !== oe.__version || ne === !0) {
            t.activeTexture(s.TEXTURE0 + B);
            const pe = Qe.getPrimaries(Qe.workingColorSpace),
                K = S.colorSpace === Yn ? null : Qe.getPrimaries(S.colorSpace),
                J = S.colorSpace === Yn || pe === K ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
            t.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, S.flipY), t.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, S.premultiplyAlpha), t.pixelStorei(s.UNPACK_ALIGNMENT, S.unpackAlignment), t.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, J);
            const he = S.isCompressedTexture || S.image[0].isCompressedTexture,
                C = S.image[0] && S.image[0].isDataTexture,
                Z = [];
            for (let ve = 0; ve < 6; ve++) !he && !C ? Z[ve] = M(S.image[ve], !0, i.maxCubemapSize) : Z[ve] = C ? S.image[ve].image : S.image[ve], Z[ve] = Ue(S, Z[ve]);
            const q = Z[0],
                ue = r.convert(S.format, S.colorSpace),
                se = r.convert(S.type);
            let le = b(S.internalFormat, ue, se, S.normalized, S.colorSpace);
            const Pe = S.isVideoTexture !== !0,
                qe = oe.__version === void 0 || ne === !0,
                ie = $.dataReady;
            let Ie = T(S, q);
            Je(s.TEXTURE_CUBE_MAP, S);
            let Xe;
            if (S.isDepthTexture) {
                if (le = _(S.format === Kn, S.type), qe)
                    if (Pe) t.texStorage2D(s.TEXTURE_CUBE_MAP, 1, le, q.width, q.height);
                    else
                        for (let ve = 0; ve < 6; ve++) t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, q.width, q.height, 0, ue, se, null)
            } else if (he) {
                Pe && qe && t.texStorage2D(s.TEXTURE_CUBE_MAP, Ie, le, q.width, q.height);
                for (let ve = 0; ve < 6; ve++) {
                    Xe = Z[ve].mipmaps;
                    for (let lt = 0; lt < Xe.length; lt++) {
                        const It = Xe[lt];
                        S.format !== ln ? ue !== null ? Pe ? ie && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, 0, 0, It.width, It.height, ue, It.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, le, It.width, It.height, 0, It.data) : Ce("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, 0, 0, It.width, It.height, ue, se, It.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt, le, It.width, It.height, 0, ue, se, It.data)
                    }
                }
            } else {
                if (Xe = S.mipmaps, Pe && qe) {
                    Xe.length > 0 && Ie++;
                    const ve = ke(Z[0]);
                    t.texStorage2D(s.TEXTURE_CUBE_MAP, Ie, le, ve.width, ve.height)
                }
                for (let ve = 0; ve < 6; ve++)
                    if (C) {
                        Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, 0, 0, Z[ve].width, Z[ve].height, ue, se, Z[ve].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, Z[ve].width, Z[ve].height, 0, ue, se, Z[ve].data);
                        for (let lt = 0; lt < Xe.length; lt++) {
                            const On = Xe[lt].image[ve].image;
                            Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, 0, 0, On.width, On.height, ue, se, On.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, le, On.width, On.height, 0, ue, se, On.data)
                        }
                    } else {
                        Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, 0, 0, ue, se, Z[ve]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, 0, le, ue, se, Z[ve]);
                        for (let lt = 0; lt < Xe.length; lt++) {
                            const It = Xe[lt];
                            Pe ? ie && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, 0, 0, ue, se, It.image[ve]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ve, lt + 1, le, ue, se, It.image[ve])
                        }
                    }
            }
            E(S) && S.mipmapsAutoUpdate === !0 && v(s.TEXTURE_CUBE_MAP), oe.__version = $.version, S.onUpdate && S.onUpdate(S)
        }
        w.__version = S.version
    }

    function ge(w, S, B, ne, $, oe) {
        const pe = r.convert(B.format, B.colorSpace),
            K = r.convert(B.type),
            J = b(B.internalFormat, pe, K, B.normalized, B.colorSpace),
            he = n.get(S),
            C = n.get(B);
        if (C.__renderTarget = S, !he.__hasExternalTextures) {
            const Z = Math.max(1, S.width >> oe),
                q = Math.max(1, S.height >> oe);
            $ === s.TEXTURE_3D || $ === s.TEXTURE_2D_ARRAY ? t.texImage3D($, oe, J, Z, q, S.depth, 0, pe, K, null) : t.texImage2D($, oe, J, Z, q, 0, pe, K, null)
        }
        t.bindFramebuffer(s.FRAMEBUFFER, w), fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, ne, $, C.__webglTexture, 0, dt(S)) : ($ === s.TEXTURE_2D || $ >= s.TEXTURE_CUBE_MAP_POSITIVE_X && $ <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, ne, $, C.__webglTexture, oe), t.bindFramebuffer(s.FRAMEBUFFER, null)
    }

    function Ve(w, S, B) {
        if (s.bindRenderbuffer(s.RENDERBUFFER, w), S.depthBuffer) {
            const ne = S.depthTexture,
                $ = ne && ne.isDepthTexture ? ne.type : null,
                oe = _(S.stencilBuffer, $),
                pe = S.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
            fe(S) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, dt(S), oe, S.width, S.height) : B ? s.renderbufferStorageMultisample(s.RENDERBUFFER, dt(S), oe, S.width, S.height) : s.renderbufferStorage(s.RENDERBUFFER, oe, S.width, S.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, pe, s.RENDERBUFFER, w)
        } else {
            const ne = S.textures;
            for (let $ = 0; $ < ne.length; $++) {
                const oe = ne[$],
                    pe = r.convert(oe.format, oe.colorSpace),
                    K = r.convert(oe.type),
                    J = b(oe.internalFormat, pe, K, oe.normalized, oe.colorSpace);
                fe(S) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, dt(S), J, S.width, S.height) : B ? s.renderbufferStorageMultisample(s.RENDERBUFFER, dt(S), J, S.width, S.height) : s.renderbufferStorage(s.RENDERBUFFER, J, S.width, S.height)
            }
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null)
    }

    function Le(w, S, B) {
        const ne = S.isWebGLCubeRenderTarget === !0;
        if (t.bindFramebuffer(s.FRAMEBUFFER, w), !(S.depthTexture && S.depthTexture.isDepthTexture)) throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");
        const $ = n.get(S.depthTexture);
        $.__renderTarget = S;
        const oe = ne ? S.depthTexture.image[0] : S.depthTexture.image;
        (!$.__webglTexture || oe.width !== S.width || oe.height !== S.height) && (oe.width = S.width, oe.height = S.height, S.depthTexture.needsUpdate = !0), ne ? xe(S.depthTexture, 0) : _e(S.depthTexture, 0);
        const pe = $.__webglTexture,
            K = dt(S),
            J = ne ? s.TEXTURE_CUBE_MAP_POSITIVE_X + B : s.TEXTURE_2D,
            he = S.depthTexture.format === Kn ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        if (S.depthTexture.format === Qn) fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, he, J, pe, 0, K) : s.framebufferTexture2D(s.FRAMEBUFFER, he, J, pe, 0);
        else if (S.depthTexture.format === Kn) fe(S) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, he, J, pe, 0, K) : s.framebufferTexture2D(s.FRAMEBUFFER, he, J, pe, 0);
        else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")
    }

    function et(w) {
        const S = n.get(w),
            B = w.isWebGLCubeRenderTarget === !0;
        if (S.__boundDepthTexture !== w.depthTexture) {
            const ne = w.depthTexture;
            if (S.__depthDisposeCallback && S.__depthDisposeCallback(), ne) {
                const $ = () => {
                    delete S.__boundDepthTexture, delete S.__depthDisposeCallback, ne.removeEventListener("dispose", $)
                };
                ne.addEventListener("dispose", $), S.__depthDisposeCallback = $
            }
            S.__boundDepthTexture = ne
        }
        if (w.depthTexture && !S.__autoAllocateDepthBuffer)
            if (B)
                for (let ne = 0; ne < 6; ne++) Le(S.__webglFramebuffer[ne], w, ne);
            else w.texture.mipmaps.length > 0 ? Le(S.__webglFramebuffer[0], w, 0) : Le(S.__webglFramebuffer, w, 0);
        else if (B) {
            S.__webglDepthbuffer = [];
            for (let ne = 0; ne < 6; ne++)
                if (t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer[ne]), S.__webglDepthbuffer[ne] === void 0) S.__webglDepthbuffer[ne] = s.createRenderbuffer(), Ve(S.__webglDepthbuffer[ne], w, !1);
                else {
                    const $ = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
                        oe = S.__webglDepthbuffer[ne];
                    s.bindRenderbuffer(s.RENDERBUFFER, oe), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, oe)
                }
        } else if (w.texture.mipmaps.length > 0 ? t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer[0]) : t.bindFramebuffer(s.FRAMEBUFFER, S.__webglFramebuffer), S.__webglDepthbuffer === void 0) S.__webglDepthbuffer = s.createRenderbuffer(), Ve(S.__webglDepthbuffer, w, !1);
        else {
            const $ = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
                oe = S.__webglDepthbuffer;
            s.bindRenderbuffer(s.RENDERBUFFER, oe), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, oe)
        }
        t.bindFramebuffer(s.FRAMEBUFFER, null)
    }

    function tt(w, S, B) {
        const ne = n.get(w);
        S !== void 0 && ge(ne.__webglFramebuffer, w, w.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), B !== void 0 && et(w)
    }

    function rt(w) {
        const S = w.texture,
            B = n.get(w),
            ne = n.get(S);
        w.addEventListener("dispose", F), I(w);
        const $ = w.textures,
            oe = w.isWebGLCubeRenderTarget === !0,
            pe = $.length > 1;
        if (pe || (ne.__webglTexture === void 0 && (ne.__webglTexture = s.createTexture()), ne.__version = S.version, a.memory.textures++), oe) {
            B.__webglFramebuffer = [];
            for (let K = 0; K < 6; K++)
                if (S.mipmaps.length > 0) {
                    B.__webglFramebuffer[K] = [];
                    for (let J = 0; J < S.mipmaps.length; J++) B.__webglFramebuffer[K][J] = s.createFramebuffer()
                } else B.__webglFramebuffer[K] = s.createFramebuffer()
        } else {
            if (S.mipmaps.length > 0) {
                B.__webglFramebuffer = [];
                for (let K = 0; K < S.mipmaps.length; K++) B.__webglFramebuffer[K] = s.createFramebuffer()
            } else B.__webglFramebuffer = s.createFramebuffer();
            if (pe)
                for (let K = 0, J = $.length; K < J; K++) {
                    const he = n.get($[K]);
                    he.__webglTexture === void 0 && (he.__webglTexture = s.createTexture(), a.memory.textures++)
                }
            if (w.samples > 0 && fe(w) === !1) {
                B.__webglMultisampledFramebuffer = s.createFramebuffer(), B.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, B.__webglMultisampledFramebuffer);
                for (let K = 0; K < $.length; K++) {
                    const J = $[K];
                    B.__webglColorRenderbuffer[K] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, B.__webglColorRenderbuffer[K]);
                    const he = r.convert(J.format, J.colorSpace),
                        C = r.convert(J.type),
                        Z = b(J.internalFormat, he, C, J.normalized, J.colorSpace, w.isXRRenderTarget === !0),
                        q = dt(w);
                    s.renderbufferStorageMultisample(s.RENDERBUFFER, q, Z, w.width, w.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + K, s.RENDERBUFFER, B.__webglColorRenderbuffer[K])
                }
                s.bindRenderbuffer(s.RENDERBUFFER, null), w.depthBuffer && (B.__webglDepthRenderbuffer = s.createRenderbuffer(), Ve(B.__webglDepthRenderbuffer, w, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null)
            }
        }
        if (oe) {
            t.bindTexture(s.TEXTURE_CUBE_MAP, ne.__webglTexture), Je(s.TEXTURE_CUBE_MAP, S);
            for (let K = 0; K < 6; K++)
                if (S.mipmaps.length > 0)
                    for (let J = 0; J < S.mipmaps.length; J++) ge(B.__webglFramebuffer[K][J], w, S, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + K, J);
                else ge(B.__webglFramebuffer[K], w, S, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0);
            E(S) ? v(s.TEXTURE_CUBE_MAP) : S.mipmaps.length > 0 && s.texParameteri(s.TEXTURE_CUBE_MAP, s.TEXTURE_MAX_LEVEL, S.mipmaps.length - 1), t.unbindTexture()
        } else if (pe) {
            for (let K = 0, J = $.length; K < J; K++) {
                const he = $[K],
                    C = n.get(he);
                let Z = s.TEXTURE_2D;
                (w.isWebGL3DRenderTarget || w.isWebGLArrayRenderTarget) && (Z = w.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(Z, C.__webglTexture), Je(Z, he), ge(B.__webglFramebuffer, w, he, s.COLOR_ATTACHMENT0 + K, Z, 0), E(he) && v(Z)
            }
            t.unbindTexture()
        } else {
            let K = s.TEXTURE_2D;
            if ((w.isWebGL3DRenderTarget || w.isWebGLArrayRenderTarget) && (K = w.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(K, ne.__webglTexture), Je(K, S), S.mipmaps.length > 0)
                for (let J = 0; J < S.mipmaps.length; J++) ge(B.__webglFramebuffer[J], w, S, s.COLOR_ATTACHMENT0, K, J);
            else ge(B.__webglFramebuffer, w, S, s.COLOR_ATTACHMENT0, K, 0);
            E(S) ? v(K) : S.mipmaps.length > 0 && s.texParameteri(K, s.TEXTURE_MAX_LEVEL, S.mipmaps.length - 1), t.unbindTexture()
        }
        w.depthBuffer && et(w)
    }

    function U(w) {
        const S = w.textures;
        for (let B = 0, ne = S.length; B < ne; B++) {
            const $ = S[B];
            if (E($) && $.mipmapsAutoUpdate === !0) {
                const oe = A(w),
                    pe = n.get($).__webglTexture;
                t.bindTexture(oe, pe), v(oe), t.unbindTexture()
            }
        }
    }
    const yt = [];

    function $e(w) {
        if (w.samples > 0) {
            if (fe(w) === !1) {
                const S = w.textures,
                    B = w.width,
                    ne = w.height;
                let $ = s.COLOR_BUFFER_BIT;
                const oe = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT,
                    pe = n.get(w),
                    K = S.length > 1;
                if (K)
                    for (let he = 0; he < S.length; he++) t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.TEXTURE_2D, null, 0);
                t.bindFramebuffer(s.READ_FRAMEBUFFER, pe.__webglMultisampledFramebuffer), w.texture.mipmaps.length > 0 ? t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglFramebuffer[0]) : t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglFramebuffer);
                for (let he = 0; he < S.length; he++) {
                    if (w.resolveDepthBuffer && (w.depthBuffer && ($ |= s.DEPTH_BUFFER_BIT), w.stencilBuffer && w.resolveStencilBuffer && ($ |= s.STENCIL_BUFFER_BIT)), K) {
                        s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, pe.__webglColorRenderbuffer[he]);
                        const C = n.get(S[he]).__webglTexture;
                        s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, C, 0)
                    }
                    s.blitFramebuffer(0, 0, B, ne, 0, 0, B, ne, $, s.NEAREST), l === !0 && (yt.length = 0, yt.push(s.COLOR_ATTACHMENT0 + he), w.depthBuffer && w.storeMultisampledDepthBuffer === !1 && yt.push(oe), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, yt))
                }
                if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), K)
                    for (let he = 0; he < S.length; he++) {
                        t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.RENDERBUFFER, pe.__webglColorRenderbuffer[he]);
                        const C = n.get(S[he]).__webglTexture;
                        t.bindFramebuffer(s.FRAMEBUFFER, pe.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + he, s.TEXTURE_2D, C, 0)
                    }
                t.bindFramebuffer(s.DRAW_FRAMEBUFFER, pe.__webglMultisampledFramebuffer)
            } else if (w.depthBuffer && w.storeMultisampledDepthBuffer === !1 && l) {
                const S = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
                s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [S])
            }
        }
    }

    function dt(w) {
        return Math.min(i.maxSamples, w.samples)
    }

    function fe(w) {
        const S = n.get(w);
        return w.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && S.__useRenderToTexture !== !1
    }

    function St(w) {
        const S = a.render.frame;
        h.get(w) !== S && (h.set(w, S), w.update())
    }

    function Ue(w, S) {
        const B = w.colorSpace,
            ne = w.format,
            $ = w.type;
        return w.isCompressedTexture === !0 || w.isVideoTexture === !0 || B !== Xt && B !== Yn && (Qe.getTransfer(B) === ct ? (ne !== ln || $ !== Jt) && Ce("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : ze("WebGLTextures: Unsupported texture color space:", B)), S
    }

    function ke(w) {
        return typeof HTMLImageElement < "u" && w instanceof HTMLImageElement ? (c.width = w.naturalWidth || w.width, c.height = w.naturalHeight || w.height) : typeof VideoFrame < "u" && w instanceof VideoFrame ? (c.width = w.displayWidth, c.height = w.displayHeight) : (c.width = w.width, c.height = w.height), c
    }
    this.allocateTextureUnit = Oe, this.resetTextureUnits = Q, this.getTextureUnits = ee, this.setTextureUnits = Te, this.setTexture2D = _e, this.setTexture2DArray = Ee, this.setTexture3D = Ne, this.setTextureCube = xe, this.rebindTextures = tt, this.setupRenderTarget = rt, this.updateRenderTargetMipmap = U, this.updateMultisampleRenderTarget = $e, this.setupDepthRenderbuffer = et, this.setupFrameBufferTexture = ge, this.useMultisampledRTT = fe, this.dispose = k
}

