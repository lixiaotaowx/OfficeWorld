function Zf() {
    return Ma || (Ma = 1, function(p) {
        function S(C, j) {
            var a = C.length;
            C.push(j);
            e: for (; 0 < a;) {
                var y = a - 1 >>> 1,
                    T = C[y];
                if (0 < E(T, j)) C[y] = j, C[a] = T, a = y;
                else break e
            }
        }

        function f(C) {
            return C.length === 0 ? null : C[0]
        }

        function R(C) {
            if (C.length === 0) return null;
            var j = C[0],
                a = C.pop();
            if (a !== j) {
                C[0] = a;
                e: for (var y = 0, T = C.length, H = T >>> 1; y < H;) {
                    var $ = 2 * (y + 1) - 1,
                        b = C[$],
                        K = $ + 1,
                        J = C[K];
                    if (0 > E(b, a)) K < T && 0 > E(J, b) ? (C[y] = J, C[K] = a, y = K) : (C[y] = b, C[$] = a, y = $);
                    else if (K < T && 0 > E(J, a)) C[y] = J, C[K] = a, y = K;
                    else break e
                }
            }
            return j
        }

        function E(C, j) {
            var a = C.sortIndex - j.sortIndex;
            return a !== 0 ? a : C.id - j.id
        }
        if (typeof performance == "object" && typeof performance.now == "function") {
            var z = performance;
            p.unstable_now = function() {
                return z.now()
            }
        } else {
            var F = Date,
                O = F.now();
            p.unstable_now = function() {
                return F.now() - O
            }
        }
        var M = [],
            A = [],
            ae = 1,
            V = null,
            q = 3,
            Le = !1,
            He = !1,
            re = !1,
            Z = typeof setTimeout == "function" ? setTimeout : null,
            ht = typeof clearTimeout == "function" ? clearTimeout : null,
            it = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);

        function Je(C) {
            for (var j = f(A); j !== null;) {
                if (j.callback === null) R(A);
                else if (j.startTime <= C) R(A), j.sortIndex = j.expirationTime, S(M, j);
                else break;
                j = f(A)
            }
        }

        function ke(C) {
            if (re = !1, Je(C), !He)
                if (f(M) !== null) He = !0, Te(qe);
                else {
                    var j = f(A);
                    j !== null && ie(ke, j.startTime - C)
                }
        }

        function qe(C, j) {
            He = !1, re && (re = !1, ht(We), We = -1), Le = !0;
            var a = q;
            try {
                for (Je(j), V = f(M); V !== null && (!(V.expirationTime > j) || C && !Qt());) {
                    var y = V.callback;
                    if (typeof y == "function") {
                        V.callback = null, q = V.priorityLevel;
                        var T = y(V.expirationTime <= j);
                        j = p.unstable_now(), typeof T == "function" ? V.callback = T : V === f(M) && R(M), Je(j)
                    } else R(M);
                    V = f(M)
                }
                if (V !== null) var H = !0;
                else {
                    var $ = f(A);
                    $ !== null && ie(ke, $.startTime - j), H = !1
                }
                return H
            } finally {
                V = null, q = a, Le = !1
            }
        }
        var xe = !1,
            ze = null,
            We = -1,
            xt = 5,
            vt = -1;

        function Qt() {
            return !(p.unstable_now() - vt < xt)
        }

        function st() {
            if (ze !== null) {
                var C = p.unstable_now();
                vt = C;
                var j = !0;
                try {
                    j = ze(!0, C)
                } finally {
                    j ? Ue() : (xe = !1, ze = null)
                }
            } else xe = !1
        }
        var Ue;
        if (typeof it == "function") Ue = function() {
            it(st)
        };
        else if (typeof MessageChannel < "u") {
            var be = new MessageChannel,
                at = be.port2;
            be.port1.onmessage = st, Ue = function() {
                at.postMessage(null)
            }
        } else Ue = function() {
            Z(st, 0)
        };

        function Te(C) {
            ze = C, xe || (xe = !0, Ue())
        }

        function ie(C, j) {
            We = Z(function() {
                C(p.unstable_now())
            }, j)
        }
        p.unstable_IdlePriority = 5, p.unstable_ImmediatePriority = 1, p.unstable_LowPriority = 4, p.unstable_NormalPriority = 3, p.unstable_Profiling = null, p.unstable_UserBlockingPriority = 2, p.unstable_cancelCallback = function(C) {
            C.callback = null
        }, p.unstable_continueExecution = function() {
            He || Le || (He = !0, Te(qe))
        }, p.unstable_forceFrameRate = function(C) {
            0 > C || 125 < C ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : xt = 0 < C ? Math.floor(1e3 / C) : 5
        }, p.unstable_getCurrentPriorityLevel = function() {
            return q
        }, p.unstable_getFirstCallbackNode = function() {
            return f(M)
        }, p.unstable_next = function(C) {
            switch (q) {
                case 1:
                case 2:
                case 3:
                    var j = 3;
                    break;
                default:
                    j = q
            }
            var a = q;
            q = j;
            try {
                return C()
            } finally {
                q = a
            }
        }, p.unstable_pauseExecution = function() {}, p.unstable_requestPaint = function() {}, p.unstable_runWithPriority = function(C, j) {
            switch (C) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                    break;
                default:
                    C = 3
            }
            var a = q;
            q = C;
            try {
                return j()
            } finally {
                q = a
            }
        }, p.unstable_scheduleCallback = function(C, j, a) {
            var y = p.unstable_now();
            switch (typeof a == "object" && a !== null ? (a = a.delay, a = typeof a == "number" && 0 < a ? y + a : y) : a = y, C) {
                case 1:
                    var T = -1;
                    break;
                case 2:
                    T = 250;
                    break;
                case 5:
                    T = 1073741823;
                    break;
                case 4:
                    T = 1e4;
                    break;
                default:
                    T = 5e3
            }
            return T = a + T, C = {
                id: ae++,
                callback: j,
                priorityLevel: C,
                startTime: a,
                expirationTime: T,
                sortIndex: -1
            }, a > y ? (C.sortIndex = a, S(A, C), f(M) === null && C === f(A) && (re ? (ht(We), We = -1) : re = !0, ie(ke, a - y))) : (C.sortIndex = T, S(M, C), He || Le || (He = !0, Te(qe))), C
        }, p.unstable_shouldYield = Qt, p.unstable_wrapCallback = function(C) {
            var j = q;
            return function() {
                var a = q;
                q = j;
                try {
                    return C.apply(this, arguments)
                } finally {
                    q = a
                }
            }
        }
    }(zo)), zo
}
var Da;

