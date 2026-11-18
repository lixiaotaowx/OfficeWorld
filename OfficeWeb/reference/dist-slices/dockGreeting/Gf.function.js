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

