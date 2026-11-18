class x extends M {
    constructor(e, t, s) {
        super(), this.createRequest = e, ce(this, s), this._opts = s, this._method = s.method || "GET", this._uri = t, this._data = s.data !== void 0 ? s.data : null, this._create()
    }
    _create() {
        var e;
        const t = He(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        t.xdomain = !!this._opts.xd;
        const s = this._xhr = this.createRequest(t);
        try {
            s.open(this._method, this._uri, !0);
            try {
                if (this._opts.extraHeaders) {
                    s.setDisableHeaderCheck && s.setDisableHeaderCheck(!0);
                    for (let r in this._opts.extraHeaders) this._opts.extraHeaders.hasOwnProperty(r) && s.setRequestHeader(r, this._opts.extraHeaders[r])
                }
            } catch {}
            if (this._method === "POST") try {
                s.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
            } catch {}
            try {
                s.setRequestHeader("Accept", "*/*")
            } catch {}(e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(s), "withCredentials" in s && (s.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (s.timeout = this._opts.requestTimeout), s.onreadystatechange = () => {
                var r;
                s.readyState === 3 && ((r = this._opts.cookieJar) === null || r === void 0 || r.parseCookies(s.getResponseHeader("set-cookie"))), s.readyState === 4 && (s.status === 200 || s.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
                    this._onError(typeof s.status == "number" ? s.status : 0)
                }, 0))
            }, s.send(this._data)
        } catch (r) {
            this.setTimeoutFn(() => {
                this._onError(r)
            }, 0);
            return
        }
        typeof document < "u" && (this._index = x.requestsCount++, x.requests[this._index] = this)
    }
    _onError(e) {
        this.emitReserved("error", e, this._xhr), this._cleanup(!0)
    }
    _cleanup(e) {
        if (!(typeof this._xhr > "u" || this._xhr === null)) {
            if (this._xhr.onreadystatechange = Jt, e) try {
                this._xhr.abort()
            } catch {}
            typeof document < "u" && delete x.requests[this._index], this._xhr = null
        }
    }
    _onLoad() {
        const e = this._xhr.responseText;
        e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup())
    }
    abort() {
        this._cleanup()
    }
}
x.requestsCount = 0;
x.requests = {};
if (typeof document < "u") {
    if (typeof attachEvent == "function") attachEvent("onunload", Ie);
    else if (typeof addEventListener == "function") {
        const n = "onpagehide" in U ? "pagehide" : "unload";
        addEventListener(n, Ie, !1)
    }
}

