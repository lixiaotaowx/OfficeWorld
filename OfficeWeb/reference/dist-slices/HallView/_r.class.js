class _r {
    constructor() {
        this.plugins = [], this.options = {}, this.pending = [], this.buffers = [], this.byteOffset = 0, this.buffers = [], this.nodeMap = new Map, this.skins = [], this.extensionsUsed = {}, this.extensionsRequired = {}, this.uids = new Map, this.uid = 0, this.json = {
            asset: {
                version: "2.0",
                generator: "THREE.GLTFExporter r" + b4
            }
        }, this.cache = {
            meshes: new Map,
            attributes: new Map,
            attributesNormalized: new Map,
            materials: new Map,
            textures: new Map,
            images: new Map,
            normalMaps: new Map
        }, this.textureUtils = null
    }
    setPlugins(e) {
        this.plugins = e
    }
    setTextureUtils(e) {
        this.textureUtils = e
    }
    async writeAsync(e, t, s = {}) {
        this.options = Object.assign({
            binary: !1,
            trs: !1,
            onlyVisible: !0,
            maxTextureSize: 1 / 0,
            animations: [],
            includeCustomExtensions: !1,
            copyright: null
        }, s), this.options.animations.length > 0 && (this.options.trs = !0), await this.processInputAsync(e), await Promise.all(this.pending);
        const i = this,
            n = i.buffers,
            o = i.json;
        s = i.options;
        const a = i.extensionsUsed,
            l = i.extensionsRequired,
            A = new Blob(n, {
                type: "application/octet-stream"
            }),
            c = Object.keys(a),
            h = Object.keys(l);
        if (c.length > 0 && (o.extensionsUsed = c), h.length > 0 && (o.extensionsRequired = h), o.buffers && o.buffers.length > 0 && (o.buffers[0].byteLength = A.size), s.copyright && (o.asset.copyright = s.copyright), s.binary === !0) {
            const u = new FileReader;
            u.readAsArrayBuffer(A), u.onloadend = function() {
                const d = Bs(u.result),
                    g = new DataView(new ArrayBuffer(Q2));
                g.setUint32(0, d.byteLength, !0), g.setUint32(4, Nr, !0);
                const p = Bs(Pr(JSON.stringify(o)), 32),
                    I = new DataView(new ArrayBuffer(Q2));
                I.setUint32(0, p.byteLength, !0), I.setUint32(4, Fr, !0);
                const C = new ArrayBuffer(v2),
                    E = new DataView(C);
                E.setUint32(0, Lr, !0), E.setUint32(4, Rr, !0);
                const x = v2 + I.byteLength + p.byteLength + g.byteLength + d.byteLength;
                E.setUint32(8, x, !0);
                const B = new Blob([C, I, p, g, d], {
                        type: "application/octet-stream"
                    }),
                    b = new FileReader;
                b.readAsArrayBuffer(B), b.onloadend = function() {
                    t(b.result)
                }
            }
        } else if (o.buffers && o.buffers.length > 0) {
            const u = new FileReader;
            u.readAsDataURL(A), u.onloadend = function() {
                const d = u.result;
                o.buffers[0].uri = d, t(o)
            }
        } else t(o)
    }
    serializeUserData(e, t) {
        if (Object.keys(e.userData).length === 0) return;
        const s = this.options,
            i = this.extensionsUsed;
        try {
            const n = JSON.parse(JSON.stringify(e.userData));
            if (s.includeCustomExtensions && n.gltfExtensions) {
                t.extensions === void 0 && (t.extensions = {});
                for (const o in n.gltfExtensions) t.extensions[o] = n.gltfExtensions[o], i[o] = !0;
                delete n.gltfExtensions
            }
            Object.keys(n).length > 0 && (t.extras = n)
        } catch (n) {
            console.warn("THREE.GLTFExporter: userData of '" + e.name + "' won't be serialized because of JSON.stringify error - " + n.message)
        }
    }
    getUID(e, t = !1) {
        if (this.uids.has(e) === !1) {
            const i = new Map;
            i.set(!0, this.uid++), i.set(!1, this.uid++), this.uids.set(e, i)
        }
        return this.uids.get(e).get(t)
    }
    isNormalizedNormalAttribute(e) {
        if (this.cache.attributesNormalized.has(e)) return !1;
        const s = new T;
        for (let i = 0, n = e.count; i < n; i++)
            if (Math.abs(s.fromBufferAttribute(e, i).length() - 1) > 5e-4) return !1;
        return !0
    }
    createNormalizedNormalAttribute(e) {
        const t = this.cache;
        if (t.attributesNormalized.has(e)) return t.attributesNormalized.get(e);
        const s = e.clone(),
            i = new T;
        for (let n = 0, o = s.count; n < o; n++) i.fromBufferAttribute(s, n), i.x === 0 && i.y === 0 && i.z === 0 ? i.setX(1) : i.normalize(), s.setXYZ(n, i.x, i.y, i.z);
        return t.attributesNormalized.set(e, s), s
    }
    applyTextureTransform(e, t) {
        let s = !1;
        const i = {};
        (t.offset.x !== 0 || t.offset.y !== 0) && (i.offset = t.offset.toArray(), s = !0), t.rotation !== 0 && (i.rotation = t.rotation, s = !0), (t.repeat.x !== 1 || t.repeat.y !== 1) && (i.scale = t.repeat.toArray(), s = !0), s && (e.extensions = e.extensions || {}, e.extensions.KHR_texture_transform = i, this.extensionsUsed.KHR_texture_transform = !0)
    }
    async buildMetalRoughTextureAsync(e, t) {
        if (e === t) return e;

        function s(d) {
            return d.colorSpace === oe ? function(p) {
                return p < .04045 ? p * .0773993808 : Math.pow(p * .9478672986 + .0521327014, 2.4)
            } : function(p) {
                return p
            }
        }
        e instanceof Jt && (e = await this.decompressTextureAsync(e)), t instanceof Jt && (t = await this.decompressTextureAsync(t));
        const i = e ? e.image : null,
            n = t ? t.image : null,
            o = Math.max(i ? i.width : 0, n ? n.width : 0),
            a = Math.max(i ? i.height : 0, n ? n.height : 0),
            l = xs();
        l.width = o, l.height = a;
        const A = l.getContext("2d", {
            willReadFrequently: !0
        });
        A.fillStyle = "#00ffff", A.fillRect(0, 0, o, a);
        const c = A.getImageData(0, 0, o, a);
        if (i) {
            A.drawImage(i, 0, 0, o, a);
            const d = s(e),
                g = A.getImageData(0, 0, o, a).data;
            for (let p = 2; p < g.length; p += 4) c.data[p] = d(g[p] / 256) * 256
        }
        if (n) {
            A.drawImage(n, 0, 0, o, a);
            const d = s(t),
                g = A.getImageData(0, 0, o, a).data;
            for (let p = 1; p < g.length; p += 4) c.data[p] = d(g[p] / 256) * 256
        }
        A.putImageData(c, 0, 0);
        const u = (e || t).clone();
        return u.source = new t2(l), u.colorSpace = Ps, u.channel = (e || t).channel, e && t && e.channel !== t.channel && console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."), console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."), u
    }
    async buildNormalMapTextureAsync(e, t, s) {
        e instanceof Jt && (e = await this.decompressTextureAsync(e));
        const i = e.image,
            n = xs();
        n.width = i.width, n.height = i.height;
        const o = n.getContext("2d", {
            willReadFrequently: !0
        });
        o.drawImage(i, 0, 0, n.width, n.height);
        const a = o.getImageData(0, 0, n.width, n.height),
            l = a.data;
        for (let c = 0; c < l.length; c += 4) t && (l[c + 0] = 255 - l[c + 0]), s && (l[c + 1] = 255 - l[c + 1]);
        o.putImageData(a, 0, 0);
        const A = e.clone();
        return A.source = new t2(n), A
    }
    async decompressTextureAsync(e, t = 1 / 0) {
        if (this.textureUtils === null) throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");
        return await this.textureUtils.decompress(e, t)
    }
    processBuffer(e) {
        const t = this.json,
            s = this.buffers;
        return t.buffers || (t.buffers = [{
            byteLength: 0
        }]), s.push(e), 0
    }
    processBufferView(e, t, s, i, n) {
        const o = this.json;
        o.bufferViews || (o.bufferViews = []);
        let a;
        switch (t) {
            case e0.BYTE:
            case e0.UNSIGNED_BYTE:
                a = 1;
                break;
            case e0.SHORT:
            case e0.UNSIGNED_SHORT:
                a = 2;
                break;
            default:
                a = 4
        }
        let l = e.itemSize * a;
        n === e0.ARRAY_BUFFER && (l = Math.ceil(l / 4) * 4);
        const A = M5(i * l),
            c = new DataView(new ArrayBuffer(A));
        let h = 0;
        for (let g = s; g < s + i; g++) {
            for (let p = 0; p < e.itemSize; p++) {
                let I;
                e.itemSize > 4 ? I = e.array[g * e.itemSize + p] : (p === 0 ? I = e.getX(g) : p === 1 ? I = e.getY(g) : p === 2 ? I = e.getZ(g) : p === 3 && (I = e.getW(g)), e.normalized === !0 && (I = ve.normalize(I, e.array))), t === e0.FLOAT ? c.setFloat32(h, I, !0) : t === e0.INT ? c.setInt32(h, I, !0) : t === e0.UNSIGNED_INT ? c.setUint32(h, I, !0) : t === e0.SHORT ? c.setInt16(h, I, !0) : t === e0.UNSIGNED_SHORT ? c.setUint16(h, I, !0) : t === e0.BYTE ? c.setInt8(h, I) : t === e0.UNSIGNED_BYTE && c.setUint8(h, I), h += a
            }
            h % l !== 0 && (h += l - h % l)
        }
        const u = {
            buffer: this.processBuffer(c.buffer),
            byteOffset: this.byteOffset,
            byteLength: A
        };
        return n !== void 0 && (u.target = n), n === e0.ARRAY_BUFFER && (u.byteStride = l), this.byteOffset += A, o.bufferViews.push(u), {
            id: o.bufferViews.length - 1,
            byteLength: 0
        }
    }
    processBufferViewImage(e) {
        const t = this,
            s = t.json;
        return s.bufferViews || (s.bufferViews = []), new Promise(function(i) {
            const n = new FileReader;
            n.readAsArrayBuffer(e), n.onloadend = function() {
                const o = Bs(n.result),
                    a = {
                        buffer: t.processBuffer(o),
                        byteOffset: t.byteOffset,
                        byteLength: o.byteLength
                    };
                t.byteOffset += o.byteLength, i(s.bufferViews.push(a) - 1)
            }
        })
    }
    processAccessor(e, t, s, i) {
        const n = this.json,
            o = {
                1: "SCALAR",
                2: "VEC2",
                3: "VEC3",
                4: "VEC4",
                9: "MAT3",
                16: "MAT4"
            };
        let a;
        if (e.array.constructor === Float32Array) a = e0.FLOAT;
        else if (e.array.constructor === Int32Array) a = e0.INT;
        else if (e.array.constructor === Uint32Array) a = e0.UNSIGNED_INT;
        else if (e.array.constructor === Int16Array) a = e0.SHORT;
        else if (e.array.constructor === Uint16Array) a = e0.UNSIGNED_SHORT;
        else if (e.array.constructor === Int8Array) a = e0.BYTE;
        else if (e.array.constructor === Uint8Array) a = e0.UNSIGNED_BYTE;
        else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: " + e.array.constructor.name);
        if (s === void 0 && (s = 0), (i === void 0 || i === 1 / 0) && (i = e.count), i === 0) return null;
        const l = Gr(e, s, i);
        let A;
        t !== void 0 && (A = e === t.index ? e0.ELEMENT_ARRAY_BUFFER : e0.ARRAY_BUFFER);
        const c = this.processBufferView(e, a, s, i, A),
            h = {
                bufferView: c.id,
                byteOffset: c.byteOffset,
                componentType: a,
                count: i,
                max: l.max,
                min: l.min,
                type: o[e.itemSize]
            };
        return e.normalized === !0 && (h.normalized = !0), n.accessors || (n.accessors = []), n.accessors.push(h) - 1
    }
    processImage(e, t, s, i = "image/png") {
        if (e !== null) {
            const n = this,
                o = n.cache,
                a = n.json,
                l = n.options,
                A = n.pending;
            o.images.has(e) || o.images.set(e, {});
            const c = o.images.get(e),
                h = i + ":flipY/" + s.toString();
            if (c[h] !== void 0) return c[h];
            a.images || (a.images = []);
            const u = {
                    mimeType: i
                },
                d = xs();
            d.width = Math.min(e.width, l.maxTextureSize), d.height = Math.min(e.height, l.maxTextureSize);
            const g = d.getContext("2d", {
                willReadFrequently: !0
            });
            if (s === !0 && (g.translate(0, d.height), g.scale(1, -1)), e.data !== void 0) {
                t !== ne && console.error("GLTFExporter: Only RGBAFormat is supported.", t), (e.width > l.maxTextureSize || e.height > l.maxTextureSize) && console.warn("GLTFExporter: Image size is bigger than maxTextureSize", e);
                const I = new Uint8ClampedArray(e.height * e.width * 4);
                for (let C = 0; C < I.length; C += 4) I[C + 0] = e.data[C + 0], I[C + 1] = e.data[C + 1], I[C + 2] = e.data[C + 2], I[C + 3] = e.data[C + 3];
                g.putImageData(new ImageData(I, e.width, e.height), 0, 0)
            } else if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap || typeof OffscreenCanvas < "u" && e instanceof OffscreenCanvas) g.drawImage(e, 0, 0, d.width, d.height);
            else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");
            l.binary === !0 ? A.push(zr(d, i).then(I => n.processBufferViewImage(I)).then(I => {
                u.bufferView = I
            })) : u.uri = m3.getDataURL(d, i);
            const p = a.images.push(u) - 1;
            return c[h] = p, p
        } else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")
    }
    processSampler(e) {
        const t = this.json;
        t.samplers || (t.samplers = []);
        const s = {
            magFilter: ae[e.magFilter],
            minFilter: ae[e.minFilter],
            wrapS: ae[e.wrapS],
            wrapT: ae[e.wrapT]
        };
        return t.samplers.push(s) - 1
    }
    async processTextureAsync(e) {
        const s = this.options,
            i = this.cache,
            n = this.json;
        if (i.textures.has(e)) return i.textures.get(e);
        n.textures || (n.textures = []), e instanceof Jt && (e = await this.decompressTextureAsync(e, s.maxTextureSize));
        const o = e.userData.mimeType,
            a = this.processImage(e.image, e.format, e.flipY, o),
            l = {
                sampler: this.processSampler(e)
            };
        o === "image/webp" ? (l.extensions = l.extensions || {}, l.extensions.EXT_texture_webp = {
            source: a
        }, this.extensionsUsed.EXT_texture_webp = !0, this.extensionsRequired.EXT_texture_webp = !0) : l.source = a, e.name && (l.name = e.name), await this._invokeAllAsync(async function(c) {
            c.writeTexture && await c.writeTexture(e, l)
        });
        const A = n.textures.push(l) - 1;
        return i.textures.set(e, A), A
    }
    async processMaterialAsync(e, t) {
        const s = this.cache,
            i = this.json,
            n = t !== void 0 && t.hasAttribute("tangent"),
            o = e.normalMap ? e.uuid + ":" + n : e.uuid;
        if (s.materials.has(o)) return s.materials.get(o);
        if (e.isShaderMaterial) return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."), null;
        i.materials || (i.materials = []);
        const a = {
            pbrMetallicRoughness: {}
        };
        e.isMeshStandardMaterial !== !0 && e.isMeshBasicMaterial !== !0 && console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");
        const l = e.color.toArray().concat([e.opacity]);
        if (Oe(l, [1, 1, 1, 1]) || (a.pbrMetallicRoughness.baseColorFactor = l), e.isMeshStandardMaterial ? (a.pbrMetallicRoughness.metallicFactor = e.metalness, a.pbrMetallicRoughness.roughnessFactor = e.roughness) : (a.pbrMetallicRoughness.metallicFactor = 0, a.pbrMetallicRoughness.roughnessFactor = 1), e.metalnessMap || e.roughnessMap) {
            const c = await this.buildMetalRoughTextureAsync(e.metalnessMap, e.roughnessMap),
                h = {
                    index: await this.processTextureAsync(c),
                    texCoord: c.channel
                };
            this.applyTextureTransform(h, c), a.pbrMetallicRoughness.metallicRoughnessTexture = h
        }
        if (e.map) {
            const c = {
                index: await this.processTextureAsync(e.map),
                texCoord: e.map.channel
            };
            this.applyTextureTransform(c, e.map), a.pbrMetallicRoughness.baseColorTexture = c
        }
        if (e.emissive) {
            const c = e.emissive;
            if (Math.max(c.r, c.g, c.b) > 0 && (a.emissiveFactor = e.emissive.toArray()), e.emissiveMap) {
                const u = {
                    index: await this.processTextureAsync(e.emissiveMap),
                    texCoord: e.emissiveMap.channel
                };
                this.applyTextureTransform(u, e.emissiveMap), a.emissiveTexture = u
            }
        }
        if (e.normalMap) {
            const c = e.normalScale,
                h = c.x < 0,
                u = n ? c.y < 0 : c.y > 0;
            let d = e.normalMap;
            if (h || u) {
                s.normalMaps.has(e.normalMap) === !1 && s.normalMaps.set(e.normalMap, {});
                const p = s.normalMaps.get(e.normalMap),
                    I = `${h}:${u}`;
                p[I] === void 0 && (p[I] = await this.buildNormalMapTextureAsync(e.normalMap, h, u)), d = p[I]
            }
            const g = {
                index: await this.processTextureAsync(d),
                texCoord: e.normalMap.channel
            };
            Math.abs(c.x) !== 1 && (g.scale = Math.abs(c.x)), this.applyTextureTransform(g, e.normalMap), a.normalTexture = g
        }
        if (e.aoMap) {
            const c = {
                index: await this.processTextureAsync(e.aoMap),
                texCoord: e.aoMap.channel
            };
            e.aoMapIntensity !== 1 && (c.strength = e.aoMapIntensity), this.applyTextureTransform(c, e.aoMap), a.occlusionTexture = c
        }
        e.transparent ? a.alphaMode = "BLEND" : e.alphaTest > 0 && (a.alphaMode = "MASK", a.alphaCutoff = e.alphaTest), e.side === C9 && (a.doubleSided = !0), e.name !== "" && (a.name = e.name), this.serializeUserData(e, a), await this._invokeAllAsync(async function(c) {
            c.writeMaterialAsync && await c.writeMaterialAsync(e, a)
        });
        const A = i.materials.push(a) - 1;
        return s.materials.set(o, A), A
    }
    async processMeshAsync(e) {
        const t = this.cache,
            s = this.json,
            i = [e.geometry.uuid];
        if (Array.isArray(e.material))
            for (let B = 0, b = e.material.length; B < b; B++) i.push(e.material[B].uuid);
        else i.push(e.material.uuid);
        const n = i.join(":");
        if (t.meshes.has(n)) return t.meshes.get(n);
        const o = e.geometry;
        let a;
        e.isLineSegments ? a = e0.LINES : e.isLineLoop ? a = e0.LINE_LOOP : e.isLine ? a = e0.LINE_STRIP : e.isPoints ? a = e0.POINTS : a = e.material.wireframe ? e0.LINES : e0.TRIANGLES;
        const l = {},
            A = {},
            c = [],
            h = [],
            u = {
                uv: "TEXCOORD_0",
                uv1: "TEXCOORD_1",
                uv2: "TEXCOORD_2",
                uv3: "TEXCOORD_3",
                color: "COLOR_0",
                skinWeight: "WEIGHTS_0",
                skinIndex: "JOINTS_0"
            },
            d = o.getAttribute("normal");
        d !== void 0 && !this.isNormalizedNormalAttribute(d) && (console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."), o.setAttribute("normal", this.createNormalizedNormalAttribute(d)));
        let g = null;
        for (let B in o.attributes) {
            if (B.slice(0, 5) === "morph") continue;
            const b = o.attributes[B];
            if (B = u[B] || B.toUpperCase(), !/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(B) && !B.startsWith("_") && (B = "_" + B), t.attributes.has(this.getUID(b))) {
                A[B] = t.attributes.get(this.getUID(b));
                continue
            }
            g = null;
            const L = b.array;
            B === "JOINTS_0" && !(L instanceof Uint16Array) && !(L instanceof Uint8Array) ? (console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'), g = Q1.Utils.toTypedBufferAttribute(b, Uint16Array)) : (L instanceof Uint32Array || L instanceof Int32Array) && !B.startsWith("_") && (console.warn(`GLTFExporter: Attribute "${B}" converted to type FLOAT.`), g = Q1.Utils.toTypedBufferAttribute(b, Float32Array));
            const D = this.processAccessor(g || b, o);
            D !== null && (B.startsWith("_") || this.detectMeshQuantization(B, b), A[B] = D, t.attributes.set(this.getUID(b), D))
        }
        if (d !== void 0 && o.setAttribute("normal", d), Object.keys(A).length === 0) return null;
        if (e.morphTargetInfluences !== void 0 && e.morphTargetInfluences.length > 0) {
            const B = [],
                b = [],
                v = {};
            if (e.morphTargetDictionary !== void 0)
                for (const L in e.morphTargetDictionary) v[e.morphTargetDictionary[L]] = L;
            for (let L = 0; L < e.morphTargetInfluences.length; ++L) {
                const D = {};
                let P = !1;
                for (const U in o.morphAttributes) {
                    if (U !== "position" && U !== "normal") {
                        P || (console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."), P = !0);
                        continue
                    }
                    const R = o.morphAttributes[U][L],
                        Q = U.toUpperCase(),
                        H = o.attributes[U];
                    if (t.attributes.has(this.getUID(R, !0))) {
                        D[Q] = t.attributes.get(this.getUID(R, !0));
                        continue
                    }
                    const N = R.clone();
                    if (!o.morphTargetsRelative)
                        for (let G = 0, q = R.count; G < q; G++)
                            for (let j = 0; j < R.itemSize; j++) j === 0 && N.setX(G, R.getX(G) - H.getX(G)), j === 1 && N.setY(G, R.getY(G) - H.getY(G)), j === 2 && N.setZ(G, R.getZ(G) - H.getZ(G)), j === 3 && N.setW(G, R.getW(G) - H.getW(G));
                    D[Q] = this.processAccessor(N, o), t.attributes.set(this.getUID(H, !0), D[Q])
                }
                h.push(D), B.push(e.morphTargetInfluences[L]), e.morphTargetDictionary !== void 0 && b.push(v[L])
            }
            l.weights = B, b.length > 0 && (l.extras = {}, l.extras.targetNames = b)
        }
        const p = Array.isArray(e.material);
        if (p && o.groups.length === 0) return null;
        let I = !1;
        if (p && o.index === null) {
            const B = [];
            for (let b = 0, v = o.attributes.position.count; b < v; b++) B[b] = b;
            o.setIndex(B), I = !0
        }
        const C = p ? e.material : [e.material],
            E = p ? o.groups : [{
                materialIndex: 0,
                start: void 0,
                count: void 0
            }];
        for (let B = 0, b = E.length; B < b; B++) {
            const v = {
                mode: a,
                attributes: A
            };
            if (this.serializeUserData(o, v), h.length > 0 && (v.targets = h), o.index !== null) {
                let D = this.getUID(o.index);
                (E[B].start !== void 0 || E[B].count !== void 0) && (D += ":" + E[B].start + ":" + E[B].count), t.attributes.has(D) ? v.indices = t.attributes.get(D) : (v.indices = this.processAccessor(o.index, o, E[B].start, E[B].count), t.attributes.set(D, v.indices)), v.indices === null && delete v.indices
            }
            const L = await this.processMaterialAsync(C[E[B].materialIndex], o);
            L !== null && (v.material = L), c.push(v)
        }
        I === !0 && o.setIndex(null), l.primitives = c, s.meshes || (s.meshes = []), await this._invokeAllAsync(function(B) {
            B.writeMesh && B.writeMesh(e, l)
        });
        const x = s.meshes.push(l) - 1;
        return t.meshes.set(n, x), x
    }
    detectMeshQuantization(e, t) {
        if (this.extensionsUsed[ws]) return;
        let s;
        switch (t.array.constructor) {
            case Int8Array:
                s = "byte";
                break;
            case Uint8Array:
                s = "unsigned byte";
                break;
            case Int16Array:
                s = "short";
                break;
            case Uint16Array:
                s = "unsigned short";
                break;
            default:
                return
        }
        t.normalized && (s += " normalized");
        const i = e.split("_", 1)[0];
        x2[i] && x2[i].includes(s) && (this.extensionsUsed[ws] = !0, this.extensionsRequired[ws] = !0)
    }
    processCamera(e) {
        const t = this.json;
        t.cameras || (t.cameras = []);
        const s = e.isOrthographicCamera,
            i = {
                type: s ? "orthographic" : "perspective"
            };
        return s ? i.orthographic = {
            xmag: e.right,
            ymag: e.top,
            zfar: e.far <= 0 ? .001 : e.far,
            znear: e.near < 0 ? 0 : e.near
        } : i.perspective = {
            aspectRatio: e.aspect,
            yfov: ve.degToRad(e.fov),
            zfar: e.far <= 0 ? .001 : e.far,
            znear: e.near < 0 ? 0 : e.near
        }, e.name !== "" && (i.name = e.type), t.cameras.push(i) - 1
    }
    processAnimation(e, t) {
        const s = this.json,
            i = this.nodeMap;
        s.animations || (s.animations = []), e = Q1.Utils.mergeMorphTargetTracks(e.clone(), t);
        const n = e.tracks,
            o = [],
            a = [];
        for (let A = 0; A < n.length; ++A) {
            const c = n[A],
                h = y9.parseTrackName(c.name);
            let u = y9.findNode(t, h.nodeName);
            const d = b2[h.propertyName];
            if (h.objectName === "bones" && (u.isSkinnedMesh === !0 ? u = u.skeleton.getBoneByName(h.objectIndex) : u = void 0), !u || !d) {
                console.warn('THREE.GLTFExporter: Could not export animation track "%s".', c.name);
                continue
            }
            const g = 1;
            let p = c.values.length / c.times.length;
            d === b2.morphTargetInfluences && (p /= u.morphTargetInfluences.length);
            let I;
            c.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline === !0 ? (I = "CUBICSPLINE", p /= 3) : c.getInterpolation() === I3 ? I = "STEP" : I = "LINEAR", a.push({
                input: this.processAccessor(new me(c.times, g)),
                output: this.processAccessor(new me(c.values, p)),
                interpolation: I
            }), o.push({
                sampler: a.length - 1,
                target: {
                    node: i.get(u),
                    path: d
                }
            })
        }
        const l = {
            name: e.name || "clip_" + s.animations.length,
            samplers: a,
            channels: o
        };
        return this.serializeUserData(e, l), s.animations.push(l), s.animations.length - 1
    }
    processSkin(e) {
        const t = this.json,
            s = this.nodeMap,
            i = t.nodes[s.get(e)],
            n = e.skeleton;
        if (n === void 0) return null;
        const o = e.skeleton.bones[0];
        if (o === void 0) return null;
        const a = [],
            l = new Float32Array(n.bones.length * 16),
            A = new Mt;
        for (let h = 0; h < n.bones.length; ++h) a.push(s.get(n.bones[h])), A.copy(n.boneInverses[h]), A.multiply(e.bindMatrix).toArray(l, h * 16);
        return t.skins === void 0 && (t.skins = []), t.skins.push({
            inverseBindMatrices: this.processAccessor(new me(l, 16)),
            joints: a,
            skeleton: s.get(o)
        }), i.skin = t.skins.length - 1
    }
    async processNodeAsync(e) {
        const t = this.json,
            s = this.options,
            i = this.nodeMap;
        if (t.nodes || (t.nodes = []), e.pivot !== null) return await this._processNodeWithPivotAsync(e);
        const n = {};
        if (s.trs) {
            const a = e.quaternion.toArray(),
                l = e.position.toArray(),
                A = e.scale.toArray();
            Oe(a, [0, 0, 0, 1]) || (n.rotation = a), Oe(l, [0, 0, 0]) || (n.translation = l), Oe(A, [1, 1, 1]) || (n.scale = A)
        } else e.matrixAutoUpdate && e.updateMatrix(), Ur(e.matrix) === !1 && (n.matrix = e.matrix.elements);
        if (e.name !== "" && (n.name = String(e.name)), this.serializeUserData(e, n), e.isMesh || e.isLine || e.isPoints) {
            const a = await this.processMeshAsync(e);
            a !== null && (n.mesh = a)
        } else e.isCamera && (n.camera = this.processCamera(e));
        e.isSkinnedMesh && this.skins.push(e);
        const o = t.nodes.push(n) - 1;
        if (i.set(e, o), e.children.length > 0) {
            const a = [];
            for (let l = 0, A = e.children.length; l < A; l++) {
                const c = e.children[l];
                if (c.visible || s.onlyVisible === !1) {
                    const h = await this.processNodeAsync(c);
                    h !== null && a.push(h)
                }
            }
            a.length > 0 && (n.children = a)
        }
        return await this._invokeAllAsync(function(a) {
            a.writeNode && a.writeNode(e, n)
        }), o
    }
    async _processNodeWithPivotAsync(e) {
        const t = this.json,
            s = this.options,
            i = this.nodeMap,
            n = e.pivot,
            o = {},
            a = e.quaternion.toArray(),
            l = [e.position.x + n.x, e.position.y + n.y, e.position.z + n.z],
            A = e.scale.toArray();
        Oe(a, [0, 0, 0, 1]) || (o.rotation = a), Oe(l, [0, 0, 0]) || (o.translation = l), Oe(A, [1, 1, 1]) || (o.scale = A), o.extras = {
            pivot: n.toArray()
        }, e.name !== "" && (o.name = String(e.name)), this.serializeUserData(e, o);
        const c = t.nodes.push(o) - 1;
        i.set(e, c);
        const h = {},
            u = [-n.x, -n.y, -n.z];
        if (Oe(u, [0, 0, 0]) || (h.translation = u), e.isMesh || e.isLine || e.isPoints) {
            const p = await this.processMeshAsync(e);
            p !== null && (h.mesh = p)
        } else e.isCamera && (h.camera = this.processCamera(e));
        e.isSkinnedMesh && this.skins.push(e);
        const g = [t.nodes.push(h) - 1];
        if (e.children.length > 0) {
            const p = [];
            for (let I = 0, C = e.children.length; I < C; I++) {
                const E = e.children[I];
                if (E.visible || s.onlyVisible === !1) {
                    const x = await this.processNodeAsync(E);
                    x !== null && p.push(x)
                }
            }
            p.length > 0 && (h.children = p)
        }
        return o.children = g, await this._invokeAllAsync(function(p) {
            p.writeNode && p.writeNode(e, o)
        }), c
    }
    async processSceneAsync(e) {
        const t = this.json,
            s = this.options;
        t.scenes || (t.scenes = [], t.scene = 0);
        const i = {};
        e.name !== "" && (i.name = e.name), t.scenes.push(i);
        const n = [];
        for (let o = 0, a = e.children.length; o < a; o++) {
            const l = e.children[o];
            if (l.visible || s.onlyVisible === !1) {
                const A = await this.processNodeAsync(l);
                A !== null && n.push(A)
            }
        }
        n.length > 0 && (i.nodes = n), this.serializeUserData(e, i)
    }
    async processObjectsAsync(e) {
        const t = new w9;
        t.name = "AuxScene";
        for (let s = 0; s < e.length; s++) t.children.push(e[s]);
        await this.processSceneAsync(t)
    }
    async processInputAsync(e) {
        const t = this.options;
        e = e instanceof Array ? e : [e], await this._invokeAllAsync(function(i) {
            i.beforeParse && i.beforeParse(e)
        });
        const s = [];
        for (let i = 0; i < e.length; i++) e[i] instanceof w9 ? await this.processSceneAsync(e[i]) : s.push(e[i]);
        s.length > 0 && await this.processObjectsAsync(s);
        for (let i = 0; i < this.skins.length; ++i) this.processSkin(this.skins[i]);
        if (e.length === 1)
            for (let i = 0; i < t.animations.length; ++i) this.processAnimation(t.animations[i], e[0]);
        else
            for (let i = 0; i < e.length; i++) {
                const n = t.animations[i] || [];
                for (let o = 0; o < n.length; ++o) this.processAnimation(n[o], e[i])
            }
        await this._invokeAllAsync(function(i) {
            i.afterParse && i.afterParse(e)
        })
    }
    async _invokeAllAsync(e) {
        for (let t = 0, s = this.plugins.length; t < s; t++) await e(this.plugins[t])
    }
}
