const Yr = new N,
    wl = new en,
    sl = class sl {
        constructor(e, t, n, i, r, a, o, l, c) {
            this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1], e !== void 0 && this.set(e, t, n, i, r, a, o, l, c)
        }
        set(e, t, n, i, r, a, o, l, c) {
            const h = this.elements;
            return h[0] = e, h[1] = i, h[2] = o, h[3] = t, h[4] = r, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this
        }
        identity() {
            return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this
        }
        copy(e) {
            const t = this.elements,
                n = e.elements;
            return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this
        }
        extractBasis(e, t, n) {
            return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this
        }
        setFromMatrix4(e) {
            const t = e.elements;
            return this.set(t[0], t[4], t[8], t[1], t[5], t[9], t[2], t[6], t[10]), this
        }
        multiply(e) {
            return this.multiplyMatrices(this, e)
        }
        premultiply(e) {
            return this.multiplyMatrices(e, this)
        }
        multiplyMatrices(e, t) {
            const n = e.elements,
                i = t.elements,
                r = this.elements,
                a = n[0],
                o = n[3],
                l = n[6],
                c = n[1],
                h = n[4],
                u = n[7],
                d = n[2],
                f = n[5],
                p = n[8],
                x = i[0],
                m = i[3],
                g = i[6],
                M = i[1],
                E = i[4],
                v = i[7],
                A = i[2],
                b = i[5],
                _ = i[8];
            return r[0] = a * x + o * M + l * A, r[3] = a * m + o * E + l * b, r[6] = a * g + o * v + l * _, r[1] = c * x + h * M + u * A, r[4] = c * m + h * E + u * b, r[7] = c * g + h * v + u * _, r[2] = d * x + f * M + p * A, r[5] = d * m + f * E + p * b, r[8] = d * g + f * v + p * _, this
        }
        multiplyScalar(e) {
            const t = this.elements;
            return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this
        }
        determinant() {
            const e = this.elements,
                t = e[0],
                n = e[1],
                i = e[2],
                r = e[3],
                a = e[4],
                o = e[5],
                l = e[6],
                c = e[7],
                h = e[8];
            return t * a * h - t * o * c - n * r * h + n * o * l + i * r * c - i * a * l
        }
        invert() {
            const e = this.elements,
                t = e[0],
                n = e[1],
                i = e[2],
                r = e[3],
                a = e[4],
                o = e[5],
                l = e[6],
                c = e[7],
                h = e[8],
                u = h * a - o * c,
                d = o * l - h * r,
                f = c * r - a * l,
                p = t * u + n * d + i * f;
            if (p === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
            const x = 1 / p;
            return e[0] = u * x, e[1] = (i * c - h * n) * x, e[2] = (o * n - i * a) * x, e[3] = d * x, e[4] = (h * t - i * l) * x, e[5] = (i * r - o * t) * x, e[6] = f * x, e[7] = (n * l - c * t) * x, e[8] = (a * t - n * r) * x, this
        }
        transpose() {
            let e;
            const t = this.elements;
            return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this
        }
        getNormalMatrix(e) {
            return this.setFromMatrix4(e).invert().transpose()
        }
        transposeIntoArray(e) {
            const t = this.elements;
            return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this
        }
        setUvTransform(e, t, n, i, r, a, o) {
            const l = Math.cos(r),
                c = Math.sin(r);
            return this.set(n * l, n * c, -n * (l * a + c * o) + a + e, -i * c, i * l, -i * (-c * a + l * o) + o + t, 0, 0, 1), this
        }
        scale(e, t) {
            return Fi("Matrix3: .scale() is deprecated. Use .makeScale() instead."), this.premultiply(Kr.makeScale(e, t)), this
        }
        rotate(e) {
            return Fi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."), this.premultiply(Kr.makeRotation(-e)), this
        }
        translate(e, t) {
            return Fi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."), this.premultiply(Kr.makeTranslation(e, t)), this
        }
        makeTranslation(e, t) {
            return e.isVector2 ? this.set(1, 0, e.x, 0, 1, e.y, 0, 0, 1) : this.set(1, 0, e, 0, 1, t, 0, 0, 1), this
        }
        makeRotation(e) {
            const t = Math.cos(e),
                n = Math.sin(e);
            return this.set(t, -n, 0, n, t, 0, 0, 0, 1), this
        }
        makeScale(e, t) {
            return this.set(e, 0, 0, 0, t, 0, 0, 0, 1), this
        }
        equals(e) {
            const t = this.elements,
                n = e.elements;
            for (let i = 0; i < 9; i++)
                if (t[i] !== n[i]) return !1;
            return !0
        }
        fromArray(e, t = 0) {
            for (let n = 0; n < 9; n++) this.elements[n] = e[n + t];
            return this
        }
        toArray(e = [], t = 0) {
            const n = this.elements;
            return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e
        }
        clone() {
            return new this.constructor().fromArray(this.elements)
        }
    };
sl.prototype.isMatrix3 = !0;
let He = sl;
