// React 18 + jsx-runtime + Scheduler (vendored verbatim from the production
// bundle). Exposes the module instances `gr` (react) and `X` (jsx-runtime)
// consumed by dockGreeting and the app shell.
function Kf(p) {
  return p && p.__esModule && Object.prototype.hasOwnProperty.call(p, "default") ? p.default : p
}
var xo = {
    exports: {}
  },
  yr = {},
  No = {
    exports: {}
  },
  B = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var La;

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

function Ro() {
  return za || (za = 1, No.exports = Yf()), No.exports
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ta;

function Gf() {
  if (Ta) return yr;
  Ta = 1;
  var p = Ro(),
    S = Symbol.for("react.element"),
    f = Symbol.for("react.fragment"),
    R = Object.prototype.hasOwnProperty,
    E = p.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    z = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    };

  function F(O, M, A) {
    var ae, V = {},
      q = null,
      Le = null;
    A !== void 0 && (q = "" + A), M.key !== void 0 && (q = "" + M.key), M.ref !== void 0 && (Le = M.ref);
    for (ae in M) R.call(M, ae) && !z.hasOwnProperty(ae) && (V[ae] = M[ae]);
    if (O && O.defaultProps)
      for (ae in M = O.defaultProps, M) V[ae] === void 0 && (V[ae] = M[ae]);
    return {
      $$typeof: S,
      type: O,
      key: q,
      ref: Le,
      props: V,
      _owner: E.current
    }
  }
  return yr.Fragment = f, yr.jsx = F, yr.jsxs = F, yr
}
var Ra;

function Xf() {
  return Ra || (Ra = 1, xo.exports = Gf()), xo.exports
}
var X = Xf(),
  gr = Ro(),
  Tl = {},
  Po = {
    exports: {}
  },
  Fe = {},
  Lo = {
    exports: {}
  },
  zo = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ma;

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

function Jf() {
  return Da || (Da = 1, Lo.exports = Zf()), Lo.exports
}

export { gr as React, X as JsxRuntime, No as ReactCoreModule, xo as JsxModule, zo as SchedulerModule, Tl as DomModuleWrapper, Po as DomExportsHolder, Fe as DomInternal, Lo as SchedulerExports, Ro as ReactFactory, Jf as SchedulerFactory };
