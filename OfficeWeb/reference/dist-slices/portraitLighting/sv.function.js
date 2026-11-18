function sv(s, e, t) {
    let n = !1,
        i = !1,
        r = !1;
    for (let c = 0, h = e.length; c < h; c++) {
        const u = e[c];
        if (u.POSITION !== void 0 && (n = !0), u.NORMAL !== void 0 && (i = !0), u.COLOR_0 !== void 0 && (r = !0), n && i && r) break
    }
    if (!n && !i && !r) return Promise.resolve(s);
    const a = [],
        o = [],
        l = [];
    for (let c = 0, h = e.length; c < h; c++) {
        const u = e[c];
        if (n) {
            const d = u.POSITION !== void 0 ? t.getDependency("accessor", u.POSITION) : s.attributes.position;
            a.push(d)
        }
        if (i) {
            const d = u.NORMAL !== void 0 ? t.getDependency("accessor", u.NORMAL) : s.attributes.normal;
            o.push(d)
        }
        if (r) {
            const d = u.COLOR_0 !== void 0 ? t.getDependency("accessor", u.COLOR_0) : s.attributes.color;
            l.push(d)
        }
    }
    return Promise.all([Promise.all(a), Promise.all(o), Promise.all(l)]).then(function(c) {
        const h = c[0],
            u = c[1],
            d = c[2];
        return n && (s.morphAttributes.position = h), i && (s.morphAttributes.normal = u), r && (s.morphAttributes.color = d), s.morphTargetsRelative = !0, s
    })
}

