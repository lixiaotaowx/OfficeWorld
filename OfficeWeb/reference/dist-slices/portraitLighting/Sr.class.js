class Sr {
    constructor(e, t) {
        this.seq = [], this.map = {};
        const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
        for (let a = 0; a < n; ++a) {
            const o = e.getActiveUniform(t, a),
                l = e.getUniformLocation(t, o.name);
            b0(o, l, this)
        }
        const i = [],
            r = [];
        for (const a of this.seq) a.type === e.SAMPLER_2D_SHADOW || a.type === e.SAMPLER_CUBE_SHADOW || a.type === e.SAMPLER_2D_ARRAY_SHADOW ? i.push(a) : r.push(a);
        i.length > 0 && (this.seq = i.concat(r))
    }
    setValue(e, t, n, i) {
        const r = this.map[t];
        r !== void 0 && r.setValue(e, n, i)
    }
    setOptional(e, t, n) {
        const i = t[n];
        i !== void 0 && this.setValue(e, n, i)
    }
    static upload(e, t, n, i) {
        for (let r = 0, a = t.length; r !== a; ++r) {
            const o = t[r],
                l = n[o.id];
            l.needsUpdate !== !1 && o.setValue(e, l.value, i)
        }
    }
    static seqWithValue(e, t) {
        const n = [];
        for (let i = 0, r = e.length; i !== r; ++i) {
            const a = e[i];
            a.id in t && n.push(a)
        }
        return n
    }
}

