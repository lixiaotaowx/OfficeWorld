function F0(s, e) {
    const t = {},
        n = s.getProgramParameter(e, s.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < n; i++) {
        const r = s.getActiveAttrib(e, i),
            a = r.name;
        let o = 1;
        r.type === s.FLOAT_MAT2 && (o = 2), r.type === s.FLOAT_MAT3 && (o = 3), r.type === s.FLOAT_MAT4 && (o = 4), t[a] = {
            type: r.type,
            location: s.getAttribLocation(e, a),
            locationSize: o
        }
    }
    return t
}

