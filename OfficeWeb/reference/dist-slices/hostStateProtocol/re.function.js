function re(n, e) {
    if (!n || typeof n != "object") return !1;
    if (Array.isArray(n)) {
        for (let t = 0, s = n.length; t < s; t++)
            if (re(n[t])) return !0;
        return !1
    }
    if (_e(n)) return !0;
    if (n.toJSON && typeof n.toJSON == "function" && arguments.length === 1) return re(n.toJSON(), !0);
    for (const t in n)
        if (Object.prototype.hasOwnProperty.call(n, t) && re(n[t])) return !0;
    return !1
}

