class fn {
    constructor(e, t, n, i) {
        if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
        if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
        this.name = e, this.times = qn(t, this.TimeBufferType), this.values = qn(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation)
    }
    static toJSON(e) {
        const t = e.constructor;
        let n;
        if (t.toJSON !== this.toJSON) n = t.toJSON(e);
        else {
            n = {
                name: e.name,
                times: qn(e.times, Array),
                values: qn(e.values, Array)
            };
            const i = e.getInterpolation();
            i !== e.DefaultInterpolation && (n.interpolation = i), us(e.settings) && (n.settings = {
                inTangents: qn(e.settings.inTangents, Array),
                outTangents: qn(e.settings.outTangents, Array)
            })
        }
        return n.type = e.ValueTypeName, n
    }
    InterpolantFactoryMethodDiscrete(e) {
        return new jf(this.times, this.values, this.getValueSize(), e)
    }
    InterpolantFactoryMethodLinear(e) {
        return new Jh(this.times, this.values, this.getValueSize(), e)
    }
    InterpolantFactoryMethodSmooth(e) {
        return new Qf(this.times, this.values, this.getValueSize(), e)
    }
    InterpolantFactoryMethodBezier(e) {
        const t = new ep(this.times, this.values, this.getValueSize(), e);
        return this.settings && (t.inTangents = this.settings.inTangents, t.outTangents = this.settings.outTangents), t
    }
    setInterpolation(e) {
        let t;
        switch (e) {
            case ys:
                t = this.InterpolantFactoryMethodDiscrete;
                break;
            case Ts:
                t = this.InterpolantFactoryMethodLinear;
                break;
            case Xr:
                t = this.InterpolantFactoryMethodSmooth;
                break;
            case Tl:
                t = this.InterpolantFactoryMethodBezier;
                break
        }
        if (t === void 0) {
            const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
            if (this.createInterpolant === void 0)
                if (e !== this.DefaultInterpolation) this.setInterpolation(this.DefaultInterpolation);
                else throw new Error(n);
            return Ce("KeyframeTrack:", n), this
        }
        return this.createInterpolant = t, this
    }
    getInterpolation() {
        switch (this.createInterpolant) {
            case this.InterpolantFactoryMethodDiscrete:
                return ys;
            case this.InterpolantFactoryMethodLinear:
                return Ts;
            case this.InterpolantFactoryMethodSmooth:
                return Xr;
            case this.InterpolantFactoryMethodBezier:
                return Tl
        }
    }
    getValueSize() {
        return this.values.length / this.times.length
    }
    shift(e) {
        if (e !== 0) {
            const t = this.times;
            for (let n = 0, i = t.length; n !== i; ++n) t[n] += e;
            us(this.settings) && (uc(this.settings.inTangents, e), uc(this.settings.outTangents, e))
        }
        return this
    }
    scale(e) {
        if (e !== 1) {
            const t = this.times;
            for (let n = 0, i = t.length; n !== i; ++n) t[n] *= e;
            us(this.settings) && (dc(this.settings.inTangents, e), dc(this.settings.outTangents, e))
        }
        return this
    }
    trim(e, t) {
        const n = this.times,
            i = n.length;
        let r = 0,
            a = i - 1;
        for (; r !== i && n[r] < e;) ++r;
        for (; a !== -1 && n[a] > t;) --a;
        if (++a, r !== 0 || a !== i) {
            r >= a && (a = Math.max(a, 1), r = a - 1);
            const o = this.getValueSize();
            this.times = n.slice(r, a), this.values = this.values.slice(r * o, a * o)
        }
        return this
    }
    validate() {
        let e = !0;
        const t = this.getValueSize();
        t - Math.floor(t) !== 0 && (ze("KeyframeTrack: Invalid value size in track.", this), e = !1);
        const n = this.times,
            i = this.values,
            r = n.length;
        r === 0 && (ze("KeyframeTrack: Track is empty.", this), e = !1);
        let a = null;
        for (let o = 0; o !== r; o++) {
            const l = n[o];
            if (typeof l == "number" && isNaN(l)) {
                ze("KeyframeTrack: Time is not a valid number.", this, o, l), e = !1;
                break
            }
            if (a !== null && a > l) {
                ze("KeyframeTrack: Out of order keys.", this, o, l, a), e = !1;
                break
            }
            a = l
        }
        if (i !== void 0 && hd(i))
            for (let o = 0, l = i.length; o !== l; ++o) {
                const c = i[o];
                if (isNaN(c)) {
                    ze("KeyframeTrack: Value is not a valid number.", this, o, c), e = !1;
                    break
                }
            }
        return e
    }
    optimize() {
        const e = this.times.slice(),
            t = this.values.slice(),
            n = this.getValueSize(),
            i = this.getInterpolation() === Xr,
            r = e.length - 1;
        let a = 1;
        for (let o = 1; o < r; ++o) {
            let l = !1;
            const c = e[o],
                h = e[o + 1];
            if (c !== h && (o !== 1 || c !== e[0]))
                if (i) l = !0;
                else {
                    const u = o * n,
                        d = u - n,
                        f = u + n;
                    for (let p = 0; p !== n; ++p) {
                        const x = t[u + p];
                        if (x !== t[d + p] || x !== t[f + p]) {
                            l = !0;
                            break
                        }
                    }
                } if (l) {
                if (o !== a) {
                    e[a] = e[o];
                    const u = o * n,
                        d = a * n;
                    for (let f = 0; f !== n; ++f) t[d + f] = t[u + f]
                }++a
            }
        }
        if (r > 0) {
            e[a] = e[r];
            for (let o = r * n, l = a * n, c = 0; c !== n; ++c) t[l + c] = t[o + c];
            ++a
        }
        return a !== e.length ? (this.times = e.slice(0, a), this.values = t.slice(0, a * n)) : (this.times = e, this.values = t), this
    }
    clone() {
        const e = this.times.slice(),
            t = this.values.slice(),
            n = this.constructor,
            i = new n(this.name, e, t);
        return i.createInterpolant = this.createInterpolant, us(this.settings) && (i.settings = {
            inTangents: this.settings.inTangents.slice(),
            outTangents: this.settings.outTangents.slice()
        }), i
    }
}

