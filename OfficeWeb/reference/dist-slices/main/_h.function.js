function _h() {
    if (Ur) return Ci.exports;
    Ur = 1;
    var i = typeof Reflect == "object" ? Reflect : null,
        e = i && typeof i.apply == "function" ? i.apply : function(S, E, x) {
            return Function.prototype.apply.call(S, E, x)
        },
        t;
    i && typeof i.ownKeys == "function" ? t = i.ownKeys : Object.getOwnPropertySymbols ? t = function(S) {
        return Object.getOwnPropertyNames(S).concat(Object.getOwnPropertySymbols(S))
    } : t = function(S) {
        return Object.getOwnPropertyNames(S)
    };

    function n(y) {
        console && console.warn && console.warn(y)
    }
    var s = Number.isNaN || function(S) {
        return S !== S
    };

    function r() {
        r.init.call(this)
    }
    Ci.exports = r, Ci.exports.once = w, r.EventEmitter = r, r.prototype._events = void 0, r.prototype._eventsCount = 0, r.prototype._maxListeners = void 0;
    var a = 10;

    function o(y) {
        if (typeof y != "function") throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof y)
    }
    Object.defineProperty(r, "defaultMaxListeners", {
        enumerable: !0,
        get: function() {
            return a
        },
        set: function(y) {
            if (typeof y != "number" || y < 0 || s(y)) throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + y + ".");
            a = y
        }
    }), r.init = function() {
        (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) && (this._events = Object.create(null), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0
    }, r.prototype.setMaxListeners = function(S) {
        if (typeof S != "number" || S < 0 || s(S)) throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + S + ".");
        return this._maxListeners = S, this
    };

    function c(y) {
        return y._maxListeners === void 0 ? r.defaultMaxListeners : y._maxListeners
    }
    r.prototype.getMaxListeners = function() {
        return c(this)
    }, r.prototype.emit = function(S) {
        for (var E = [], x = 1; x < arguments.length; x++) E.push(arguments[x]);
        var D = S === "error",
            C = this._events;
        if (C !== void 0) D = D && C.error === void 0;
        else if (!D) return !1;
        if (D) {
            var M;
            if (E.length > 0 && (M = E[0]), M instanceof Error) throw M;
            var g = new Error("Unhandled error." + (M ? " (" + M.message + ")" : ""));
            throw g.context = M, g
        }
        var T = C[S];
        if (T === void 0) return !1;
        if (typeof T == "function") e(T, this, E);
        else
            for (var A = T.length, F = f(T, A), x = 0; x < A; ++x) e(F[x], this, E);
        return !0
    };

    function d(y, S, E, x) {
        var D, C, M;
        if (o(E), C = y._events, C === void 0 ? (C = y._events = Object.create(null), y._eventsCount = 0) : (C.newListener !== void 0 && (y.emit("newListener", S, E.listener ? E.listener : E), C = y._events), M = C[S]), M === void 0) M = C[S] = E, ++y._eventsCount;
        else if (typeof M == "function" ? M = C[S] = x ? [E, M] : [M, E] : x ? M.unshift(E) : M.push(E), D = c(y), D > 0 && M.length > D && !M.warned) {
            M.warned = !0;
            var g = new Error("Possible EventEmitter memory leak detected. " + M.length + " " + String(S) + " listeners added. Use emitter.setMaxListeners() to increase limit");
            g.name = "MaxListenersExceededWarning", g.emitter = y, g.type = S, g.count = M.length, n(g)
        }
        return y
    }
    r.prototype.addListener = function(S, E) {
        return d(this, S, E, !1)
    }, r.prototype.on = r.prototype.addListener, r.prototype.prependListener = function(S, E) {
        return d(this, S, E, !0)
    };

    function l() {
        if (!this.fired) return this.target.removeListener(this.type, this.wrapFn), this.fired = !0, arguments.length === 0 ? this.listener.call(this.target) : this.listener.apply(this.target, arguments)
    }

    function u(y, S, E) {
        var x = {
                fired: !1,
                wrapFn: void 0,
                target: y,
                type: S,
                listener: E
            },
            D = l.bind(x);
        return D.listener = E, x.wrapFn = D, D
    }
    r.prototype.once = function(S, E) {
        return o(E), this.on(S, u(this, S, E)), this
    }, r.prototype.prependOnceListener = function(S, E) {
        return o(E), this.prependListener(S, u(this, S, E)), this
    }, r.prototype.removeListener = function(S, E) {
        var x, D, C, M, g;
        if (o(E), D = this._events, D === void 0) return this;
        if (x = D[S], x === void 0) return this;
        if (x === E || x.listener === E) --this._eventsCount === 0 ? this._events = Object.create(null) : (delete D[S], D.removeListener && this.emit("removeListener", S, x.listener || E));
        else if (typeof x != "function") {
            for (C = -1, M = x.length - 1; M >= 0; M--)
                if (x[M] === E || x[M].listener === E) {
                    g = x[M].listener, C = M;
                    break
                } if (C < 0) return this;
            C === 0 ? x.shift() : p(x, C), x.length === 1 && (D[S] = x[0]), D.removeListener !== void 0 && this.emit("removeListener", S, g || E)
        }
        return this
    }, r.prototype.off = r.prototype.removeListener, r.prototype.removeAllListeners = function(S) {
        var E, x, D;
        if (x = this._events, x === void 0) return this;
        if (x.removeListener === void 0) return arguments.length === 0 ? (this._events = Object.create(null), this._eventsCount = 0) : x[S] !== void 0 && (--this._eventsCount === 0 ? this._events = Object.create(null) : delete x[S]), this;
        if (arguments.length === 0) {
            var C = Object.keys(x),
                M;
            for (D = 0; D < C.length; ++D) M = C[D], M !== "removeListener" && this.removeAllListeners(M);
            return this.removeAllListeners("removeListener"), this._events = Object.create(null), this._eventsCount = 0, this
        }
        if (E = x[S], typeof E == "function") this.removeListener(S, E);
        else if (E !== void 0)
            for (D = E.length - 1; D >= 0; D--) this.removeListener(S, E[D]);
        return this
    };

    function h(y, S, E) {
        var x = y._events;
        if (x === void 0) return [];
        var D = x[S];
        return D === void 0 ? [] : typeof D == "function" ? E ? [D.listener || D] : [D] : E ? _(D) : f(D, D.length)
    }
    r.prototype.listeners = function(S) {
        return h(this, S, !0)
    }, r.prototype.rawListeners = function(S) {
        return h(this, S, !1)
    }, r.listenerCount = function(y, S) {
        return typeof y.listenerCount == "function" ? y.listenerCount(S) : m.call(y, S)
    }, r.prototype.listenerCount = m;

    function m(y) {
        var S = this._events;
        if (S !== void 0) {
            var E = S[y];
            if (typeof E == "function") return 1;
            if (E !== void 0) return E.length
        }
        return 0
    }
    r.prototype.eventNames = function() {
        return this._eventsCount > 0 ? t(this._events) : []
    };

    function f(y, S) {
        for (var E = new Array(S), x = 0; x < S; ++x) E[x] = y[x];
        return E
    }

    function p(y, S) {
        for (; S + 1 < y.length; S++) y[S] = y[S + 1];
        y.pop()
    }

    function _(y) {
        for (var S = new Array(y.length), E = 0; E < S.length; ++E) S[E] = y[E].listener || y[E];
        return S
    }

    function w(y, S) {
        return new Promise(function(E, x) {
            function D(M) {
                y.removeListener(S, C), x(M)
            }

            function C() {
                typeof y.removeListener == "function" && y.removeListener("error", D), E([].slice.call(arguments))
            }
            P(y, S, C, {
                once: !0
            }), S !== "error" && k(y, D, {
                once: !0
            })
        })
    }

    function k(y, S, E) {
        typeof y.on == "function" && P(y, "error", S, E)
    }

    function P(y, S, E, x) {
        if (typeof y.on == "function") x.once ? y.once(S, E) : y.on(S, E);
        else if (typeof y.addEventListener == "function") y.addEventListener(S, function D(C) {
            x.once && y.removeEventListener(S, D), E(C)
        });
        else throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof y)
    }
    return Ci.exports
}
var et = _h();
let qa = !0,
    Wa = !0;

