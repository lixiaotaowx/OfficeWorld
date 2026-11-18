class cv {
    constructor(e = {}, t = {}) {
        this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new Px, this.associations = new Map, this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
            refs: {},
            uses: {}
        }, this.cameraCache = {
            refs: {},
            uses: {}
        }, this.lightCache = {
            refs: {},
            uses: {}
        }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
        let n = !1,
            i = -1,
            r = !1,
            a = -1;
        if (typeof navigator < "u" && typeof navigator.userAgent < "u") {
            const o = navigator.userAgent;
            n = /^((?!chrome|android).)*safari/i.test(o) === !0;
            const l = o.match(/Version\/(\d+)/);
            i = n && l ? parseInt(l[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1
        }
        typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? (this.textureLoader = new hp(this.options.manager), this.textureLoader.setPriority(this.options.priority), this.textureLoader.setCache(this.options.cache)) : (this.textureLoader = new gp(this.options.manager), this.textureLoader.setPriority(this.options.priority), this.textureLoader.setCache(this.options.cache)), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setWithCredentials(this.options.withCredentials), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Ir(this.options.manager), this.fileLoader.setPriority(this.options.priority), this.fileLoader.setCache(this.options.cache), this.fileLoader.setResponseType("arraybuffer"), (this.options.withCredentials || this.options.crossOrigin === "use-credentials") && this.fileLoader.setWithCredentials(!0)
    }
    setExtensions(e) {
        this.extensions = e
    }
    setPlugins(e) {
        this.plugins = e
    }
    parse(e, t) {
        const n = this,
            i = this.json,
            r = this.extensions;
        this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(a) {
            return a._markDefs && a._markDefs()
        }), Promise.all(this._invokeAll(function(a) {
            return a.beforeRoot && a.beforeRoot()
        })).then(function() {
            return Promise.all([n.getDependencies("scene"), n.getDependencies("animation"), n.getDependencies("camera")])
        }).then(function(a) {
            const o = {
                scene: a[0][i.scene || 0],
                scenes: a[0],
                animations: a[1],
                cameras: a[2],
                asset: i.asset,
                parser: n,
                userData: {}
            };
            return oi(r, o, i), gn(o, i), Promise.all(n._invokeAll(function(l) {
                return l.afterRoot && l.afterRoot(o)
            })).then(function() {
                for (const l of o.scenes) l.updateMatrixWorld();
                e(o)
            })
        }).catch(t)
    }
    _markDefs() {
        const e = this.json.nodes || [],
            t = this.json.skins || [],
            n = this.json.meshes || [];
        for (let i = 0, r = t.length; i < r; i++) {
            const a = t[i].joints;
            for (let o = 0, l = a.length; o < l; o++) e[a[o]].isBone = !0
        }
        for (let i = 0, r = e.length; i < r; i++) {
            const a = e[i];
            a.mesh !== void 0 && (this._addNodeRef(this.meshCache, a.mesh), a.skin !== void 0 && (n[a.mesh].isSkinnedMesh = !0)), a.camera !== void 0 && this._addNodeRef(this.cameraCache, a.camera)
        }
    }
    _addNodeRef(e, t) {
        t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++)
    }
    _getNodeRef(e, t, n) {
        if (e.refs[t] <= 1) return n;
        const i = n.clone(),
            r = (a, o) => {
                const l = this.associations.get(a);
                l != null && this.associations.set(o, l);
                for (const [c, h] of a.children.entries()) r(h, o.children[c])
            };
        return r(n, i), i.name += "_instance_" + e.uses[t]++, i
    }
    _invokeOne(e) {
        const t = Object.values(this.plugins);
        t.push(this);
        for (let n = 0; n < t.length; n++) {
            const i = e(t[n]);
            if (i) return i
        }
        return null
    }
    _invokeAll(e) {
        const t = Object.values(this.plugins);
        t.unshift(this);
        const n = [];
        for (let i = 0; i < t.length; i++) {
            const r = e(t[i]);
            r && n.push(r)
        }
        return n
    }
    getDependency(e, t) {
        const n = e + ":" + t;
        let i = this.cache.get(n);
        if (!i) {
            switch (e) {
                case "scene":
                    i = this.loadScene(t);
                    break;
                case "node":
                    i = this._invokeOne(function(r) {
                        return r.loadNode && r.loadNode(t)
                    });
                    break;
                case "mesh":
                    i = this._invokeOne(function(r) {
                        return r.loadMesh && r.loadMesh(t)
                    });
                    break;
                case "accessor":
                    i = this.loadAccessor(t);
                    break;
                case "bufferView":
                    i = this._invokeOne(function(r) {
                        return r.loadBufferView && r.loadBufferView(t)
                    });
                    break;
                case "buffer":
                    i = this.loadBuffer(t);
                    break;
                case "material":
                    i = this._invokeOne(function(r) {
                        return r.loadMaterial && r.loadMaterial(t)
                    });
                    break;
                case "texture":
                    i = this._invokeOne(function(r) {
                        return r.loadTexture && r.loadTexture(t)
                    });
                    break;
                case "skin":
                    i = this.loadSkin(t);
                    break;
                case "animation":
                    i = this._invokeOne(function(r) {
                        return r.loadAnimation && r.loadAnimation(t)
                    });
                    break;
                case "camera":
                    i = this.loadCamera(t);
                    break;
                default:
                    if (i = this._invokeOne(function(r) {
                            return r != this && r.getDependency && r.getDependency(e, t)
                        }), !i) throw new Error("Unknown type: " + e);
                    break
            }
            this.cache.add(n, i)
        }
        return i
    }
    getDependencies(e) {
        let t = this.cache.get(e);
        if (!t) {
            const n = this,
                i = this.json[e + (e === "mesh" ? "es" : "s")] || [];
            t = Promise.all(i.map(function(r, a) {
                return n.getDependency(e, a)
            })), this.cache.add(e, t)
        }
        return t
    }
    loadBuffer(e) {
        const t = this.json.buffers[e],
            n = this.fileLoader;
        if (t.type && t.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
        if (t.uri === void 0 && e === 0) return Promise.resolve(this.extensions[Ze.KHR_BINARY_GLTF].body);
        const i = this.options;
        return new Promise(function(r, a) {
            n.load(Zn.resolveURL(t.uri, i.path), r, void 0, function() {
                a(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'))
            })
        })
    }
    loadBufferView(e) {
        const t = this.json.bufferViews[e];
        return this.getDependency("buffer", t.buffer).then(function(n) {
            const i = t.byteLength || 0,
                r = t.byteOffset || 0;
            return n.slice(r, r + i)
        })
    }
    loadAccessor(e) {
        const t = this,
            n = this.json,
            i = this.json.accessors[e];
        if (i.bufferView === void 0 && i.sparse === void 0) {
            const a = Ea[i.type],
                o = Bi[i.componentType],
                l = i.normalized === !0,
                c = new o(i.count * a);
            return Promise.resolve(new Ft(c, a, l))
        }
        const r = [];
        return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
            const o = a[0],
                l = Ea[i.type],
                c = Bi[i.componentType],
                h = c.BYTES_PER_ELEMENT,
                u = h * l,
                d = i.byteOffset || 0,
                f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0,
                p = i.normalized === !0;
            let x, m;
            if (f && f !== u) {
                const g = Math.floor(d / f),
                    M = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + g + ":" + i.count;
                let E = t.cache.get(M);
                E || (x = new c(o, g * f, i.count * f / h), E = new bh(x, f / h), t.cache.add(M, E)), m = new Or(E, l, d % f / h, p)
            } else o === null ? x = new c(i.count * l) : x = new c(o, d, i.count * l), m = new Ft(x, l, p);
            if (i.sparse !== void 0) {
                const g = Ea.SCALAR,
                    M = Bi[i.sparse.indices.componentType],
                    E = i.sparse.indices.byteOffset || 0,
                    v = i.sparse.values.byteOffset || 0,
                    A = new M(a[1], E, i.sparse.count * g),
                    b = new c(a[2], v, i.sparse.count * l);
                o !== null && (m = new Ft(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
                for (let _ = 0, T = A.length; _ < T; _++) {
                    const I = A[_];
                    if (m.setX(I, b[_ * l]), l >= 2 && m.setY(I, b[_ * l + 1]), l >= 3 && m.setZ(I, b[_ * l + 2]), l >= 4 && m.setW(I, b[_ * l + 3]), l >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")
                }
                m.normalized = p
            }
            return m
        })
    }
    loadTexture(e) {
        const t = this.json,
            n = this.options,
            r = t.textures[e].source,
            a = t.images[r];
        let o = this.textureLoader;
        if (a.uri) {
            const l = n.manager.getHandler(a.uri);
            l !== null && (o = l)
        }
        return this.loadTextureImage(e, r, o)
    }
    loadTextureImage(e, t, n) {
        const i = this,
            r = this.json,
            a = r.textures[e],
            o = r.images[t],
            l = (o.uri || o.bufferView) + ":" + a.sampler;
        if (this.textureCache[l]) return this.textureCache[l];
        const c = this.loadImageSource(t, n).then(function(h) {
            h.flipY = !1, h.name = a.name || o.name || "", h.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (h.name = o.uri);
            const d = (r.samplers || {})[a.sampler] || {};
            return h.magFilter = qc[d.magFilter] || Ct, h.minFilter = qc[d.minFilter] || vn, h.wrapS = Yc[d.wrapS] || zi, h.wrapT = Yc[d.wrapT] || zi, h.generateMipmaps = !h.isCompressedTexture && h.minFilter !== Rt && h.minFilter !== Ct, i.associations.set(h, {
                textures: e
            }), h
        }).catch(function() {
            return null
        });
        return this.textureCache[l] = c, c
    }
    loadImageSource(e, t) {
        const n = this,
            i = this.json,
            r = this.options;
        if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then(d => d.clone());
        const a = i.images[e],
            o = self.URL || self.webkitURL;
        let l = a.uri || "",
            c = !1,
            h;
        if (t.isKTX2Loader === !0 && a.bufferView !== void 0) h = n.getDependency("bufferView", a.bufferView).then(function(d) {
            return new Promise(function(f, p) {
                t.parse(d, f, p)
            })
        });
        else {
            if (a.bufferView !== void 0) l = n.getDependency("bufferView", a.bufferView).then(function(d) {
                c = !0;
                const f = new Blob([d], {
                    type: a.mimeType
                });
                return l = o.createObjectURL(f), l
            });
            else if (a.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
            h = Promise.resolve(l).then(function(d) {
                return new Promise(function(f, p) {
                    let x = f;
                    t.isImageBitmapLoader === !0 && (x = function(m) {
                        const g = new vt(m);
                        g.needsUpdate = !0, f(g)
                    }), t.load(Zn.resolveURL(d, r.path), x, void 0, p)
                })
            })
        }
        const u = h.then(function(d) {
            return c === !0 && o.revokeObjectURL(l), gn(d, a), d.userData.mimeType = a.mimeType || ov(a.uri), d
        }).catch(function(d) {
            throw console.error("THREE.GLTFLoader: Couldn't load texture", l), d
        });
        return this.sourceCache[e] = u, u
    }
    assignTexture(e, t, n, i) {
        const r = this;
        return this.getDependency("texture", n.index).then(function(a) {
            if (!a) return null;
            if (n.texCoord !== void 0 && n.texCoord > 0 && (a = a.clone(), a.channel = n.texCoord), r.extensions[Ze.KHR_TEXTURE_TRANSFORM]) {
                const o = n.extensions !== void 0 ? n.extensions[Ze.KHR_TEXTURE_TRANSFORM] : void 0;
                if (o) {
                    const l = r.associations.get(a);
                    a = r.extensions[Ze.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, l)
                }
            }
            return i !== void 0 && (a.colorSpace = i), e[t] = a, a
        })
    }
    assignFinalMaterial(e) {
        const t = e.geometry;
        let n = e.material;
        const i = t.attributes.tangent === void 0,
            r = t.attributes.color !== void 0,
            a = t.attributes.normal === void 0;
        if (e.isPoints) {
            const o = "PointsMaterial:" + n.uuid;
            let l = this.cache.get(o);
            l || (l = new Ch, Zt.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, l.sizeAttenuation = !1, this.cache.add(o, l)), n = l
        } else if (e.isLine) {
            const o = "LineBasicMaterial:" + n.uuid;
            let l = this.cache.get(o);
            l || (l = new Xo, Zt.prototype.copy.call(l, n), l.color.copy(n.color), l.map = n.map, this.cache.add(o, l)), n = l
        }
        if (i || r || a) {
            let o = "ClonedMaterial:" + n.uuid + ":";
            i && (o += "derivative-tangents:"), r && (o += "vertex-colors:"), a && (o += "flat-shading:");
            let l = this.cache.get(o);
            l || (l = n.clone(), r && (l.vertexColors = !0), a && (l.flatShading = !0), i && (l.normalScale && (l.normalScale.y *= -1), l.clearcoatNormalScale && (l.clearcoatNormalScale.y *= -1)), this.cache.add(o, l), this.associations.set(l, this.associations.get(n))), n = l
        }
        e.material = n
    }
    getMaterialType() {
        return Ls
    }
    loadMaterial(e) {
        const t = this,
            n = this.json,
            i = this.extensions,
            r = n.materials[e];
        let a;
        const o = {},
            l = r.extensions || {},
            c = [];
        if (l[Ze.KHR_MATERIALS_UNLIT]) {
            const u = i[Ze.KHR_MATERIALS_UNLIT];
            a = u.getMaterialType(), c.push(u.extendParams(o, r, t))
        } else {
            const u = r.pbrMetallicRoughness || {};
            if (o.color = new Fe(1, 1, 1), o.opacity = 1, Array.isArray(u.baseColorFactor)) {
                const d = u.baseColorFactor;
                o.color.setRGB(d[0], d[1], d[2], Xt), o.opacity = d[3]
            }
            u.baseColorTexture !== void 0 && c.push(t.assignTexture(o, "map", u.baseColorTexture, bt)), o.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, o.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(o, "metalnessMap", u.metallicRoughnessTexture)), c.push(t.assignTexture(o, "roughnessMap", u.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
                return d.getMaterialType && d.getMaterialType(e)
            }), c.push(Promise.all(this._invokeAll(function(d) {
                return d.extendMaterialParams && d.extendMaterialParams(e, o)
            })))
        }
        r.doubleSided === !0 && (o.side = xn);
        const h = r.alphaMode || ba.OPAQUE;
        if (h === ba.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, h === ba.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : .5)), r.normalTexture !== void 0 && a !== Ni && (c.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new re(1, 1), r.normalTexture.scale !== void 0)) {
            const u = r.normalTexture.scale;
            o.normalScale.set(u, u)
        }
        if (r.occlusionTexture !== void 0 && a !== Ni && (c.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== Ni) {
            const u = r.emissiveFactor;
            o.emissive = new Fe().setRGB(u[0], u[1], u[2], Xt)
        }
        return r.emissiveTexture !== void 0 && a !== Ni && c.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, bt)), Promise.all(c).then(function() {
            const u = new a(o);
            return r.name && (u.name = r.name), gn(u, r), t.associations.set(u, {
                materials: e
            }), r.extensions && oi(i, u, r), u
        })
    }
    createUniqueName(e) {
        const t = ot.sanitizeNodeName(e || "");
        return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t)
    }
    loadGeometries(e) {
        const t = this,
            n = this.extensions,
            i = this.primitiveCache;

        function r(o) {
            return n[Ze.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(l) {
                return Kc(l, o, t)
            })
        }
        const a = [];
        for (let o = 0, l = e.length; o < l; o++) {
            const c = e[o],
                h = av(c),
                u = i[h];
            if (u) a.push(u.promise);
            else {
                let d;
                c.extensions && c.extensions[Ze.KHR_DRACO_MESH_COMPRESSION] ? d = r(c) : d = Kc(new wt, c, t), c.mode === Qt.TRIANGLE_STRIP ? d = d.then(f => Vc(f, fh)) : c.mode === Qt.TRIANGLE_FAN && (d = d.then(f => Vc(f, po))), i[h] = {
                    primitive: c,
                    promise: d
                }, a.push(d)
            }
        }
        return Promise.all(a)
    }
    loadMesh(e) {
        const t = this,
            n = this.json,
            i = this.extensions,
            r = n.meshes[e],
            a = r.primitives,
            o = [];
        for (let l = 0, c = a.length; l < c; l++) {
            const h = a[l].material === void 0 ? iv(this.cache) : this.getDependency("material", a[l].material);
            o.push(h)
        }
        return o.push(t.loadGeometries(a)), Promise.all(o).then(async function(l) {
            const c = l.slice(0, l.length - 1),
                h = l[l.length - 1],
                u = [];
            for (let f = 0, p = h.length; f < p; f++) {
                const x = h[f],
                    m = a[f];
                let g;
                const M = c[f];
                if (m.mode === Qt.TRIANGLES || m.mode === Qt.TRIANGLE_STRIP || m.mode === Qt.TRIANGLE_FAN || m.mode === void 0) {
                    const E = r.isSkinnedMesh === !0,
                        v = x.hasAttribute("skinIndex") && x.hasAttribute("skinWeight");
                    E && v === !1 && console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."), g = E && v ? new Ah(x, M) : new At(x, M), g.isSkinnedMesh === !0 && g.normalizeSkinWeights()
                } else if (m.mode === Qt.LINES) g = new Rh(x, M);
                else if (m.mode === Qt.LINE_STRIP) g = new qo(x, M);
                else if (m.mode === Qt.LINE_LOOP) g = new rf(x, M);
                else if (m.mode === Qt.POINTS) g = new af(x, M);
                else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
                Object.keys(g.geometry.morphAttributes).length > 0 && rv(g, r), g.name = t.createUniqueName(r.name || "mesh_" + e), gn(g, r), m.extensions && oi(i, g, m), t.assignFinalMaterial(g), u.push(g)
            }
            for (let f = 0, p = u.length; f < p; f++) t.associations.set(u[f], {
                meshes: e,
                primitives: f
            });
            if (u.length === 1) return r.extensions && oi(i, u[0], r), u[0];
            const d = new ci;
            r.extensions && oi(i, d, r), t.associations.set(d, {
                meshes: e
            });
            for (let f = 0, p = u.length; f < p; f++) d.add(u[f]);
            return d
        })
    }
    loadCamera(e) {
        let t;
        const n = this.json.cameras[e],
            i = n[n.type];
        if (!i) {
            console.warn("THREE.GLTFLoader: Missing camera parameters.");
            return
        }
        return n.type === "perspective" ? t = new Kt(Cd.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new Qo(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), gn(t, n), Promise.resolve(t)
    }
    loadSkin(e) {
        const t = this.json.skins[e],
            n = [];
        for (let i = 0, r = t.joints.length; i < r; i++) n.push(this._loadNodeShallow(t.joints[i]));
        return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(i) {
            const r = i.pop(),
                a = i,
                o = [],
                l = [];
            for (let c = 0, h = a.length; c < h; c++) {
                const u = a[c];
                if (u) {
                    o.push(u);
                    const d = new We;
                    r !== null && d.fromArray(r.array, c * 16), l.push(d)
                } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c])
            }
            return new Vo(o, l)
        })
    }
    loadAnimation(e) {
        const t = this.json,
            n = this,
            i = t.animations[e],
            r = i.name ? i.name : "animation_" + e,
            a = [],
            o = [],
            l = [],
            c = [],
            h = [];
        for (let u = 0, d = i.channels.length; u < d; u++) {
            const f = i.channels[u],
                p = i.samplers[f.sampler],
                x = f.target,
                m = x.node,
                g = i.parameters !== void 0 ? i.parameters[p.input] : p.input,
                M = i.parameters !== void 0 ? i.parameters[p.output] : p.output;
            x.node !== void 0 && (a.push(this.getDependency("node", m)), o.push(this.getDependency("accessor", g)), l.push(this.getDependency("accessor", M)), c.push(p), h.push(x))
        }
        return Promise.all([Promise.all(a), Promise.all(o), Promise.all(l), Promise.all(c), Promise.all(h)]).then(function(u) {
            const d = u[0],
                f = u[1],
                p = u[2],
                x = u[3],
                m = u[4],
                g = [];
            for (let E = 0, v = d.length; E < v; E++) {
                const A = d[E],
                    b = f[E],
                    _ = p[E],
                    T = x[E],
                    I = m[E];
                if (A === void 0) continue;
                A.updateMatrix && A.updateMatrix();
                const R = n._createAnimationTracks(A, b, _, T, I);
                if (R)
                    for (let D = 0; D < R.length; D++) g.push(R[D])
            }
            const M = new vo(r, void 0, g);
            return gn(M, i), M
        })
    }
    createNodeMesh(e) {
        const t = this.json,
            n = this,
            i = t.nodes[e];
        return i.mesh === void 0 ? null : n.getDependency("mesh", i.mesh).then(function(r) {
            const a = n._getNodeRef(n.meshCache, i.mesh, r);
            return i.weights !== void 0 && a.traverse(function(o) {
                if (o.isMesh)
                    for (let l = 0, c = i.weights.length; l < c; l++) o.morphTargetInfluences[l] = i.weights[l]
            }), a
        })
    }
    loadNode(e) {
        const t = this.json,
            n = this,
            i = t.nodes[e],
            r = n._loadNodeShallow(e),
            a = [],
            o = i.children || [];
        for (let c = 0, h = o.length; c < h; c++) a.push(n.getDependency("node", o[c]));
        const l = i.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", i.skin);
        return Promise.all([r, Promise.all(a), l]).then(function(c) {
            const h = c[0],
                u = c[1],
                d = c[2];
            d !== null && h.traverse(function(f) {
                f.isSkinnedMesh && f.bind(d, lv)
            });
            for (let f = 0, p = u.length; f < p; f++) h.add(u[f]);
            if (h.userData.pivot !== void 0 && u.length > 0) {
                const f = h.userData.pivot,
                    p = u[0];
                h.pivot = new N().fromArray(f), h.position.x -= f[0], h.position.y -= f[1], h.position.z -= f[2], p.position.set(0, 0, 0), delete h.userData.pivot
            }
            return h
        })
    }
    _loadNodeShallow(e) {
        const t = this.json,
            n = this.extensions,
            i = this;
        if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
        const r = t.nodes[e],
            a = r.name ? i.createUniqueName(r.name) : "",
            o = [],
            l = i._invokeOne(function(c) {
                return c.createNodeMesh && c.createNodeMesh(e)
            });
        return l && o.push(l), r.camera !== void 0 && o.push(i.getDependency("camera", r.camera).then(function(c) {
            return i._getNodeRef(i.cameraCache, r.camera, c)
        })), i._invokeAll(function(c) {
            return c.createNodeAttachment && c.createNodeAttachment(e)
        }).forEach(function(c) {
            o.push(c)
        }), this.nodeCache[e] = Promise.all(o).then(function(c) {
            let h;
            if (r.isBone === !0 ? h = new Ho : c.length > 1 ? h = new ci : c.length === 1 ? h = c[0] : h = new gt, h !== c[0])
                for (let u = 0, d = c.length; u < d; u++) h.add(c[u]);
            if (r.name && (h.userData.name = r.name, h.name = a), gn(h, r), r.extensions && oi(n, h, r), r.matrix !== void 0) {
                const u = new We;
                u.fromArray(r.matrix), h.applyMatrix4(u)
            } else r.translation !== void 0 && h.position.fromArray(r.translation), r.rotation !== void 0 && h.quaternion.fromArray(r.rotation), r.scale !== void 0 && h.scale.fromArray(r.scale);
            if (!i.associations.has(h)) i.associations.set(h, {});
            else if (r.mesh !== void 0 && i.meshCache.refs[r.mesh] > 1) {
                const u = i.associations.get(h);
                i.associations.set(h, {
                    ...u
                })
            }
            return i.associations.get(h).nodes = e, h
        }), this.nodeCache[e]
    }
    loadScene(e) {
        const t = this.extensions,
            n = this.json.scenes[e],
            i = this,
            r = new ci;
        n.name && (r.name = i.createUniqueName(n.name)), gn(r, n), n.extensions && oi(t, r, n);
        const a = n.nodes || [],
            o = [];
        for (let l = 0, c = a.length; l < c; l++) o.push(i.getDependency("node", a[l]));
        return Promise.all(o).then(function(l) {
            for (let h = 0, u = l.length; h < u; h++) {
                const d = l[h];
                d.parent !== null ? r.add(uu(d)) : r.add(d)
            }
            const c = h => {
                const u = new Map;
                for (const [d, f] of i.associations)(d instanceof Zt || d instanceof vt) && u.set(d, f);
                return h.traverse(d => {
                    const f = i.associations.get(d);
                    f != null && u.set(d, f)
                }), u
            };
            return i.associations = c(r), r
        })
    }
    _createAnimationTracks(e, t, n, i, r) {
        const a = [],
            o = e.name ? e.name : e.uuid,
            l = [];

        function c(f) {
            f.morphTargetInfluences && l.push(f.name ? f.name : f.uuid)
        }
        Wn[r.path] === Wn.weights ? (c(e), e.isGroup && e.children.forEach(c)) : l.push(o);
        let h;
        switch (Wn[r.path]) {
            case Wn.weights:
                h = Ps;
                break;
            case Wn.rotation:
                h = Is;
                break;
            case Wn.translation:
            case Wn.scale:
                h = Pr;
                break;
            default:
                switch (n.itemSize) {
                    case 1:
                        h = Ps;
                        break;
                    case 2:
                    case 3:
                    default:
                        h = Pr;
                        break
                }
                break
        }
        const u = i.interpolation !== void 0 ? nv[i.interpolation] : Ts,
            d = this._getArrayFromAccessor(n);
        for (let f = 0, p = l.length; f < p; f++) {
            const x = new h(l[f] + "." + Wn[r.path], t.array, d, u);
            i.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(x), a.push(x)
        }
        return a
    }
    _getArrayFromAccessor(e) {
        let t = e.array;
        if (e.normalized) {
            const n = bo(t.constructor),
                i = new Float32Array(t.length);
            for (let r = 0, a = t.length; r < a; r++) i[r] = t[r] * n;
            t = i
        }
        return t
    }
    _createCubicSplineTrackInterpolant(e) {
        e.createInterpolant = function(n) {
            const i = this instanceof Is ? tv : pu;
            return new i(this.times, this.values, this.getValueSize() / 3, n)
        }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0
    }
}

