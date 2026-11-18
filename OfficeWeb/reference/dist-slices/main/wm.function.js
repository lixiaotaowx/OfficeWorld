function Wm() {
    if (uo) return In;
    uo = 1;
    var i = Ks(),
        e = /%[sdv%]/g,
        t = function(a) {
            var o = 1,
                c = arguments,
                d = c.length;
            return a.replace(e, function(l) {
                if (o >= d) return l;
                var u = c[o];
                switch (o += 1, l) {
                    case "%%":
                        return "%";
                    case "%s":
                        return String(u);
                    case "%d":
                        return Number(u);
                    case "%v":
                        return ""
                }
            })
        },
        n = function(a, o, c) {
            var d = o.format instanceof Function ? o.format(o.push ? c : c[o.name]) : o.format,
                l = [a + "=" + d];
            if (o.names)
                for (var u = 0; u < o.names.length; u += 1) {
                    var h = o.names[u];
                    o.name ? l.push(c[o.name][h]) : l.push(c[o.names[u]])
                } else l.push(c[o.name]);
            return t.apply(null, l)
        },
        s = ["v", "o", "s", "i", "u", "e", "p", "c", "b", "t", "r", "z", "a"],
        r = ["i", "c", "b", "a"];
    return In = function(a, o) {
        o = o || {}, a.version == null && (a.version = 0), a.name == null && (a.name = " "), a.media.forEach(function(u) {
            u.payloads == null && (u.payloads = "")
        });
        var c = o.outerOrder || s,
            d = o.innerOrder || r,
            l = [];
        return c.forEach(function(u) {
            i[u].forEach(function(h) {
                h.name in a && a[h.name] != null ? l.push(n(u, h, a)) : h.push in a && a[h.push] != null && a[h.push].forEach(function(m) {
                    l.push(n(u, h, m))
                })
            })
        }), a.media.forEach(function(u) {
            l.push(n("m", i.m[0], u)), d.forEach(function(h) {
                i[h].forEach(function(m) {
                    m.name in u && u[m.name] != null ? l.push(n(h, m, u)) : m.push in u && u[m.push] != null && u[m.push].forEach(function(f) {
                        l.push(n(h, m, f))
                    })
                })
            })
        }), l.join(`\r
`) + `\r
`
    }, In
}
var ho;

