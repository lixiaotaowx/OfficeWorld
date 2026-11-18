function xr(r, e = new Map) {
    var o, a;
    const t = [],
        s = new Map,
        i = l => !l.pitch && !l.roll;
    for (const l of r) {
        const A = (o = X0(l.kind)) == null ? void 0 : o.workstation;
        if (!A || !i(l) || l.seatIndex === void 0) continue;
        const c = (l.rotation || 0) * K0 + A.face * Math.PI / 180,
            h = Cs(l, A.sit),
            u = [.1, -.1].map(g => Cs(l, [A.monitor.at[0] + g, A.monitor.at[1] - .1, A.monitor.at[2] - .19])),
            d = {
                id: `desk-${l.seatIndex}`,
                part: l.id,
                at: h,
                face: c,
                hands: u,
                approaches: C2(h, c, l.y, !1),
                workstation: l.seatIndex
            };
        t.push(d), s.set(l.id, d)
    }
    const n = l => {
        var h;
        const A = l.kind.startsWith("model:") ? e.get(l.kind.slice(6)) : void 0;
        if ((A == null ? void 0 : A.role) !== "seat") return null;
        const c = ((h = l.scale) == null ? void 0 : h[0]) || 1;
        return {
            at: [0, Math.min(.48, A.size[1] * c * .5) / c, .05],
            face: 0
        }
    };
    for (const l of r) {
        const A = ((a = X0(l.kind)) == null ? void 0 : a.seat) || n(l);
        if (!A || !i(l)) continue;
        const c = (l.rotation || 0) * K0 + A.face * Math.PI / 180,
            h = A.count || 1;
        for (let u = 0; u < h; u++) {
            const d = [A.at[0] + (h > 1 ? (u - (h - 1) / 2) * (A.spread || .9) : 0), A.at[1], A.at[2]];
            l.kind === "sofa" && (d[1] = wr, d[2] = Br);
            const g = Cs(l, d),
                p = t.find(C => C.workstation !== void 0 && Math.hypot(C.at.x - g.x, C.at.z - g.z) < .35 && Math.abs(C.at.y - g.y) < .3);
            if (p) {
                s.set(l.id, p);
                continue
            }
            const I = {
                id: h > 1 ? `build-seat-${l.id}:${u}` : `build-seat-${l.id}`,
                part: l.id,
                at: g,
                face: c,
                approaches: C2(g, c, l.y, !0),
                ...l.kind === "sofa" ? {
                    pose: "sofa"
                } : {}
            };
            t.push(I), u === 0 && s.set(l.id, I)
        }
    }
    return {
        spots: t,
        byPart: s
    }
}

