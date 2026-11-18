class vp {
    constructor(e, t, n) {
        this.binding = e, this.valueSize = n;
        let i, r, a;
        switch (t) {
            case "quaternion":
                i = this._slerp, r = this._slerpAdditive, a = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(n * 6), this._workIndex = 5;
                break;
            case "string":
            case "bool":
                i = this._select, r = this._select, a = this._setAdditiveIdentityOther, this.buffer = new Array(n * 5);
                break;
            default:
                i = this._lerp, r = this._lerpAdditive, a = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(n * 5)
        }
        this._mixBufferRegion = i, this._mixBufferRegionAdditive = r, this._setIdentity = a, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0
    }
    accumulate(e, t) {
        const n = this.buffer,
            i = this.valueSize,
            r = e * i + i;
        let a = this.cumulativeWeight;
        if (a === 0) {
            for (let o = 0; o !== i; ++o) n[r + o] = n[o];
            a = t
        } else {
            a += t;
            const o = t / a;
            this._mixBufferRegion(n, r, 0, o, i)
        }
        this.cumulativeWeight = a
    }
    accumulateAdditive(e) {
        const t = this.buffer,
            n = this.valueSize,
            i = n * this._addIndex;
        this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(t, i, 0, e, n), this.cumulativeWeightAdditive += e
    }
    apply(e) {
        const t = this.valueSize,
            n = this.buffer,
            i = e * t + t,
            r = this.cumulativeWeight,
            a = this.cumulativeWeightAdditive,
            o = this.binding;
        if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, r < 1) {
            const l = t * this._origIndex;
            this._mixBufferRegion(n, i, l, 1 - r, t)
        }
        a > 0 && this._mixBufferRegionAdditive(n, i, this._addIndex * t, 1, t);
        for (let l = t, c = t + t; l !== c; ++l)
            if (n[l] !== n[l + t]) {
                o.setValue(n, i);
                break
            }
    }
    saveOriginalState() {
        const e = this.binding,
            t = this.buffer,
            n = this.valueSize,
            i = n * this._origIndex;
        e.getValue(t, i);
        for (let r = n, a = i; r !== a; ++r) t[r] = t[i + r % n];
        this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0
    }
    restoreOriginalState() {
        const e = this.valueSize * 3;
        this.binding.setValue(this.buffer, e)
    }
    _setAdditiveIdentityNumeric() {
        const e = this._addIndex * this.valueSize,
            t = e + this.valueSize;
        for (let n = e; n < t; n++) this.buffer[n] = 0
    }
    _setAdditiveIdentityQuaternion() {
        this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1
    }
    _setAdditiveIdentityOther() {
        const e = this._origIndex * this.valueSize,
            t = this._addIndex * this.valueSize;
        for (let n = 0; n < this.valueSize; n++) this.buffer[t + n] = this.buffer[e + n]
    }
    _select(e, t, n, i, r) {
        if (i >= .5)
            for (let a = 0; a !== r; ++a) e[t + a] = e[n + a]
    }
    _slerp(e, t, n, i) {
        en.slerpFlat(e, t, e, t, e, n, i)
    }
    _slerpAdditive(e, t, n, i, r) {
        const a = this._workIndex * r;
        en.multiplyQuaternionsFlat(e, a, e, t, e, n), en.slerpFlat(e, t, e, t, e, a, i)
    }
    _lerp(e, t, n, i, r) {
        const a = 1 - i;
        for (let o = 0; o !== r; ++o) {
            const l = t + o;
            e[l] = e[l] * a + e[n + o] * i
        }
    }
    _lerpAdditive(e, t, n, i, r) {
        for (let a = 0; a !== r; ++a) {
            const o = t + a;
            e[o] = e[o] + e[n + a] * i
        }
    }
}
