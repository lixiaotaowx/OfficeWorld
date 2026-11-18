class Ds {
    constructor(e = new N, t = new N(0, 0, -1)) {
        this.origin = e, this.direction = t
    }
    set(e, t) {
        return this.origin.copy(e), this.direction.copy(t), this
    }
    copy(e) {
        return this.origin.copy(e.origin), this.direction.copy(e.direction), this
    }
    at(e, t) {
        return t.copy(this.origin).addScaledVector(this.direction, e)
    }
    lookAt(e) {
        return this.direction.copy(e).sub(this.origin).normalize(), this
    }
    recast(e) {
        return this.origin.copy(this.at(e, Pn)), this
    }
    closestPointToPoint(e, t) {
        t.subVectors(e, this.origin);
        const n = t.dot(this.direction);
        return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n)
    }
    distanceToPoint(e) {
        return Math.sqrt(this.distanceSqToPoint(e))
    }
    distanceSqToPoint(e) {
        const t = Pn.subVectors(e, this.origin).dot(this.direction);
        return t < 0 ? this.origin.distanceToSquared(e) : (Pn.copy(this.origin).addScaledVector(this.direction, t), Pn.distanceToSquared(e))
    }
    distanceSqToSegment(e, t, n, i) {
        ua.copy(e).add(t).multiplyScalar(.5), qs.copy(t).sub(e).normalize(), Ys.copy(this.origin).sub(ua);
        const r = e.distanceTo(t) * .5,
            a = -this.direction.dot(qs),
            o = Ys.dot(this.direction),
            l = -Ys.dot(qs),
            c = Ys.lengthSq(),
            h = Math.abs(1 - a * a);
        let u, d, f, p;
        if (h > 0)
            if (u = a * l - o, d = a * o - l, p = r * h, u >= 0)
                if (d >= -p)
                    if (d <= p) {
                        const x = 1 / h;
                        u *= x, d *= x, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * l) + c
                    } else d = r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        else d = -r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        else d <= -p ? (u = Math.max(0, -(-a * r + o)), d = u > 0 ? -r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c) : d <= p ? (u = 0, d = Math.min(Math.max(-r, -l), r), f = d * (d + 2 * l) + c) : (u = Math.max(0, -(a * r + o)), d = u > 0 ? r : Math.min(Math.max(-r, -l), r), f = -u * u + d * (d + 2 * l) + c);
        else d = a > 0 ? -r : r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * l) + c;
        return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(ua).addScaledVector(qs, d), f
    }
    intersectSphere(e, t) {
        if (e.radius < 0) return null;
        Pn.subVectors(e.center, this.origin);
        const n = Pn.dot(this.direction),
            i = Pn.dot(Pn) - n * n,
            r = e.radius * e.radius;
        if (i > r) return null;
        const a = Math.sqrt(r - i),
            o = n - a,
            l = n + a;
        return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t)
    }
    intersectsSphere(e) {
        return e.radius < 0 ? !1 : this.distanceSqToPoint(e.center) <= e.radius * e.radius
    }
    distanceToPlane(e) {
        const t = e.normal.dot(this.direction);
        if (t === 0) return e.distanceToPoint(this.origin) === 0 ? 0 : null;
        const n = -(this.origin.dot(e.normal) + e.constant) / t;
        return n >= 0 ? n : null
    }
    intersectPlane(e, t) {
        const n = this.distanceToPlane(e);
        return n === null ? null : this.at(n, t)
    }
    intersectsPlane(e) {
        const t = e.distanceToPoint(this.origin);
        return t === 0 || e.normal.dot(this.direction) * t < 0
    }
    intersectBox(e, t) {
        let n, i, r, a, o, l;
        const c = 1 / this.direction.x,
            h = 1 / this.direction.y,
            u = 1 / this.direction.z,
            d = this.origin;
        return c >= 0 ? (n = (e.min.x - d.x) * c, i = (e.max.x - d.x) * c) : (n = (e.max.x - d.x) * c, i = (e.min.x - d.x) * c), h >= 0 ? (r = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (r = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), n > a || r > i || ((r > n || isNaN(n)) && (n = r), (a < i || isNaN(i)) && (i = a), u >= 0 ? (o = (e.min.z - d.z) * u, l = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, l = (e.min.z - d.z) * u), n > l || o > i) || ((o > n || n !== n) && (n = o), (l < i || i !== i) && (i = l), i < 0) ? null : this.at(n >= 0 ? n : i, t)
    }
    intersectsBox(e) {
        return this.intersectBox(e, Pn) !== null
    }
    intersectTriangle(e, t, n, i, r) {
        const a = this.origin,
            o = this.direction,
            l = o.x,
            c = o.y,
            h = o.z,
            u = e.x - a.x,
            d = e.y - a.y,
            f = e.z - a.z,
            p = t.x - a.x,
            x = t.y - a.y,
            m = t.z - a.z,
            g = n.x - a.x,
            M = n.y - a.y,
            E = n.z - a.z,
            v = Math.abs(l),
            A = Math.abs(c),
            b = Math.abs(h);
        let _, T, I, R, D, F, V, L, k, X, H, te;
        if (v >= A && v >= b ? (I = l, F = u, k = p, te = g, l >= 0 ? (_ = c, T = h, R = d, D = f, V = x, L = m, X = M, H = E) : (_ = h, T = c, R = f, D = d, V = m, L = x, X = E, H = M)) : A >= b ? (I = c, F = d, k = x, te = M, c >= 0 ? (_ = h, T = l, R = f, D = u, V = m, L = p, X = E, H = g) : (_ = l, T = h, R = u, D = f, V = p, L = m, X = g, H = E)) : (I = h, F = f, k = m, te = E, h >= 0 ? (_ = l, T = c, R = u, D = d, V = p, L = x, X = g, H = M) : (_ = c, T = l, R = d, D = u, V = x, L = p, X = M, H = g)), I === 0) return null;
        const W = _ / I,
            Q = T / I,
            ee = 1 / I,
            Te = R - W * F,
            Oe = D - Q * F,
            Y = V - W * k,
            _e = L - Q * k,
            Ee = X - W * te,
            Ne = H - Q * te,
            xe = Ee * _e - Ne * Y,
            De = Te * Ne - Oe * Ee,
            mt = Y * Oe - _e * Te;
        if (i) {
            if (xe < 0 || De < 0 || mt < 0) return null
        } else if ((xe < 0 || De < 0 || mt < 0) && (xe > 0 || De > 0 || mt > 0)) return null;
        const Be = xe + De + mt;
        if (Be === 0) return null;
        const Je = ee * (xe * F + De * k + mt * te);
        return (Be > 0 ? Je < 0 : Je > 0) ? null : this.at(Je / Be, r)
    }
    applyMatrix4(e) {
        return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this
    }
    equals(e) {
        return e.origin.equals(this.origin) && e.direction.equals(this.direction)
    }
    clone() {
        return new this.constructor().copy(this)
    }
}
