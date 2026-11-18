function Gs(i, e, t) {
    var n, s, r;
    e === void 0 && (e = 50), t === void 0 && (t = {});
    var a = (n = t.isImmediate) != null && n,
        o = (s = t.callback) != null && s,
        c = t.maxWait,
        d = Date.now(),
        l = [];

    function u() {
        if (c !== void 0) {
            var m = Date.now() - d;
            if (m + e >= c) return c - m
        }
        return e
    }
    var h = function() {
        var m = [].slice.call(arguments),
            f = this;
        return new Promise(function(p, _) {
            var w = a && r === void 0;
            if (r !== void 0 && clearTimeout(r), r = setTimeout(function() {
                    if (r = void 0, d = Date.now(), !a) {
                        var P = i.apply(f, m);
                        o && o(P), l.forEach(function(y) {
                            return (0, y.resolve)(P)
                        }), l = []
                    }
                }, u()), w) {
                var k = i.apply(f, m);
                return o && o(k), p(k)
            }
            l.push({
                resolve: p,
                reject: _
            })
        })
    };
    return h.cancel = function(m) {
        r !== void 0 && clearTimeout(r), l.forEach(function(f) {
            return (0, f.reject)(m)
        }), l = []
    }, h
}
