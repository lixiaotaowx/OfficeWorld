class gp extends pi {
    constructor(e) {
        super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && Ce("ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && Ce("ImageBitmapLoader: fetch() not supported."), this.options = {
            premultiplyAlpha: "none"
        }, this._abortController = new AbortController
    }
    setOptions(e) {
        return this.options = e, this
    }
    load(e, t, n, i) {
        e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
        const r = this,
            a = Dn.get(`image-bitmap:${e}`);
        if (a !== void 0) {
            if (r.manager.itemStart(e), a.then) {
                a.then(c => {
                    Ma.has(a) === !0 ? (i && i(Ma.get(a)), r.manager.itemError(e), r.manager.itemEnd(e)) : (t && t(c), r.manager.itemEnd(e))
                });
                return
            }
            setTimeout(function() {
                t && t(a), r.manager.itemEnd(e)
            }, 0);
            return
        }
        const o = {};
        o.credentials = this.withCredentials || this.crossOrigin !== "anonymous" ? "include" : "same-origin", o.headers = this.requestHeader, o.priority = this.priority, o.cache = this.cache, o.signal = typeof AbortSignal.any == "function" ? AbortSignal.any([this._abortController.signal, this.manager.abortController.signal]) : this._abortController.signal;
        const l = fetch(e, o).then(function(c) {
            return c.blob()
        }).then(function(c) {
            return createImageBitmap(c, Object.assign({}, r.options, {
                colorSpaceConversion: "none"
            }))
        }).then(function(c) {
            return Dn.add(`image-bitmap:${e}`, c), t && t(c), r.manager.itemEnd(e), c
        }).catch(function(c) {
            i && i(c), Ma.set(l, c), Dn.remove(`image-bitmap:${e}`), r.manager.itemError(e), r.manager.itemEnd(e)
        });
        Dn.add(`image-bitmap:${e}`, l), r.manager.itemStart(e)
    }
    abort() {
        return this._abortController.abort(), this._abortController = new AbortController, this
    }
}
