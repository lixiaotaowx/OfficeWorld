class ye extends M {
    constructor(e, t) {
        var s;
        super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (t = e, e = void 0), t = t || {}, t.path = t.path || "/socket.io", this.opts = t, ce(this, t), this.reconnection(t.reconnection !== !1), this.reconnectionAttempts(t.reconnectionAttempts || 1 / 0), this.reconnectionDelay(t.reconnectionDelay || 1e3), this.reconnectionDelayMax(t.reconnectionDelayMax || 5e3), this.randomizationFactor((s = t.randomizationFactor) !== null && s !== void 0 ? s : .5), this.backoff = new X({
            min: this.reconnectionDelay(),
            max: this.reconnectionDelayMax(),
            jitter: this.randomizationFactor()
        }), this.timeout(t.timeout == null ? 2e4 : t.timeout), this._readyState = "closed", this.uri = e;
        const r = t.parser || _n;
        this.encoder = new r.Encoder, this.decoder = new r.Decoder, this._autoConnect = t.autoConnect !== !1, this._autoConnect && this.open()
    }
    reconnection(e) {
        return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection
    }
    reconnectionAttempts(e) {
        return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this)
    }
    reconnectionDelay(e) {
        var t;
        return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (t = this.backoff) === null || t === void 0 || t.setMin(e), this)
    }
    randomizationFactor(e) {
        var t;
        return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (t = this.backoff) === null || t === void 0 || t.setJitter(e), this)
    }
    reconnectionDelayMax(e) {
        var t;
        return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (t = this.backoff) === null || t === void 0 || t.setMax(e), this)
    }
    timeout(e) {
        return arguments.length ? (this._timeout = e, this) : this._timeout
    }
    maybeReconnectOnOpen() {
        !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect()
    }
    open(e) {
        if (~this._readyState.indexOf("open")) return this;
        this.engine = new hn(this.uri, this.opts);
        const t = this.engine,
            s = this;
        this._readyState = "opening", this.skipReconnect = !1;
        const r = z(t, "open", function() {
                s.onopen(), e && e()
            }),
            i = a => {
                this.cleanup(), this._readyState = "closed", this.emitReserved("error", a), e ? e(a) : this.maybeReconnectOnOpen()
            },
            o = z(t, "error", i);
        if (this._timeout !== !1) {
            const a = this._timeout,
                f = this.setTimeoutFn(() => {
                    r(), i(new Error("timeout")), t.close()
                }, a);
            this.opts.autoUnref && f.unref(), this.subs.push(() => {
                this.clearTimeoutFn(f)
            })
        }
        return this.subs.push(r), this.subs.push(o), this
    }
    connect(e) {
        return this.open(e)
    }
    onopen() {
        this.cleanup(), this._readyState = "open", this.emitReserved("open");
        const e = this.engine;
        this.subs.push(z(e, "ping", this.onping.bind(this)), z(e, "data", this.ondata.bind(this)), z(e, "error", this.onerror.bind(this)), z(e, "close", this.onclose.bind(this)), z(this.decoder, "decoded", this.ondecoded.bind(this)))
    }
    onping() {
        this.emitReserved("ping")
    }
    ondata(e) {
        try {
            this.decoder.add(e)
        } catch (t) {
            this.onclose("parse error", t)
        }
    }
    ondecoded(e) {
        ae(() => {
            this.emitReserved("packet", e)
        }, this.setTimeoutFn)
    }
    onerror(e) {
        this.emitReserved("error", e)
    }
    socket(e, t) {
        let s = this.nsps[e];
        return s ? this._autoConnect && !s.active && s.connect() : (s = new Je(this, e, t), this.nsps[e] = s), s
    }
    _destroy(e) {
        const t = Object.keys(this.nsps);
        for (const s of t)
            if (this.nsps[s].active) return;
        this._close()
    }
    _packet(e) {
        const t = this.encoder.encode(e);
        for (let s = 0; s < t.length; s++) this.engine.write(t[s], e.options)
    }
    cleanup() {
        this.subs.forEach(e => e()), this.subs.length = 0, this.decoder.destroy()
    }
    _close() {
        this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close")
    }
    disconnect() {
        return this._close()
    }
    onclose(e, t) {
        var s;
        this.cleanup(), (s = this.engine) === null || s === void 0 || s.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, t), this._reconnection && !this.skipReconnect && this.reconnect()
    }
    reconnect() {
        if (this._reconnecting || this.skipReconnect) return this;
        const e = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
        else {
            const t = this.backoff.duration();
            this._reconnecting = !0;
            const s = this.setTimeoutFn(() => {
                e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open(r => {
                    r ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", r)) : e.onreconnect()
                }))
            }, t);
            this.opts.autoUnref && s.unref(), this.subs.push(() => {
                this.clearTimeoutFn(s)
            })
        }
    }
    onreconnect() {
        const e = this.backoff.attempts;
        this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e)
    }
}
