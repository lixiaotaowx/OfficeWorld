function Nt(i, e, t) {
    if (!i.RTCPeerConnection) return;
    const n = i.RTCPeerConnection.prototype,
        s = n.addEventListener;
    n.addEventListener = function(a, o) {
        if (a !== e) return s.apply(this, arguments);
        const c = d => {
            const l = t(d);
            l && (o.handleEvent ? o.handleEvent(l) : o(l))
        };
        return this._eventMap = this._eventMap || {}, this._eventMap[e] || (this._eventMap[e] = new Map), this._eventMap[e].set(o, c), s.apply(this, [a, c])
    };
    const r = n.removeEventListener;
    n.removeEventListener = function(a, o) {
        if (a !== e || !this._eventMap || !this._eventMap[e]) return r.apply(this, arguments);
        if (!this._eventMap[e].has(o)) return r.apply(this, arguments);
        const c = this._eventMap[e].get(o);
        return this._eventMap[e].delete(o), this._eventMap[e].size === 0 && delete this._eventMap[e], Object.keys(this._eventMap).length === 0 && delete this._eventMap, r.apply(this, [a, c])
    }, Object.defineProperty(n, "on" + e, {
        get() {
            return this["_on" + e]
        },
        set(a) {
            this["_on" + e] && (this.removeEventListener(e, this["_on" + e]), delete this["_on" + e]), a && this.addEventListener(e, this["_on" + e] = a)
        },
        enumerable: !0,
        configurable: !0
    })
}

