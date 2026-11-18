class Qf extends Yi {
    constructor(e, t, n, i) {
        super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
            endingStart: Pi,
            endingEnd: Pi
        }
    }
    intervalChanged_(e, t, n) {
        const i = this.parameterPositions;
        let r = e - 2,
            a = e + 1,
            o = i[r],
            l = i[a];
        if (o === void 0) switch (this.getSettings_().endingStart) {
            case Ii:
                r = e, o = 2 * t - n;
                break;
            case br:
                r = i.length - 2, o = t + i[r] - i[r + 1];
                break;
            default:
                r = e, o = n
        }
        if (l === void 0) switch (this.getSettings_().endingEnd) {
            case Ii:
                a = e, l = 2 * n - t;
                break;
            case br:
                a = 1, l = n + i[1] - i[0];
                break;
            default:
                a = e - 1, l = t
        }
        const c = (n - t) * .5,
            h = this.valueSize;
        this._weightPrev = c / (t - o), this._weightNext = c / (l - n), this._offsetPrev = r * h, this._offsetNext = a * h
    }
    interpolate_(e, t, n, i) {
        const r = this.resultBuffer,
            a = this.sampleValues,
            o = this.valueSize,
            l = e * o,
            c = l - o,
            h = this._offsetPrev,
            u = this._offsetNext,
            d = this._weightPrev,
            f = this._weightNext,
            p = (n - t) / (i - t),
            x = p * p,
            m = x * p,
            g = -d * m + 2 * d * x - d * p,
            M = (1 + d) * m + (-1.5 - 2 * d) * x + (-.5 + d) * p + 1,
            E = (-1 - f) * m + (1.5 + f) * x + .5 * p,
            v = f * m - f * x;
        for (let A = 0; A !== o; ++A) r[A] = g * a[h + A] + M * a[c + A] + E * a[l + A] + v * a[u + A];
        return r
    }
}
