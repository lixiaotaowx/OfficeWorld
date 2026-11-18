class vo {
    constructor(e = "", t = -1, n = [], i = Uo) {
        this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = hn(), this.userData = {}, this.duration < 0 && this.resetDuration()
    }
    static parse(e) {
        const t = [],
            n = e.tracks,
            i = 1 / (e.fps || 1);
        for (let a = 0, o = n.length; a !== o; ++a) t.push(rp(n[a]).scale(i));
        const r = new this(e.name, e.duration, t, e.blendMode);
        return r.uuid = e.uuid, r.userData = JSON.parse(e.userData || "{}"), r
    }
    static toJSON(e) {
        const t = [],
            n = e.tracks,
            i = {
                name: e.name,
                duration: e.duration,
                tracks: t,
                uuid: e.uuid,
                blendMode: e.blendMode,
                userData: JSON.stringify(e.userData)
            };
        for (let r = 0, a = n.length; r !== a; ++r) t.push(fn.toJSON(n[r]));
        return i
    }
    static CreateFromMorphTargetSequence(e, t, n, i) {
        const r = t.length,
            a = [];
        for (let o = 0; o < r; o++) {
            let l = [],
                c = [];
            l.push((o + r - 1) % r, o, (o + 1) % r), c.push(0, 1, 0);
            const h = Zf(l);
            l = hc(l, 1, h), c = hc(c, 1, h), !i && l[0] === 0 && (l.push(r), c.push(c[0])), a.push(new Ps(".morphTargetInfluences[" + t[o].name + "]", l, c).scale(1 / n))
        }
        return new this(e, -1, a)
    }
    static findByName(e, t) {
        let n = e;
        if (!Array.isArray(e)) {
            const i = e;
            n = i.geometry && i.geometry.animations || i.animations
        }
        for (let i = 0; i < n.length; i++)
            if (n[i].name === t) return n[i];
        return null
    }
    static CreateClipsFromMorphTargetSequences(e, t, n) {
        const i = {},
            r = /^([\w-]*?)([\d]+)$/;
        for (let o = 0, l = e.length; o < l; o++) {
            const c = e[o],
                h = c.name.match(r);
            if (h && h.length > 1) {
                const u = h[1];
                let d = i[u];
                d || (i[u] = d = []), d.push(c)
            }
        }
        const a = [];
        for (const o in i) a.push(this.CreateFromMorphTargetSequence(o, i[o], t, n));
        return a
    }
    resetDuration() {
        const e = this.tracks;
        let t = 0;
        for (let n = 0, i = e.length; n !== i; ++n) {
            const r = this.tracks[n];
            t = Math.max(t, r.times[r.times.length - 1])
        }
        return this.duration = t, this
    }
    trim() {
        for (let e = 0; e < this.tracks.length; e++) this.tracks[e].trim(0, this.duration);
        return this
    }
    validate() {
        let e = !0;
        for (let t = 0; t < this.tracks.length; t++) e = e && this.tracks[t].validate();
        return e
    }
    optimize() {
        for (let e = 0; e < this.tracks.length; e++) this.tracks[e].optimize();
        return this
    }
    clone() {
        const e = [];
        for (let n = 0; n < this.tracks.length; n++) e.push(this.tracks[n].clone());
        const t = new this.constructor(this.name, this.duration, e, this.blendMode);
        return t.userData = JSON.parse(JSON.stringify(this.userData)), t
    }
    toJSON() {
        return this.constructor.toJSON(this)
    }
}

