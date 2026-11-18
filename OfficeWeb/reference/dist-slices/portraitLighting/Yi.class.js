class Yi {
    constructor(e, t, n, i) {
        this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = i !== void 0 ? i : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {}
    }
    evaluate(e) {
        const t = this.parameterPositions;
        let n = this._cachedIndex,
            i = t[n],
            r = t[n - 1];
        e: {
            t: {
                let a;n: {
                    i: if (!(e < i)) {
                        for (let o = n + 2;;) {
                            if (i === void 0) {
                                if (e < r) break i;
                                return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1)
                            }
                            if (n === o) break;
                            if (r = i, i = t[++n], e < i) break t
                        }
                        a = t.length;
                        break n
                    }if (!(e >= r)) {
                        const o = t[1];
                        e < o && (n = 2, r = o);
                        for (let l = n - 2;;) {
                            if (r === void 0) return this._cachedIndex = 0, this.copySampleValue_(0);
                            if (n === l) break;
                            if (i = r, r = t[--n - 1], e >= r) break t
                        }
                        a = n, n = 0;
                        break n
                    }
                    break e
                }
                for (; n < a;) {
                    const o = n + a >>> 1;
                    e < t[o] ? a = o : n = o + 1
                }
                if (i = t[n], r = t[n - 1], r === void 0) return this._cachedIndex = 0,
                this.copySampleValue_(0);
                if (i === void 0) return n = t.length,
                this._cachedIndex = n,
                this.copySampleValue_(n - 1)
            }
            this._cachedIndex = n,
            this.intervalChanged_(n, r, i)
        }
        return this.interpolate_(n, r, e, i)
    }
    getSettings_() {
        return this.settings || this.DefaultSettings_
    }
    copySampleValue_(e) {
        const t = this.resultBuffer,
            n = this.sampleValues,
            i = this.valueSize,
            r = e * i;
        for (let a = 0; a !== i; ++a) t[a] = n[r + a];
        return t
    }
    interpolate_() {
        throw new Error("THREE.Interpolant: Call to abstract method.")
    }
    intervalChanged_() {}
}
