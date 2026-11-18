const Dr = class Dr {
    constructor(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m) {
        this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], e !== void 0 && this.set(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m)
    }
    set(e, t, n, i, r, a, o, l, c, h, u, d, f, p, x, m) {
        const g = this.elements;
        return g[0] = e, g[4] = t, g[8] = n, g[12] = i, g[1] = r, g[5] = a, g[9] = o, g[13] = l, g[2] = c, g[6] = h, g[10] = u, g[14] = d, g[3] = f, g[7] = p, g[11] = x, g[15] = m, this
    }
    identity() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    clone() {
        return new Dr().fromArray(this.elements)
    }
    copy(e) {
        const t = this.elements,
            n = e.elements;
        return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this
    }
    copyPosition(e) {
        const t = this.elements,
            n = e.elements;
        return t[12] = n[12], t[13] = n[13], t[14] = n[14], this
    }
    setFromMatrix3(e) {
        const t = e.elements;
        return this.set(t[0], t[3], t[6], 0, t[1], t[4], t[7], 0, t[2], t[5], t[8], 0, 0, 0, 0, 1), this
    }
    extractBasis(e, t, n) {
        return this.determinantAffine() === 0 ? (e.set(1, 0, 0), t.set(0, 1, 0), n.set(0, 0, 1), this) : (e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this)
    }
    makeBasis(e, t, n) {
        return this.set(e.x, t.x, n.x, 0, e.y, t.y, n.y, 0, e.z, t.z, n.z, 0, 0, 0, 0, 1), this
    }
    extractRotation(e) {
        if (e.determinantAffine() === 0) return this.identity();
        const t = this.elements,
            n = e.elements,
            i = 1 / gi.setFromMatrixColumn(e, 0).length(),
            r = 1 / gi.setFromMatrixColumn(e, 1).length(),
            a = 1 / gi.setFromMatrixColumn(e, 2).length();
        return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
    }
    makeRotationFromEuler(e) {
        const t = this.elements,
            n = e.x,
            i = e.y,
            r = e.z,
            a = Math.cos(n),
            o = Math.sin(n),
            l = Math.cos(i),
            c = Math.sin(i),
            h = Math.cos(r),
            u = Math.sin(r);
        if (e.order === "XYZ") {
            const d = a * h,
                f = a * u,
                p = o * h,
                x = o * u;
            t[0] = l * h, t[4] = -l * u, t[8] = c, t[1] = f + p * c, t[5] = d - x * c, t[9] = -o * l, t[2] = x - d * c, t[6] = p + f * c, t[10] = a * l
        } else if (e.order === "YXZ") {
            const d = l * h,
                f = l * u,
                p = c * h,
                x = c * u;
            t[0] = d + x * o, t[4] = p * o - f, t[8] = a * c, t[1] = a * u, t[5] = a * h, t[9] = -o, t[2] = f * o - p, t[6] = x + d * o, t[10] = a * l
        } else if (e.order === "ZXY") {
            const d = l * h,
                f = l * u,
                p = c * h,
                x = c * u;
            t[0] = d - x * o, t[4] = -a * u, t[8] = p + f * o, t[1] = f + p * o, t[5] = a * h, t[9] = x - d * o, t[2] = -a * c, t[6] = o, t[10] = a * l
        } else if (e.order === "ZYX") {
            const d = a * h,
                f = a * u,
                p = o * h,
                x = o * u;
            t[0] = l * h, t[4] = p * c - f, t[8] = d * c + x, t[1] = l * u, t[5] = x * c + d, t[9] = f * c - p, t[2] = -c, t[6] = o * l, t[10] = a * l
        } else if (e.order === "YZX") {
            const d = a * l,
                f = a * c,
                p = o * l,
                x = o * c;
            t[0] = l * h, t[4] = x - d * u, t[8] = p * u + f, t[1] = u, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = f * u + p, t[10] = d - x * u
        } else if (e.order === "XZY") {
            const d = a * l,
                f = a * c,
                p = o * l,
                x = o * c;
            t[0] = l * h, t[4] = -u, t[8] = c * h, t[1] = d * u + x, t[5] = a * h, t[9] = f * u - p, t[2] = p * u - f, t[6] = o * h, t[10] = x * u + d
        }
        return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this
    }
    makeRotationFromQuaternion(e) {
        return this.compose(Fd, e, Od)
    }
    lookAt(e, t, n) {
        const i = this.elements;
        return qt.subVectors(e, t), qt.lengthSq() === 0 && (qt.z = 1), qt.normalize(), zn.crossVectors(n, qt), zn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? qt.x += 1e-4 : qt.z += 1e-4, qt.normalize(), zn.crossVectors(n, qt)), zn.normalize(), zs.crossVectors(qt, zn), i[0] = zn.x, i[4] = zs.x, i[8] = qt.x, i[1] = zn.y, i[5] = zs.y, i[9] = qt.y, i[2] = zn.z, i[6] = zs.z, i[10] = qt.z, this
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
            o = n[4],
            l = n[8],
            c = n[12],
            h = n[1],
            u = n[5],
            d = n[9],
            f = n[13],
            p = n[2],
            x = n[6],
            m = n[10],
            g = n[14],
            M = n[3],
            E = n[7],
            v = n[11],
            A = n[15],
            b = i[0],
            _ = i[4],
            T = i[8],
            I = i[12],
            R = i[1],
            D = i[5],
            F = i[9],
            V = i[13],
            L = i[2],
            k = i[6],
            X = i[10],
            H = i[14],
            te = i[3],
            W = i[7],
            Q = i[11],
            ee = i[15];
        return r[0] = a * b + o * R + l * L + c * te, r[4] = a * _ + o * D + l * k + c * W, r[8] = a * T + o * F + l * X + c * Q, r[12] = a * I + o * V + l * H + c * ee, r[1] = h * b + u * R + d * L + f * te, r[5] = h * _ + u * D + d * k + f * W, r[9] = h * T + u * F + d * X + f * Q, r[13] = h * I + u * V + d * H + f * ee, r[2] = p * b + x * R + m * L + g * te, r[6] = p * _ + x * D + m * k + g * W, r[10] = p * T + x * F + m * X + g * Q, r[14] = p * I + x * V + m * H + g * ee, r[3] = M * b + E * R + v * L + A * te, r[7] = M * _ + E * D + v * k + A * W, r[11] = M * T + E * F + v * X + A * Q, r[15] = M * I + E * V + v * H + A * ee, this
    }
    multiplyScalar(e) {
        const t = this.elements;
        return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this
    }
    determinant() {
        const e = this.elements,
            t = e[0],
            n = e[4],
            i = e[8],
            r = e[12],
            a = e[1],
            o = e[5],
            l = e[9],
            c = e[13],
            h = e[2],
            u = e[6],
            d = e[10],
            f = e[14],
            p = e[3],
            x = e[7],
            m = e[11],
            g = e[15],
            M = l * f - c * d,
            E = o * f - c * u,
            v = o * d - l * u,
            A = a * f - c * h,
            b = a * d - l * h,
            _ = a * u - o * h;
        return t * (x * M - m * E + g * v) - n * (p * M - m * A + g * b) + i * (p * E - x * A + g * _) - r * (p * v - x * b + m * _)
    }
    determinantAffine() {
        const e = this.elements,
            t = e[0],
            n = e[4],
            i = e[8],
            r = e[1],
            a = e[5],
            o = e[9],
            l = e[2],
            c = e[6],
            h = e[10];
        return t * (a * h - o * c) - n * (r * h - o * l) + i * (r * c - a * l)
    }
    transpose() {
        const e = this.elements;
        let t;
        return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this
    }
    setPosition(e, t, n) {
        const i = this.elements;
        return e.isVector3 ? (i[12] = e.x, i[13] = e.y, i[14] = e.z) : (i[12] = e, i[13] = t, i[14] = n), this
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
            u = e[9],
            d = e[10],
            f = e[11],
            p = e[12],
            x = e[13],
            m = e[14],
            g = e[15],
            M = t * o - n * a,
            E = t * l - i * a,
            v = t * c - r * a,
            A = n * l - i * o,
            b = n * c - r * o,
            _ = i * c - r * l,
            T = h * x - u * p,
            I = h * m - d * p,
            R = h * g - f * p,
            D = u * m - d * x,
            F = u * g - f * x,
            V = d * g - f * m,
            L = M * V - E * F + v * D + A * R - b * I + _ * T;
        if (L === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const k = 1 / L;
        return e[0] = (o * V - l * F + c * D) * k, e[1] = (i * F - n * V - r * D) * k, e[2] = (x * _ - m * b + g * A) * k, e[3] = (d * b - u * _ - f * A) * k, e[4] = (l * R - a * V - c * I) * k, e[5] = (t * V - i * R + r * I) * k, e[6] = (m * v - p * _ - g * E) * k, e[7] = (h * _ - d * v + f * E) * k, e[8] = (a * F - o * R + c * T) * k, e[9] = (n * R - t * F - r * T) * k, e[10] = (p * b - x * v + g * M) * k, e[11] = (u * v - h * b - f * M) * k, e[12] = (o * I - a * D - l * T) * k, e[13] = (t * D - n * I + i * T) * k, e[14] = (x * E - p * A - m * M) * k, e[15] = (h * A - u * E + d * M) * k, this
    }
    scale(e) {
        const t = this.elements,
            n = e.x,
            i = e.y,
            r = e.z;
        return t[0] *= n, t[4] *= i, t[8] *= r, t[1] *= n, t[5] *= i, t[9] *= r, t[2] *= n, t[6] *= i, t[10] *= r, t[3] *= n, t[7] *= i, t[11] *= r, this
    }
    getMaxScaleOnAxis() {
        const e = this.elements,
            t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
            n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
            i = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
        return Math.sqrt(Math.max(t, n, i))
    }
    makeTranslation(e, t, n) {
        return e.isVector3 ? this.set(1, 0, 0, e.x, 0, 1, 0, e.y, 0, 0, 1, e.z, 0, 0, 0, 1) : this.set(1, 0, 0, e, 0, 1, 0, t, 0, 0, 1, n, 0, 0, 0, 1), this
    }
    makeRotationX(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(1, 0, 0, 0, 0, t, -n, 0, 0, n, t, 0, 0, 0, 0, 1), this
    }
    makeRotationY(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(t, 0, n, 0, 0, 1, 0, 0, -n, 0, t, 0, 0, 0, 0, 1), this
    }
    makeRotationZ(e) {
        const t = Math.cos(e),
            n = Math.sin(e);
        return this.set(t, -n, 0, 0, n, t, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this
    }
    makeRotationAxis(e, t) {
        const n = Math.cos(t),
            i = Math.sin(t),
            r = 1 - n,
            a = e.x,
            o = e.y,
            l = e.z,
            c = r * a,
            h = r * o;
        return this.set(c * a + n, c * o - i * l, c * l + i * o, 0, c * o + i * l, h * o + n, h * l - i * a, 0, c * l - i * o, h * l + i * a, r * l * l + n, 0, 0, 0, 0, 1), this
    }
    makeScale(e, t, n) {
        return this.set(e, 0, 0, 0, 0, t, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this
    }
    makeShear(e, t, n, i, r, a) {
        return this.set(1, n, r, 0, e, 1, a, 0, t, i, 1, 0, 0, 0, 0, 1), this
    }
    compose(e, t, n) {
        const i = this.elements,
            r = t._x,
            a = t._y,
            o = t._z,
            l = t._w,
            c = r + r,
            h = a + a,
            u = o + o,
            d = r * c,
            f = r * h,
            p = r * u,
            x = a * h,
            m = a * u,
            g = o * u,
            M = l * c,
            E = l * h,
            v = l * u,
            A = n.x,
            b = n.y,
            _ = n.z;
        return i[0] = (1 - (x + g)) * A, i[1] = (f + v) * A, i[2] = (p - E) * A, i[3] = 0, i[4] = (f - v) * b, i[5] = (1 - (d + g)) * b, i[6] = (m + M) * b, i[7] = 0, i[8] = (p + E) * _, i[9] = (m - M) * _, i[10] = (1 - (d + x)) * _, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this
    }
    decompose(e, t, n) {
        const i = this.elements;
        e.x = i[12], e.y = i[13], e.z = i[14];
        const r = this.determinantAffine();
        if (r === 0) return n.set(1, 1, 1), t.identity(), this;
        let a = gi.set(i[0], i[1], i[2]).length();
        const o = gi.set(i[4], i[5], i[6]).length(),
            l = gi.set(i[8], i[9], i[10]).length();
        r < 0 && (a = -a), nn.copy(this);
        const c = 1 / a,
            h = 1 / o,
            u = 1 / l;
        return nn.elements[0] *= c, nn.elements[1] *= c, nn.elements[2] *= c, nn.elements[4] *= h, nn.elements[5] *= h, nn.elements[6] *= h, nn.elements[8] *= u, nn.elements[9] *= u, nn.elements[10] *= u, t.setFromRotationMatrix(nn), n.x = a, n.y = o, n.z = l, this
    }
    makePerspective(e, t, n, i, r, a, o = cn, l = !1) {
        const c = this.elements,
            h = 2 * r / (t - e),
            u = 2 * r / (n - i),
            d = (t + e) / (t - e),
            f = (n + i) / (n - i);
        let p, x;
        if (l) p = r / (a - r), x = a * r / (a - r);
        else if (o === cn) p = -(a + r) / (a - r), x = -2 * a * r / (a - r);
        else if (o === Es) p = -a / (a - r), x = -a * r / (a - r);
        else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
        return c[0] = h, c[4] = 0, c[8] = d, c[12] = 0, c[1] = 0, c[5] = u, c[9] = f, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = p, c[14] = x, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this
    }
    makeOrthographic(e, t, n, i, r, a, o = cn, l = !1) {
        const c = this.elements,
            h = 2 / (t - e),
            u = 2 / (n - i),
            d = -(t + e) / (t - e),
            f = -(n + i) / (n - i);
        let p, x;
        if (l) p = 1 / (a - r), x = a / (a - r);
        else if (o === cn) p = -2 / (a - r), x = -(a + r) / (a - r);
        else if (o === Es) p = -1 / (a - r), x = -r / (a - r);
        else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
        return c[0] = h, c[4] = 0, c[8] = 0, c[12] = d, c[1] = 0, c[5] = u, c[9] = 0, c[13] = f, c[2] = 0, c[6] = 0, c[10] = p, c[14] = x, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this
    }
    equals(e) {
        const t = this.elements,
            n = e.elements;
        for (let i = 0; i < 16; i++)
            if (t[i] !== n[i]) return !1;
        return !0
    }
    fromArray(e, t = 0) {
        for (let n = 0; n < 16; n++) this.elements[n] = e[n + t];
        return this
    }
    toArray(e = [], t = 0) {
        const n = this.elements;
        return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e
    }
};
Dr.prototype.isMatrix4 = !0;
let We = Dr;
