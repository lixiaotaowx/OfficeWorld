class J0 extends d4 {
    constructor(e) {
        super(e), this.isKTX2Loader = !0, this.transcoderPath = "", this.transcoderBinary = null, this.transcoderPending = null, this.workerPool = new J3, this.workerSourceURL = "", this.workerConfig = null, typeof MSC_TRANSCODER < "u" && console.warn('THREE.KTX2Loader: Please update to latest "basis_transcoder". "msc_basis_transcoder" is no longer supported in three.js r125+.')
    }
    setTranscoderPath(e) {
        return this.transcoderPath = e, this
    }
    setWorkerLimit(e) {
        return this.workerPool.setWorkerLimit(e), this
    }
    async detectSupportAsync(e) {
        return console.warn('KTX2Loader: "detectSupportAsync()" has been deprecated. Use "detectSupport()" and "await renderer.init();" when creating the renderer.'), await e.init(), this.detectSupport(e)
    }
    detectSupport(e) {
        return e.isWebGPURenderer === !0 ? this.workerConfig = {
            astcSupported: e.hasFeature("texture-compression-astc"),
            astcHDRSupported: !1,
            etc1Supported: e.hasFeature("texture-compression-etc1"),
            etc2Supported: e.hasFeature("texture-compression-etc2"),
            dxtSupported: e.hasFeature("texture-compression-s3tc"),
            bptcSupported: e.hasFeature("texture-compression-bc"),
            pvrtcSupported: e.hasFeature("texture-compression-pvrtc")
        } : (this.workerConfig = {
            astcSupported: e.extensions.has("WEBGL_compressed_texture_astc"),
            astcHDRSupported: e.extensions.has("WEBGL_compressed_texture_astc") && e.extensions.get("WEBGL_compressed_texture_astc").getSupportedProfiles().includes("hdr"),
            etc1Supported: e.extensions.has("WEBGL_compressed_texture_etc1"),
            etc2Supported: e.extensions.has("WEBGL_compressed_texture_etc"),
            dxtSupported: e.extensions.has("WEBGL_compressed_texture_s3tc"),
            bptcSupported: e.extensions.has("EXT_texture_compression_bptc"),
            pvrtcSupported: e.extensions.has("WEBGL_compressed_texture_pvrtc") || e.extensions.has("WEBKIT_WEBGL_compressed_texture_pvrtc")
        }, typeof navigator < "u" && typeof navigator.platform < "u" && typeof navigator.userAgent < "u" && navigator.platform.indexOf("Linux") >= 0 && navigator.userAgent.indexOf("Android") < 0 && this.workerConfig.astcSupported && this.workerConfig.etc2Supported && this.workerConfig.bptcSupported && this.workerConfig.dxtSupported && (this.workerConfig.astcSupported = !1, this.workerConfig.etc1Supported = !1, this.workerConfig.etc2Supported = !1)), this
    }
    init() {
        if (!this.transcoderPending) {
            const e = new d9(this.manager);
            e.setPriority(this.priority), e.setCache(this.cache), e.setWithCredentials(this.withCredentials);
            const t = new d9(this.manager);
            t.setPriority(this.priority), t.setCache(this.cache), t.setWithCredentials(this.withCredentials), t.setResponseType("arraybuffer");
            let s, i;
            this.transcoderPath === "" ? (s = e.loadAsync(a8), i = t.loadAsync(o8)) : (e.setPath(this.transcoderPath), s = e.loadAsync("basis_transcoder.js"), t.setPath(this.transcoderPath), i = t.loadAsync("basis_transcoder.wasm")), this.transcoderPending = Promise.all([s, i]).then(([n, o]) => {
                const a = J0.BasisWorker.toString(),
                    l = ["/* constants */", "let _EngineFormat = " + JSON.stringify(J0.EngineFormat), "let _EngineType = " + JSON.stringify(J0.EngineType), "let _TranscoderFormat = " + JSON.stringify(J0.TranscoderFormat), "let _BasisFormat = " + JSON.stringify(J0.BasisFormat), "/* basis_transcoder.js */", n, "/* worker */", a.substring(a.indexOf("{") + 1, a.lastIndexOf("}"))].join(`
`);
                this.workerSourceURL = URL.createObjectURL(new Blob([l])), this.transcoderBinary = o, this.workerPool.setWorkerCreator(() => {
                    const A = new Worker(this.workerSourceURL),
                        c = this.transcoderBinary.slice(0);
                    return A.postMessage({
                        type: "init",
                        config: this.workerConfig,
                        transcoderBinary: c
                    }, [c]), A
                })
            }), os > 0 && console.warn("THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues. Use a single KTX2Loader instance, or call .dispose() on old instances."), os++
        }
        return this.transcoderPending
    }
    load(e, t, s, i) {
        if (this.workerConfig === null) throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
        const n = new d9(this.manager);
        n.setPriority(this.priority), n.setCache(this.cache), n.setPath(this.path), n.setCrossOrigin(this.crossOrigin), n.setWithCredentials(this.withCredentials), n.setRequestHeader(this.requestHeader), n.setResponseType("arraybuffer"), n.load(e, o => {
            this.parse(o, t, i)
        }, s, i)
    }
    parse(e, t, s) {
        if (this.workerConfig === null) throw new Error("THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.");
        if (rs.has(e)) return rs.get(e).promise.then(t).catch(s);
        this._createTexture(e).then(i => t ? t(i) : null).catch(s)
    }
    _createTextureFrom(e, t) {
        const {
            type: s,
            error: i,
            data: {
                faces: n,
                width: o,
                height: a,
                format: l,
                type: A,
                dfdFlags: c
            }
        } = e;
        if (s === "error") return Promise.reject(i);
        let h;
        if (t.faceCount === 6) h = new g4(n, l, A);
        else {
            const u = n[0].mipmaps;
            h = t.layerCount > 1 ? new Mn(u, o, a, t.layerCount, l, A) : new Jt(u, o, a, l, A)
        }
        return h.minFilter = n[0].mipmaps.length === 1 ? pe : T9, h.magFilter = pe, h.generateMipmaps = !1, h.needsUpdate = !0, h.colorSpace = I5(t), h.premultiplyAlpha = !!(c & X3), h
    }
    async _createTexture(e, t = {}) {
        const s = s8(new Uint8Array(e)),
            i = s.vkFormat === ci && s.dataFormatDescriptor[0].colorModel === 167;
        if (!(s.vkFormat === t8 || i && !this.workerConfig.astcHDRSupported)) return c8(s);
        const o = t,
            a = this.init().then(() => this.workerPool.postMessage({
                type: "transcode",
                buffer: e,
                taskConfig: o
            }, [e])).then(l => this._createTextureFrom(l.data, s));
        return rs.set(e, {
            promise: a
        }), a
    }
    dispose() {
        this.workerPool.dispose(), this.workerSourceURL && URL.revokeObjectURL(this.workerSourceURL), os--
    }
}
J0.BasisFormat = {
    ETC1S: 0,
    UASTC: 1,
    UASTC_HDR: 2
};
J0.TranscoderFormat = {
    ETC1: 0,
    ETC2: 1,
    BC1: 2,
    BC3: 3,
    BC4: 4,
    BC5: 5,
    BC7_M6_OPAQUE_ONLY: 6,
    BC7_M5: 7,
    PVRTC1_4_RGB: 8,
    PVRTC1_4_RGBA: 9,
    ASTC_4x4: 10,
    ATC_RGB: 11,
    ATC_RGBA_INTERPOLATED_ALPHA: 12,
    RGBA32: 13,
    RGB565: 14,
    BGR565: 15,
    RGBA4444: 16,
    BC6H: 22,
    RGB_HALF: 24,
    RGBA_HALF: 25
};
J0.EngineFormat = {
    RGBAFormat: ne,
    RGBA_ASTC_4x4_Format: g9,
    RGB_BPTC_UNSIGNED_Format: _n,
    RGBA_BPTC_Format: Gs,
    RGBA_ETC2_EAC_Format: m4,
    RGBA_PVRTC_4BPPV1_Format: Us,
    RGBA_S3TC_DXT5_Format: zs,
    RGB_ETC1_Format: zn,
    RGB_ETC2_Format: p4,
    RGB_PVRTC_4BPPV1_Format: Gn,
    RGBA_S3TC_DXT1_Format: _s
};
J0.EngineType = {
    UnsignedByteType: s0,
    HalfFloatType: T0,
    FloatType: St
};
J0.BasisWorker = function() {
    let r, e, t;
    const s = _EngineFormat,
        i = _EngineType,
        n = _TranscoderFormat,
        o = _BasisFormat;
    self.addEventListener("message", function(g) {
        const p = g.data;
        switch (p.type) {
            case "init":
                r = p.config, a(p.transcoderBinary);
                break;
            case "transcode":
                e.then(() => {
                    try {
                        const {
                            faces: I,
                            buffers: C,
                            width: E,
                            height: x,
                            hasAlpha: B,
                            format: b,
                            type: v,
                            dfdFlags: L
                        } = l(p.buffer);
                        self.postMessage({
                            type: "transcode",
                            id: p.id,
                            data: {
                                faces: I,
                                width: E,
                                height: x,
                                hasAlpha: B,
                                format: b,
                                type: v,
                                dfdFlags: L
                            }
                        }, C)
                    } catch (I) {
                        console.error(I), self.postMessage({
                            type: "error",
                            id: p.id,
                            error: I.message
                        })
                    }
                });
                break
        }
    });

    function a(g) {
        e = new Promise(p => {
            t = {
                wasmBinary: g,
                onRuntimeInitialized: p
            }, BASIS(t)
        }).then(() => {
            t.initializeBasis(), t.KTX2File === void 0 && console.warn("THREE.KTX2Loader: Please update Basis Universal transcoder.")
        })
    }

    function l(g) {
        const p = new t.KTX2File(new Uint8Array(g));

        function I() {
            p.close(), p.delete()
        }
        if (!p.isValid()) throw I(), new Error("THREE.KTX2Loader:	Invalid or unsupported .ktx2 file");
        let C;
        if (p.isUASTC()) C = o.UASTC;
        else if (p.isETC1S()) C = o.ETC1S;
        else if (p.isHDR()) C = o.UASTC_HDR;
        else throw new Error("THREE.KTX2Loader: Unknown Basis encoding");
        const E = p.getWidth(),
            x = p.getHeight(),
            B = p.getLayers() || 1,
            b = p.getLevels(),
            v = p.getFaces(),
            L = p.getHasAlpha(),
            D = p.getDFDFlags(),
            {
                transcoderFormat: P,
                engineFormat: U,
                engineType: R
            } = h(C, E, x, L);
        if (!E || !x || !b) throw I(), new Error("THREE.KTX2Loader:	Invalid texture");
        if (!p.startTranscoding()) throw I(), new Error("THREE.KTX2Loader: .startTranscoding failed");
        const Q = [],
            H = [];
        for (let N = 0; N < v; N++) {
            const G = [];
            for (let q = 0; q < b; q++) {
                const j = [];
                let h0, i0;
                for (let W = 0; W < B; W++) {
                    const t0 = p.getImageLevelInfo(q, W, N);
                    N === 0 && q === 0 && W === 0 && (t0.origWidth % 4 !== 0 || t0.origHeight % 4 !== 0) && console.warn("THREE.KTX2Loader: ETC1S and UASTC textures should use multiple-of-four dimensions."), b > 1 ? (h0 = t0.origWidth, i0 = t0.origHeight) : (h0 = t0.width, i0 = t0.height);
                    let o0 = new Uint8Array(p.getImageTranscodedSizeInBytes(q, W, 0, P));
                    const d0 = p.transcodeImage(o0, q, W, N, P, 0, -1, -1);
                    if (R === i.HalfFloatType && (o0 = new Uint16Array(o0.buffer, o0.byteOffset, o0.byteLength / Uint16Array.BYTES_PER_ELEMENT)), !d0) throw I(), new Error("THREE.KTX2Loader: .transcodeImage failed.");
                    j.push(o0)
                }
                const u0 = d(j);
                G.push({
                    data: u0,
                    width: h0,
                    height: i0
                }), H.push(u0.buffer)
            }
            Q.push({
                mipmaps: G,
                width: E,
                height: x,
                format: U,
                type: R
            })
        }
        return I(), {
            faces: Q,
            buffers: H,
            width: E,
            height: x,
            hasAlpha: L,
            dfdFlags: D,
            format: U,
            type: R
        }
    }
    const A = [{
            if: "astcSupported",
            basisFormat: [o.UASTC],
            transcoderFormat: [n.ASTC_4x4, n.ASTC_4x4],
            engineFormat: [s.RGBA_ASTC_4x4_Format, s.RGBA_ASTC_4x4_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 1 / 0,
            priorityUASTC: 1,
            needsPowerOfTwo: !1
        }, {
            if: "bptcSupported",
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.BC7_M5, n.BC7_M5],
            engineFormat: [s.RGBA_BPTC_Format, s.RGBA_BPTC_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 3,
            priorityUASTC: 2,
            needsPowerOfTwo: !1
        }, {
            if: "dxtSupported",
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.BC1, n.BC3],
            engineFormat: [s.RGBA_S3TC_DXT1_Format, s.RGBA_S3TC_DXT5_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 4,
            priorityUASTC: 5,
            needsPowerOfTwo: !1
        }, {
            if: "etc2Supported",
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.ETC1, n.ETC2],
            engineFormat: [s.RGB_ETC2_Format, s.RGBA_ETC2_EAC_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 1,
            priorityUASTC: 3,
            needsPowerOfTwo: !1
        }, {
            if: "etc1Supported",
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.ETC1],
            engineFormat: [s.RGB_ETC1_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 2,
            priorityUASTC: 4,
            needsPowerOfTwo: !1
        }, {
            if: "pvrtcSupported",
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.PVRTC1_4_RGB, n.PVRTC1_4_RGBA],
            engineFormat: [s.RGB_PVRTC_4BPPV1_Format, s.RGBA_PVRTC_4BPPV1_Format],
            engineType: [i.UnsignedByteType],
            priorityETC1S: 5,
            priorityUASTC: 6,
            needsPowerOfTwo: !0
        }, {
            if: "bptcSupported",
            basisFormat: [o.UASTC_HDR],
            transcoderFormat: [n.BC6H],
            engineFormat: [s.RGB_BPTC_UNSIGNED_Format],
            engineType: [i.HalfFloatType],
            priorityHDR: 1,
            needsPowerOfTwo: !1
        }, {
            basisFormat: [o.ETC1S, o.UASTC],
            transcoderFormat: [n.RGBA32, n.RGBA32],
            engineFormat: [s.RGBAFormat, s.RGBAFormat],
            engineType: [i.UnsignedByteType, i.UnsignedByteType],
            priorityETC1S: 100,
            priorityUASTC: 100,
            needsPowerOfTwo: !1
        }, {
            basisFormat: [o.UASTC_HDR],
            transcoderFormat: [n.RGBA_HALF],
            engineFormat: [s.RGBAFormat],
            engineType: [i.HalfFloatType],
            priorityHDR: 100,
            needsPowerOfTwo: !1
        }],
        c = {
            [o.ETC1S]: A.filter(g => g.basisFormat.includes(o.ETC1S)).sort((g, p) => g.priorityETC1S - p.priorityETC1S),
            [o.UASTC]: A.filter(g => g.basisFormat.includes(o.UASTC)).sort((g, p) => g.priorityUASTC - p.priorityUASTC),
            [o.UASTC_HDR]: A.filter(g => g.basisFormat.includes(o.UASTC_HDR)).sort((g, p) => g.priorityHDR - p.priorityHDR)
        };

    function h(g, p, I, C) {
        const E = c[g];
        for (let x = 0; x < E.length; x++) {
            const B = E[x];
            if (B.if && !r[B.if] || !B.basisFormat.includes(g) || C && B.transcoderFormat.length < 2 || B.needsPowerOfTwo && !(u(p) && u(I))) continue;
            const b = B.transcoderFormat[C ? 1 : 0],
                v = B.engineFormat[C ? 1 : 0],
                L = B.engineType[0];
            return {
                transcoderFormat: b,
                engineFormat: v,
                engineType: L
            }
        }
        throw new Error("THREE.KTX2Loader: Failed to identify transcoding target.")
    }

    function u(g) {
        return g <= 2 ? !0 : (g & g - 1) === 0 && g !== 0
    }

    function d(g) {
        if (g.length === 1) return g[0];
        let p = 0;
        for (let E = 0; E < g.length; E++) {
            const x = g[E];
            p += x.byteLength
        }
        const I = new Uint8Array(p);
        let C = 0;
        for (let E = 0; E < g.length; E++) {
            const x = g[E];
            I.set(x, C), C += x.byteLength
        }
        return I
    }
};
