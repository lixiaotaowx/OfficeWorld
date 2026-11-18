function qm() {
    return lo || (lo = 1, function(i) {
        var e = function(o) {
                return String(Number(o)) === o ? Number(o) : o
            },
            t = function(o, c, d, l) {
                if (l && !d) c[l] = e(o[1]);
                else
                    for (var u = 0; u < d.length; u += 1) o[u + 1] != null && (c[d[u]] = e(o[u + 1]))
            },
            n = function(o, c, d) {
                var l = o.name && o.names;
                o.push && !c[o.push] ? c[o.push] = [] : l && !c[o.name] && (c[o.name] = {});
                var u = o.push ? {} : l ? c[o.name] : c;
                t(d.match(o.reg), u, o.names, o.name), o.push && c[o.push].push(u)
            },
            s = Ks(),
            r = RegExp.prototype.test.bind(/^([a-z])=(.*)/);
        i.parse = function(o) {
            var c = {},
                d = [],
                l = c;
            return o.split(/(\r\n|\r|\n)/).filter(r).forEach(function(u) {
                var h = u[0],
                    m = u.slice(2);
                h === "m" && (d.push({
                    rtp: [],
                    fmtp: []
                }), l = d[d.length - 1]);
                for (var f = 0; f < (s[h] || []).length; f += 1) {
                    var p = s[h][f];
                    if (p.reg.test(m)) return n(p, l, m)
                }
            }), c.media = d, c
        };
        var a = function(o, c) {
            var d = c.split(/=(.+)/, 2);
            return d.length === 2 ? o[d[0]] = e(d[1]) : d.length === 1 && c.length > 1 && (o[d[0]] = void 0), o
        };
        i.parseParams = function(o) {
            return o.split(/;\s?/).reduce(a, {})
        }, i.parseFmtpConfig = i.parseParams, i.parsePayloads = function(o) {
            return o.toString().split(" ").map(Number)
        }, i.parseRemoteCandidates = function(o) {
            for (var c = [], d = o.split(" ").map(e), l = 0; l < d.length; l += 3) c.push({
                component: d[l],
                ip: d[l + 1],
                port: d[l + 2]
            });
            return c
        }, i.parseImageAttributes = function(o) {
            return o.split(" ").map(function(c) {
                return c.substring(1, c.length - 1).split(",").reduce(a, {})
            })
        }, i.parseSimulcastStreamList = function(o) {
            return o.split(";").map(function(c) {
                return c.split(",").map(function(d) {
                    var l, u = !1;
                    return d[0] !== "~" ? l = e(d) : (l = e(d.substring(1, d.length)), u = !0), {
                        scid: l,
                        paused: u
                    }
                })
            })
        }
    }(Rn)), Rn
}
var In, uo;

