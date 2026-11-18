function ko(i, e, t, n) {
    if (!t) return [new bt({
        quality: De.HIGH,
        width: i,
        height: e,
        bitrate: 0,
        ssrc: 0
    })];
    if (n) {
        const s = t[0].scalabilityMode,
            r = new Ac(s),
            a = [],
            o = r.suffix == "h" ? 1.5 : 2,
            c = r.suffix == "h" ? 2 : 3;
        for (let d = 0; d < r.spatial; d += 1) a.push(new bt({
            quality: Math.min(De.HIGH, r.spatial - 1) - d,
            width: Math.ceil(i / Math.pow(o, d)),
            height: Math.ceil(e / Math.pow(o, d)),
            bitrate: t[0].maxBitrate ? Math.ceil(t[0].maxBitrate / Math.pow(c, d)) : 0,
            ssrc: 0
        }));
        return a
    }
    return t.map(s => {
        var r, a, o;
        const c = (r = s.scaleResolutionDownBy) !== null && r !== void 0 ? r : 1;
        let d = Nc((a = s.rid) !== null && a !== void 0 ? a : "");
        return new bt({
            quality: d,
            width: Math.ceil(i / c),
            height: Math.ceil(e / c),
            bitrate: (o = s.maxBitrate) !== null && o !== void 0 ? o : 0,
            ssrc: 0
        })
    })
}
