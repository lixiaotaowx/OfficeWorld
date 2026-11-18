function ms(i, e, t, n) {
    var s, r;
    let a = n == null ? void 0 : n.videoEncoding;
    i && (a = n == null ? void 0 : n.screenShareEncoding);
    const o = n == null ? void 0 : n.simulcast,
        c = n == null ? void 0 : n.scalabilityMode,
        d = n == null ? void 0 : n.videoCodec;
    if (!a && !o && !c || !e || !t) return [{}];
    a || (a = ff(i, e, t, d), X.debug("using video encoding", a));
    const l = a.maxFramerate,
        u = new oe(e, t, a.maxBitrate, a.maxFramerate, a.priority);
    if (c && We(d)) {
        const f = new Ac(c),
            p = [];
        if (f.spatial > 3) throw new Error("unsupported scalabilityMode: ".concat(c));
        const _ = Oe();
        if (vi() || Xe() || (_ == null ? void 0 : _.name) === "Chrome" && Ze(_ == null ? void 0 : _.version, "113") < 0) {
            const w = f.suffix == "h" ? 2 : 3,
                k = cm(_);
            for (let P = 0; P < f.spatial; P += 1) p.push({
                rid: hs[2 - P],
                maxBitrate: a.maxBitrate / Math.pow(w, P),
                maxFramerate: u.encoding.maxFramerate,
                scaleResolutionDownBy: k ? Math.pow(2, P) : void 0
            });
            p[0].scalabilityMode = c
        } else p.push({
            maxBitrate: a.maxBitrate,
            maxFramerate: u.encoding.maxFramerate,
            scalabilityMode: c
        });
        return u.encoding.priority && (p[0].priority = u.encoding.priority, p[0].networkPriority = u.encoding.priority), X.debug("using svc encoding", {
            encodings: p
        }), p
    }
    if (!o) return [a];
    let h = [];
    i ? h = (s = bo(n == null ? void 0 : n.screenShareSimulcastLayers)) !== null && s !== void 0 ? s : vo(i, u) : h = (r = bo(n == null ? void 0 : n.videoSimulcastLayers)) !== null && r !== void 0 ? r : vo(i, u);
    let m;
    if (h.length > 0) {
        const f = h[0];
        h.length > 1 && ([, m] = h);
        const p = Math.max(e, t);
        if (p >= 960 && m) return xn(e, t, [f, m, u], l);
        if (p >= 480) return xn(e, t, [f, u], l)
    }
    return xn(e, t, [u])
}

