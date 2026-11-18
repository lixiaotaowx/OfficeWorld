function rp(s) {
    if (s.type === void 0) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
    const e = sp(s.type);
    if (s.times === void 0) {
        const n = [],
            i = [];
        $f(s.keys, n, i, "value"), s.times = n, s.values = i
    }
    let t;
    return e.parse !== void 0 ? t = e.parse(s) : t = new e(s.name, s.times, s.values, s.interpolation), us(s.settings) && (t.settings = {
        inTangents: qn(s.settings.inTangents, Float32Array),
        outTangents: qn(s.settings.outTangents, Float32Array)
    }), t
}
