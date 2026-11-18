class ap {
    constructor(e, t, n) {
        const i = this;
        let r = !1,
            a = 0,
            o = 0,
            l;
        const c = [];
        this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this._abortController = null, this.itemStart = function(h) {
            o++, r === !1 && i.onStart !== void 0 && i.onStart(h, a, o), r = !0
        }, this.itemEnd = function(h) {
            a++, i.onProgress !== void 0 && i.onProgress(h, a, o), a === o && (r = !1, i.onLoad !== void 0 && i.onLoad())
        }, this.itemError = function(h) {
            i.onError !== void 0 && i.onError(h)
        }, this.resolveURL = function(h) {
            return h = h.normalize("NFC"), l ? l(h) : h
        }, this.setURLModifier = function(h) {
            return l = h, this
        }, this.addHandler = function(h, u) {
            return c.push(h, u), this
        }, this.removeHandler = function(h) {
            const u = c.indexOf(h);
            return u !== -1 && c.splice(u, 2), this
        }, this.getHandler = function(h) {
            for (let u = 0, d = c.length; u < d; u += 2) {
                const f = c[u],
                    p = c[u + 1];
                if (f.global && (f.lastIndex = 0), f.test(h)) return p
            }
            return null
        }, this.abort = function() {
            return this.abortController.abort(), this._abortController = null, this
        }
    }
    get abortController() {
        return this._abortController || (this._abortController = new AbortController), this._abortController
    }
}
