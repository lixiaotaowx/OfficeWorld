function Ch() {
    return Nr || (Nr = 1, function(i) {
        (function(e, t) {
            i.exports ? i.exports = t() : e.log = t()
        })(Th, function() {
            var e = function() {},
                t = "undefined",
                n = typeof window !== t && typeof window.navigator !== t && /Trident\/|MSIE /.test(window.navigator.userAgent),
                s = ["trace", "debug", "info", "warn", "error"],
                r = {},
                a = null;

            function o(p, _) {
                var w = p[_];
                if (typeof w.bind == "function") return w.bind(p);
                try {
                    return Function.prototype.bind.call(w, p)
                } catch {
                    return function() {
                        return Function.prototype.apply.apply(w, [p, arguments])
                    }
                }
            }

            function c() {
                console.log && (console.log.apply ? console.log.apply(console, arguments) : Function.prototype.apply.apply(console.log, [console, arguments])), console.trace && console.trace()
            }

            function d(p) {
                return p === "debug" && (p = "log"), typeof console === t ? !1 : p === "trace" && n ? c : console[p] !== void 0 ? o(console, p) : console.log !== void 0 ? o(console, "log") : e
            }

            function l() {
                for (var p = this.getLevel(), _ = 0; _ < s.length; _++) {
                    var w = s[_];
                    this[w] = _ < p ? e : this.methodFactory(w, p, this.name)
                }
                if (this.log = this.debug, typeof console === t && p < this.levels.SILENT) return "No console available for logging"
            }

            function u(p) {
                return function() {
                    typeof console !== t && (l.call(this), this[p].apply(this, arguments))
                }
            }

            function h(p, _, w) {
                return d(p) || u.apply(this, arguments)
            }

            function m(p, _) {
                var w = this,
                    k, P, y, S = "loglevel";
                typeof p == "string" ? S += ":" + p : typeof p == "symbol" && (S = void 0);

                function E(g) {
                    var T = (s[g] || "silent").toUpperCase();
                    if (!(typeof window === t || !S)) {
                        try {
                            window.localStorage[S] = T;
                            return
                        } catch {}
                        try {
                            window.document.cookie = encodeURIComponent(S) + "=" + T + ";"
                        } catch {}
                    }
                }

                function x() {
                    var g;
                    if (!(typeof window === t || !S)) {
                        try {
                            g = window.localStorage[S]
                        } catch {}
                        if (typeof g === t) try {
                            var T = window.document.cookie,
                                A = encodeURIComponent(S),
                                F = T.indexOf(A + "=");
                            F !== -1 && (g = /^([^;]+)/.exec(T.slice(F + A.length + 1))[1])
                        } catch {}
                        return w.levels[g] === void 0 && (g = void 0), g
                    }
                }

                function D() {
                    if (!(typeof window === t || !S)) {
                        try {
                            window.localStorage.removeItem(S)
                        } catch {}
                        try {
                            window.document.cookie = encodeURIComponent(S) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC"
                        } catch {}
                    }
                }

                function C(g) {
                    var T = g;
                    if (typeof T == "string" && w.levels[T.toUpperCase()] !== void 0 && (T = w.levels[T.toUpperCase()]), typeof T == "number" && T >= 0 && T <= w.levels.SILENT) return T;
                    throw new TypeError("log.setLevel() called with invalid level: " + g)
                }
                w.name = p, w.levels = {
                    TRACE: 0,
                    DEBUG: 1,
                    INFO: 2,
                    WARN: 3,
                    ERROR: 4,
                    SILENT: 5
                }, w.methodFactory = _ || h, w.getLevel = function() {
                    return y ?? P ?? k
                }, w.setLevel = function(g, T) {
                    return y = C(g), T !== !1 && E(y), l.call(w)
                }, w.setDefaultLevel = function(g) {
                    P = C(g), x() || w.setLevel(g, !1)
                }, w.resetLevel = function() {
                    y = null, D(), l.call(w)
                }, w.enableAll = function(g) {
                    w.setLevel(w.levels.TRACE, g)
                }, w.disableAll = function(g) {
                    w.setLevel(w.levels.SILENT, g)
                }, w.rebuild = function() {
                    if (a !== w && (k = C(a.getLevel())), l.call(w), a === w)
                        for (var g in r) r[g].rebuild()
                }, k = C(a ? a.getLevel() : "WARN");
                var M = x();
                M != null && (y = C(M)), l.call(w)
            }
            a = new m, a.getLogger = function(_) {
                if (typeof _ != "symbol" && typeof _ != "string" || _ === "") throw new TypeError("You must supply a name when creating a logger.");
                var w = r[_];
                return w || (w = r[_] = new m(_, a.methodFactory)), w
            };
            var f = typeof window !== t ? window.log : void 0;
            return a.noConflict = function() {
                return typeof window !== t && window.log === a && (window.log = f), a
            }, a.getLoggers = function() {
                return r
            }, a.default = a, a
        })
    }(Oi)), Oi.exports
}
var dn = Ch(),
    zn;
(function(i) {
    i[i.trace = 0] = "trace", i[i.debug = 1] = "debug", i[i.info = 2] = "info", i[i.warn = 3] = "warn", i[i.error = 4] = "error", i[i.silent = 5] = "silent"
})(zn || (zn = {}));
var Ue;
(function(i) {
    i.Default = "livekit", i.Room = "livekit-room", i.TokenSource = "livekit-token-source", i.Participant = "livekit-participant", i.Track = "livekit-track", i.Publication = "livekit-track-publication", i.Engine = "livekit-engine", i.Signal = "livekit-signal", i.PCManager = "livekit-pc-manager", i.PCTransport = "livekit-pc-transport", i.E2EE = "lk-e2ee", i.DataTracks = "livekit-data-tracks"
})(Ue || (Ue = {}));
let X = dn.getLogger("livekit");
Object.values(Ue).map(i => dn.getLogger(i));
X.setDefaultLevel(zn.info);

