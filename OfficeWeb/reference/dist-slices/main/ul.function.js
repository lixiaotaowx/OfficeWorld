function Ul(i, e) {
    return e.forEach(function(t) {
        t && typeof t != "string" && !Array.isArray(t) && Object.keys(t).forEach(function(n) {
            if (n !== "default" && !(n in i)) {
                var s = Object.getOwnPropertyDescriptor(t, n);
                Object.defineProperty(i, n, s.get ? s : {
                    enumerable: !0,
                    get: function() {
                        return t[n]
                    }
                })
            }
        })
    }), Object.freeze(i)
}
var jl = Object.defineProperty,
    Fl = (i, e, t) => e in i ? jl(i, e, {
        enumerable: !0,
        configurable: !0,
        writable: !0,
        value: t
    }) : i[e] = t,
    yr = (i, e, t) => Fl(i, typeof e != "symbol" ? e + "" : e, t);
