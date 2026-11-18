class Le {
    get isResolved() {
        return this._isResolved
    }
    constructor(e, t) {
        this._isResolved = !1, this.onFinally = t, this.promise = new Promise((n, s) => b(this, void 0, void 0, function*() {
            this.resolve = n, this.reject = s, e && (yield e(n, s))
        })).finally(() => {
            var n;
            this._isResolved = !0, (n = this.onFinally) === null || n === void 0 || n.call(this)
        })
    }
}

