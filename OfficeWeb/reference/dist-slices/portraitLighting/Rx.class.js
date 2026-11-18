class Rx extends pi {
    constructor(e) {
        super(e), this.decoderPaths = {
            js: Ax,
            wasm: bx,
            dep_js: wx
        }, this.decoderConfig = {}, this.decoderBinary = null, this.decoderPending = null, this.workerLimit = 4, this.workerPool = [], this.workerNextTaskID = 1, this.workerSourceURL = "", this.defaultAttributeIDs = {
            position: "POSITION",
            normal: "NORMAL",
            color: "COLOR",
            uv: "TEX_COORD"
        }, this.defaultAttributeTypes = {
            position: "Float32Array",
            normal: "Float32Array",
            color: "Float32Array",
            uv: "Float32Array"
        }
    }
    setDecoderPath(e) {
        const {
            decoderPaths: t
        } = this;
        return typeof e == "object" ? (t.js = e.js, t.wasm = e.wasm, t.dep_js = null) : (t.js = Zn.resolveURL("draco_wasm_wrapper.js", e), t.wasm = Zn.resolveURL("draco_decoder.wasm", e), t.dep_js = Zn.resolveURL("draco_decoder.js", e)), this
    }
    setDecoderConfig(e) {
        return console.warn("THREE.DRACOLoader: setDecoderConfig to has been deprecated and will be removed in r194."), this.decoderConfig = e, this
    }
    setWorkerLimit(e) {
        return this.workerLimit = e, this
    }
    load(e, t, n, i) {
        const r = new Ir(this.manager);
        r.setPriority(this.priority), r.setCache(this.cache), r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, a => {
            this.parse(a, t, i)
        }, n, i)
    }
    parse(e, t, n = () => {}) {
        this.decodeDracoFile(e, t, null, null, bt, n).catch(n)
    }
    decodeDracoFile(e, t, n, i, r = Xt, a = () => {}) {
        const o = {
            attributeIDs: n || this.defaultAttributeIDs,
            attributeTypes: i || this.defaultAttributeTypes,
            useUniqueIDs: !!n,
            vertexColorSpace: r
        };
        return this.decodeGeometry(e, o).then(t).catch(a)
    }
    decodeGeometry(e, t) {
        const n = JSON.stringify(t);
        if (Ta.has(e)) {
            const l = Ta.get(e);
            if (l.key === n) return l.promise;
            if (e.byteLength === 0) throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")
        }
        let i;
        const r = this.workerNextTaskID++,
            a = e.byteLength,
            o = this._getWorker(r, a).then(l => (i = l, new Promise((c, h) => {
                i._callbacks[r] = {
                    resolve: c,
                    reject: h
                }, i.postMessage({
                    type: "decode",
                    id: r,
                    taskConfig: t,
                    buffer: e
                }, [e])
            }))).then(l => this._createGeometry(l.geometry));
        return o.catch(() => !0).then(() => {
            i && r && this._releaseTask(i, r)
        }), Ta.set(e, {
            key: n,
            promise: o
        }), o
    }
    _createGeometry(e) {
        const t = new wt;
        e.index && t.setIndex(new Ft(e.index.array, 1));
        for (let n = 0; n < e.attributes.length; n++) {
            const {
                name: i,
                array: r,
                itemSize: a,
                stride: o,
                vertexColorSpace: l
            } = e.attributes[n];
            let c;
            if (a === o) c = new Ft(r, a);
            else {
                const h = new bh(r, o);
                c = new Or(h, a, 0)
            }
            i === "color" && (this._assignVertexColorSpace(c, l), c.normalized = !(r instanceof Float32Array)), t.setAttribute(i, c)
        }
        return t
    }
    _assignVertexColorSpace(e, t) {
        if (t !== bt) return;
        const n = new Fe;
        for (let i = 0, r = e.count; i < r; i++) n.fromBufferAttribute(e, i), Qe.colorSpaceToWorking(n, bt), e.setXYZ(i, n.r, n.g, n.b)
    }
    _loadLibrary(e, t) {
        const n = new Ir(this.manager);
        return n.setPriority(this.priority), n.setCache(this.cache), n.setResponseType(t), n.setWithCredentials(this.withCredentials), new Promise((i, r) => {
            n.load(e, i, void 0, r)
        })
    }
    preload() {
        return this._initDecoder(), this
    }
    _initDecoder() {
        if (this.decoderPending) return this.decoderPending;
        const e = typeof WebAssembly != "object" || this.decoderConfig.type === "js",
            t = [],
            {
                decoderPaths: n
            } = this;
        if (e) {
            if (n.dep_js === null) throw new Error("THREE.DRACOLoader: WebAssembly is required when using a custom decoder paths.");
            t.push(this._loadLibrary(n.dep_js, "text"))
        } else t.push(this._loadLibrary(n.js, "text")), t.push(this._loadLibrary(n.wasm, "arraybuffer"));
        return this.decoderPending = Promise.all(t).then(i => {
            const r = i[0];
            e || (this.decoderConfig.wasmBinary = i[1]);
            const a = Cx.toString(),
                o = ["/* draco decoder */", r, "", "/* worker */", a.substring(a.indexOf("{") + 1, a.lastIndexOf("}"))].join(`
`);
            this.workerSourceURL = URL.createObjectURL(new Blob([o]))
        }), this.decoderPending
    }
    _getWorker(e, t) {
        return this._initDecoder().then(() => {
            if (this.workerPool.length < this.workerLimit) {
                const i = new Worker(this.workerSourceURL);
                i._callbacks = {}, i._taskCosts = {}, i._taskLoad = 0, i.postMessage({
                    type: "init",
                    decoderConfig: this.decoderConfig
                }), i.onmessage = function(r) {
                    const a = r.data;
                    switch (a.type) {
                        case "decode":
                            i._callbacks[a.id].resolve(a);
                            break;
                        case "error":
                            i._callbacks[a.id].reject(a);
                            break;
                        default:
                            console.error('THREE.DRACOLoader: Unexpected message, "' + a.type + '"')
                    }
                }, this.workerPool.push(i)
            } else this.workerPool.sort(function(i, r) {
                return i._taskLoad > r._taskLoad ? -1 : 1
            });
            const n = this.workerPool[this.workerPool.length - 1];
            return n._taskCosts[e] = t, n._taskLoad += t, n
        })
    }
    _releaseTask(e, t) {
        e._taskLoad -= e._taskCosts[t], delete e._callbacks[t], delete e._taskCosts[t]
    }
    debug() {
        console.log("Task load: ", this.workerPool.map(e => e._taskLoad))
    }
    dispose() {
        for (let e = 0; e < this.workerPool.length; ++e) this.workerPool[e].terminate();
        return this.workerPool.length = 0, this.workerSourceURL !== "" && URL.revokeObjectURL(this.workerSourceURL), this
    }
}

