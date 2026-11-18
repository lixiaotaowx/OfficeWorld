class Lx extends pi {
    constructor(e) {
        super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
            return new Ux(t)
        }), this.register(function(t) {
            return new Fx(t)
        }), this.register(function(t) {
            return new Ox(t)
        }), this.register(function(t) {
            return new qx(t)
        }), this.register(function(t) {
            return new Yx(t)
        }), this.register(function(t) {
            return new Kx(t)
        }), this.register(function(t) {
            return new zx(t)
        }), this.register(function(t) {
            return new kx(t)
        }), this.register(function(t) {
            return new Hx(t)
        }), this.register(function(t) {
            return new Gx(t)
        }), this.register(function(t) {
            return new Dx(t)
        }), this.register(function(t) {
            return new Vx(t)
        }), this.register(function(t) {
            return new Bx(t)
        }), this.register(function(t) {
            return new Xx(t)
        }), this.register(function(t) {
            return new Wx(t)
        }), this.register(function(t) {
            return new Ix(t)
        }), this.register(function(t) {
            return new Wc(t, Ze.EXT_MESHOPT_COMPRESSION)
        }), this.register(function(t) {
            return new Wc(t, Ze.KHR_MESHOPT_COMPRESSION)
        }), this.register(function(t) {
            return new Jx(t)
        })
    }
    load(e, t, n, i) {
        const r = this;
        let a;
        if (this.resourcePath !== "") a = this.resourcePath;
        else if (this.path !== "") {
            const c = Zn.extractUrlBase(e);
            a = Zn.resolveURL(c, this.path)
        } else a = Zn.extractUrlBase(e);
        this.manager.itemStart(e);
        const o = function(c) {
                i ? i(c) : console.error(c), r.manager.itemError(e), r.manager.itemEnd(e)
            },
            l = new Ir(this.manager);
        l.setPriority(this.priority), l.setCache(this.cache), l.setPath(this.path), l.setResponseType("arraybuffer"), l.setRequestHeader(this.requestHeader), l.setWithCredentials(this.withCredentials), l.load(e, function(c) {
            try {
                r.parse(c, a, function(h) {
                    t(h), r.manager.itemEnd(e)
                }, o)
            } catch (h) {
                o(h)
            }
        }, n, o)
    }
    setDRACOLoader(e) {
        return this.dracoLoader = e, this
    }
    setKTX2Loader(e) {
        return this.ktx2Loader = e, this
    }
    setMeshoptDecoder(e) {
        return this.meshoptDecoder = e, this
    }
    register(e) {
        return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this
    }
    unregister(e) {
        return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this
    }
    parse(e, t, n, i) {
        let r;
        const a = {},
            o = {},
            l = new TextDecoder;
        if (typeof e == "string") r = JSON.parse(e);
        else if (e instanceof ArrayBuffer)
            if (l.decode(new Uint8Array(e, 0, 4)) === fu) {
                try {
                    a[Ze.KHR_BINARY_GLTF] = new Zx(e)
                } catch (u) {
                    i && i(u);
                    return
                }
                r = JSON.parse(a[Ze.KHR_BINARY_GLTF].content)
            } else r = JSON.parse(l.decode(e));
        else r = e;
        if (r.asset === void 0 || r.asset.version[0] < 2) {
            i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
            return
        }
        const c = new cv(r, {
            path: t || this.resourcePath || "",
            crossOrigin: this.crossOrigin,
            priority: this.priority,
            cache: this.cache,
            withCredentials: this.withCredentials,
            requestHeader: this.requestHeader,
            manager: this.manager,
            ktx2Loader: this.ktx2Loader,
            meshoptDecoder: this.meshoptDecoder
        });
        c.fileLoader.setRequestHeader(this.requestHeader);
        for (let h = 0; h < this.pluginCallbacks.length; h++) {
            const u = this.pluginCallbacks[h](c);
            u.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[u.name] = u, a[u.name] = !0
        }
        if (r.extensionsUsed)
            for (let h = 0; h < r.extensionsUsed.length; ++h) {
                const u = r.extensionsUsed[h],
                    d = r.extensionsRequired || [];
                switch (u) {
                    case Ze.KHR_MATERIALS_UNLIT:
                        a[u] = new Nx;
                        break;
                    case Ze.KHR_DRACO_MESH_COMPRESSION:
                        a[u] = new $x(r, this.dracoLoader);
                        break;
                    case Ze.KHR_TEXTURE_TRANSFORM:
                        a[u] = new Qx;
                        break;
                    case Ze.KHR_MESH_QUANTIZATION:
                        a[u] = new jx;
                        break;
                    default:
                        d.indexOf(u) >= 0 && o[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".')
                }
            }
        c.setExtensions(a), c.setPlugins(o), c.parse(n, i)
    }
    parseAsync(e, t) {
        const n = this;
        return new Promise(function(i, r) {
            n.parse(e, t, i, r)
        })
    }
}

