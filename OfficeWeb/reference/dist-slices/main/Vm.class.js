class Vm {
    constructor(e) {
        this._map = new Map, this._lastCleanup = 0, this.ttl = e
    }
    set(e, t) {
        const n = Date.now();
        n - this._lastCleanup > this.ttl / 2 && this.cleanup();
        const s = n + this.ttl;
        return this._map.set(e, {
            value: t,
            expiresAt: s
        }), this
    }
    get(e) {
        const t = this._map.get(e);
        if (t) {
            if (t.expiresAt < Date.now()) {
                this._map.delete(e);
                return
            }
            return t.value
        }
    }
    has(e) {
        const t = this._map.get(e);
        return t ? t.expiresAt < Date.now() ? (this._map.delete(e), !1) : !0 : !1
    }
    delete(e) {
        return this._map.delete(e)
    }
    clear() {
        this._map.clear()
    }
    cleanup() {
        const e = Date.now();
        for (const [t, n] of this._map.entries()) n.expiresAt < e && this._map.delete(t);
        this._lastCleanup = e
    }
    get size() {
        return this.cleanup(), this._map.size
    }
    forEach(e) {
        this.cleanup();
        for (const [t, n] of this._map.entries()) n.expiresAt >= Date.now() && e(n.value, t, this.asValueMap())
    }
    map(e) {
        this.cleanup();
        const t = [],
            n = this.asValueMap();
        for (const [s, r] of n.entries()) t.push(e(r, s, n));
        return t
    }
    asValueMap() {
        const e = new Map;
        for (const [t, n] of this._map.entries()) n.expiresAt >= Date.now() && e.set(t, n.value);
        return e
    }
}
var Fe = {},
    Rn = {},
    _n = {
        exports: {}
    },
    co;

