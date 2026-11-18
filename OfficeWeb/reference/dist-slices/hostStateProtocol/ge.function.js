function ge(n, e) {
    if (!n) return n;
    if (n && n._placeholder === !0) {
        if (typeof n.num == "number" && n.num >= 0 && n.num < e.length) return e[n.num];
        throw new Error("illegal attachments")
    } else if (Array.isArray(n))
        for (let t = 0; t < n.length; t++) n[t] = ge(n[t], e);
    else if (typeof n == "object")
        for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && (n[t] = ge(n[t], e));
    return n
}
