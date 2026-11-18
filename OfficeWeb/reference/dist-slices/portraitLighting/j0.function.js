function j0() {
    let s = new WeakMap;

    function e(a) {
        return s.has(a)
    }

    function t(a) {
        let o = s.get(a);
        return o === void 0 && (o = {}, s.set(a, o)), o
    }

    function n(a) {
        s.delete(a)
    }

    function i(a, o, l) {
        s.get(a)[o] = l
    }

    function r() {
        s = new WeakMap
    }
    return {
        has: e,
        get: t,
        remove: n,
        update: i,
        dispose: r
    }
}

