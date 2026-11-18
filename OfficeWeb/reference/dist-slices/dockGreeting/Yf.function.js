function Yf() {
    if (La) return B;
    La = 1;
    var p = Symbol.for("react.element"),
        S = Symbol.for("react.portal"),
        f = Symbol.for("react.fragment"),
        R = Symbol.for("react.strict_mode"),
        E = Symbol.for("react.profiler"),
        z = Symbol.for("react.provider"),
        F = Symbol.for("react.context"),
        O = Symbol.for("react.forward_ref"),
        M = Symbol.for("react.suspense"),
        A = Symbol.for("react.memo"),
        ae = Symbol.for("react.lazy"),
        V = Symbol.iterator;

    function q(a) {
        return a === null || typeof a != "object" ? null : (a = V && a[V] || a["@@iterator"], typeof a == "function" ? a : null)
    }
    var Le = {
            isMounted: function() {
                return !1
            },
            enqueueForceUpdate: function() {},
            enqueueReplaceState: function() {},
            enqueueSetState: function() {}
        },
        He = Object.assign,
        re = {};

    function Z(a, y, T) {
        this.props = a, this.context = y, this.refs = re, this.updater = T || Le
    }
    Z.prototype.isReactComponent = {}, Z.prototype.setState = function(a, y) {
        if (typeof a != "object" && typeof a != "function" && a != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a, y, "setState")
    }, Z.prototype.forceUpdate = function(a) {
        this.updater.enqueueForceUpdate(this, a, "forceUpdate")
    };

    function ht() {}
    ht.prototype = Z.prototype;

    function it(a, y, T) {
        this.props = a, this.context = y, this.refs = re, this.updater = T || Le
    }
    var Je = it.prototype = new ht;
    Je.constructor = it, He(Je, Z.prototype), Je.isPureReactComponent = !0;
    var ke = Array.isArray,
        qe = Object.prototype.hasOwnProperty,
        xe = {
            current: null
        },
        ze = {
            key: !0,
            ref: !0,
            __self: !0,
            __source: !0
        };

    function We(a, y, T) {
        var H, $ = {},
            b = null,
            K = null;
        if (y != null)
            for (H in y.ref !== void 0 && (K = y.ref), y.key !== void 0 && (b = "" + y.key), y) qe.call(y, H) && !ze.hasOwnProperty(H) && ($[H] = y[H]);
        var J = arguments.length - 2;
        if (J === 1) $.children = T;
        else if (1 < J) {
            for (var Y = Array(J), Re = 0; Re < J; Re++) Y[Re] = arguments[Re + 2];
            $.children = Y
        }
        if (a && a.defaultProps)
            for (H in J = a.defaultProps, J) $[H] === void 0 && ($[H] = J[H]);
        return {
            $$typeof: p,
            type: a,
            key: b,
            ref: K,
            props: $,
            _owner: xe.current
        }
    }

    function xt(a, y) {
        return {
            $$typeof: p,
            type: a.type,
            key: y,
            ref: a.ref,
            props: a.props,
            _owner: a._owner
        }
    }

    function vt(a) {
        return typeof a == "object" && a !== null && a.$$typeof === p
    }

    function Qt(a) {
        var y = {
            "=": "=0",
            ":": "=2"
        };
        return "$" + a.replace(/[=:]/g, function(T) {
            return y[T]
        })
    }
    var st = /\/+/g;

    function Ue(a, y) {
        return typeof a == "object" && a !== null && a.key != null ? Qt("" + a.key) : y.toString(36)
    }

    function be(a, y, T, H, $) {
        var b = typeof a;
        (b === "undefined" || b === "boolean") && (a = null);
        var K = !1;
        if (a === null) K = !0;
        else switch (b) {
            case "string":
            case "number":
                K = !0;
                break;
            case "object":
                switch (a.$$typeof) {
                    case p:
                    case S:
                        K = !0
                }
        }
        if (K) return K = a, $ = $(K), a = H === "" ? "." + Ue(K, 0) : H, ke($) ? (T = "", a != null && (T = a.replace(st, "$&/") + "/"), be($, y, T, "", function(Re) {
            return Re
        })) : $ != null && (vt($) && ($ = xt($, T + (!$.key || K && K.key === $.key ? "" : ("" + $.key).replace(st, "$&/") + "/") + a)), y.push($)), 1;
        if (K = 0, H = H === "" ? "." : H + ":", ke(a))
            for (var J = 0; J < a.length; J++) {
                b = a[J];
                var Y = H + Ue(b, J);
                K += be(b, y, T, Y, $)
            } else if (Y = q(a), typeof Y == "function")
                for (a = Y.call(a), J = 0; !(b = a.next()).done;) b = b.value, Y = H + Ue(b, J++), K += be(b, y, T, Y, $);
            else if (b === "object") throw y = String(a), Error("Objects are not valid as a React child (found: " + (y === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : y) + "). If you meant to render a collection of children, use an array instead.");
        return K
    }

    function at(a, y, T) {
        if (a == null) return a;
        var H = [],
            $ = 0;
        return be(a, H, "", "", function(b) {
            return y.call(T, b, $++)
        }), H
    }

    function Te(a) {
        if (a._status === -1) {
            var y = a._result;
            y = y(), y.then(function(T) {
                (a._status === 0 || a._status === -1) && (a._status = 1, a._result = T)
            }, function(T) {
                (a._status === 0 || a._status === -1) && (a._status = 2, a._result = T)
            }), a._status === -1 && (a._status = 0, a._result = y)
        }
        if (a._status === 1) return a._result.default;
        throw a._result
    }
    var ie = {
            current: null
        },
        C = {
            transition: null
        },
        j = {
            ReactCurrentDispatcher: ie,
            ReactCurrentBatchConfig: C,
            ReactCurrentOwner: xe
        };
    return B.Children = {
        map: at,
        forEach: function(a, y, T) {
            at(a, function() {
                y.apply(this, arguments)
            }, T)
        },
        count: function(a) {
            var y = 0;
            return at(a, function() {
                y++
            }), y
        },
        toArray: function(a) {
            return at(a, function(y) {
                return y
            }) || []
        },
        only: function(a) {
            if (!vt(a)) throw Error("React.Children.only expected to receive a single React element child.");
            return a
        }
    }, B.Component = Z, B.Fragment = f, B.Profiler = E, B.PureComponent = it, B.StrictMode = R, B.Suspense = M, B.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = j, B.cloneElement = function(a, y, T) {
        if (a == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
        var H = He({}, a.props),
            $ = a.key,
            b = a.ref,
            K = a._owner;
        if (y != null) {
            if (y.ref !== void 0 && (b = y.ref, K = xe.current), y.key !== void 0 && ($ = "" + y.key), a.type && a.type.defaultProps) var J = a.type.defaultProps;
            for (Y in y) qe.call(y, Y) && !ze.hasOwnProperty(Y) && (H[Y] = y[Y] === void 0 && J !== void 0 ? J[Y] : y[Y])
        }
        var Y = arguments.length - 2;
        if (Y === 1) H.children = T;
        else if (1 < Y) {
            J = Array(Y);
            for (var Re = 0; Re < Y; Re++) J[Re] = arguments[Re + 2];
            H.children = J
        }
        return {
            $$typeof: p,
            type: a.type,
            key: $,
            ref: b,
            props: H,
            _owner: K
        }
    }, B.createContext = function(a) {
        return a = {
            $$typeof: F,
            _currentValue: a,
            _currentValue2: a,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
            _defaultValue: null,
            _globalName: null
        }, a.Provider = {
            $$typeof: z,
            _context: a
        }, a.Consumer = a
    }, B.createElement = We, B.createFactory = function(a) {
        var y = We.bind(null, a);
        return y.type = a, y
    }, B.createRef = function() {
        return {
            current: null
        }
    }, B.forwardRef = function(a) {
        return {
            $$typeof: O,
            render: a
        }
    }, B.isValidElement = vt, B.lazy = function(a) {
        return {
            $$typeof: ae,
            _payload: {
                _status: -1,
                _result: a
            },
            _init: Te
        }
    }, B.memo = function(a, y) {
        return {
            $$typeof: A,
            type: a,
            compare: y === void 0 ? null : y
        }
    }, B.startTransition = function(a) {
        var y = C.transition;
        C.transition = {};
        try {
            a()
        } finally {
            C.transition = y
        }
    }, B.unstable_act = function() {
        throw Error("act(...) is not supported in production builds of React.")
    }, B.useCallback = function(a, y) {
        return ie.current.useCallback(a, y)
    }, B.useContext = function(a) {
        return ie.current.useContext(a)
    }, B.useDebugValue = function() {}, B.useDeferredValue = function(a) {
        return ie.current.useDeferredValue(a)
    }, B.useEffect = function(a, y) {
        return ie.current.useEffect(a, y)
    }, B.useId = function() {
        return ie.current.useId()
    }, B.useImperativeHandle = function(a, y, T) {
        return ie.current.useImperativeHandle(a, y, T)
    }, B.useInsertionEffect = function(a, y) {
        return ie.current.useInsertionEffect(a, y)
    }, B.useLayoutEffect = function(a, y) {
        return ie.current.useLayoutEffect(a, y)
    }, B.useMemo = function(a, y) {
        return ie.current.useMemo(a, y)
    }, B.useReducer = function(a, y, T) {
        return ie.current.useReducer(a, y, T)
    }, B.useRef = function(a) {
        return ie.current.useRef(a)
    }, B.useState = function(a) {
        return ie.current.useState(a)
    }, B.useSyncExternalStore = function(a, y, T) {
        return ie.current.useSyncExternalStore(a, y, T)
    }, B.useTransition = function() {
        return ie.current.useTransition()
    }, B.version = "18.2.0", B
}
var za;

