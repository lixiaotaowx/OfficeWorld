function fv(s, e, t) {
    var o, l;
    const n = ((l = (o = s == null ? void 0 : s.attributes) == null ? void 0 : o.position) == null ? void 0 : l.count) ?? 0,
        i = (s == null ? void 0 : s.groups) ?? [];
    if (!i.length || t <= 1) return n;
    const r = s == null ? void 0 : s.index;
    let a = 0;
    for (const c of i) c.materialIndex === e && (a += c.count);
    return a || n / t
}

