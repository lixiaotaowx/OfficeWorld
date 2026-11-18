function ie(n, e, t) {
    if (!n) return n;
    if (_e(n)) {
        const s = {
            _placeholder: !0,
            num: e.length
        };
        return e.push(n), s
    } else if (Array.isArray(n)) {
        const s = new Array(n.length);
        for (let r = 0; r < n.length; r++) s[r] = ie(n[r], e);
        return s
    } else if (typeof n == "object" && !(n instanceof Date)) {
        if (n.toJSON && typeof n.toJSON == "function" && !t) return ie(n.toJSON(), e, !0);
        const s = {};
        for (const r in n) Object.prototype.hasOwnProperty.call(n, r) && (s[r] = ie(n[r], e));
        return s
    }
    return n
}

