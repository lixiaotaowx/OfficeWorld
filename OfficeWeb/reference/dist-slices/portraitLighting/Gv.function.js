function gv(s, e) {
    var r;
    const t = Eu(e.color),
        n = s.userData.lookSource ?? s.map;
    let i = !1;
    if (n != null && n.image) {
        s.userData.lookSource = n;
        let a = Jn.get(n);
        a || (a = new Map, Jn.set(n, a));
        let o = a.get(t);
        o || (o = vv(n, t), a.set(t, o)), s.map = o;
        const l = Nr.get(s);
        (!l || l.texture !== o || l.source !== n || l.key !== t) && (gu(s), Jn.has(n) || Jn.set(n, a), a.set(t, o), xs.set(o, (xs.get(o) || 0) + 1), Nr.set(s, {
            source: n,
            key: t,
            texture: o
        })), s.color.setRGB(1, 1, 1), i = !0
    } else s.color.setStyle(t);
    s.needsUpdate = !0, s.userData.look = {
        color: e.color,
        hex: t,
        recolored: i,
        mapUuid: ((r = s.map) == null ? void 0 : r.uuid) ?? null
    }
}

