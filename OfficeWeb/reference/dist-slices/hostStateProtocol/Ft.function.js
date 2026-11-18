function Ft(n) {
    for (var e in M.prototype) n[e] = M.prototype[e];
    return n
}
M.prototype.on = M.prototype.addEventListener = function(n, e) {
    return this._callbacks = this._callbacks || {}, (this._callbacks["$" + n] = this._callbacks["$" + n] || []).push(e), this
};
M.prototype.once = function(n, e) {
    function t() {
        this.off(n, t), e.apply(this, arguments)
    }
    return t.fn = e, this.on(n, t), this
};
M.prototype.off = M.prototype.removeListener = M.prototype.removeAllListeners = M.prototype.removeEventListener = function(n, e) {
    if (this._callbacks = this._callbacks || {}, arguments.length == 0) return this._callbacks = {}, this;
    var t = this._callbacks["$" + n];
    if (!t) return this;
    if (arguments.length == 1) return delete this._callbacks["$" + n], this;
    for (var s, r = 0; r < t.length; r++)
        if (s = t[r], s === e || s.fn === e) {
            t.splice(r, 1);
            break
        } return t.length === 0 && delete this._callbacks["$" + n], this
};
M.prototype.emit = function(n) {
    this._callbacks = this._callbacks || {};
    for (var e = new Array(arguments.length - 1), t = this._callbacks["$" + n], s = 1; s < arguments.length; s++) e[s - 1] = arguments[s];
    if (t) {
        t = t.slice(0);
        for (var s = 0, r = t.length; s < r; ++s) t[s].apply(this, e)
    }
    return this
};
M.prototype.emitReserved = M.prototype.emit;
M.prototype.listeners = function(n) {
    return this._callbacks = this._callbacks || {}, this._callbacks["$" + n] || []
};
M.prototype.hasListeners = function(n) {
    return !!this.listeners(n).length
};
