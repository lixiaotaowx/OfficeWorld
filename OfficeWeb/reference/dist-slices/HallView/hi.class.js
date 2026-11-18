class hi extends U0 {
    constructor(e = 1, t = 1, s = 1, i = 2, n = .1) {
        const o = i * 2 + 1;
        if (n = Math.min(e / 2, t / 2, s / 2, n), super(1, 1, 1, o, o, o), this.type = "RoundedBoxGeometry", this.parameters = {
                width: e,
                height: t,
                depth: s,
                segments: i,
                radius: n
            }, o === 1) return;
        const a = this.toNonIndexed();
        this.index = null, this.attributes.position = a.attributes.position, this.attributes.normal = a.attributes.normal, this.attributes.uv = a.attributes.uv;
        const l = new T,
            A = new T,
            c = new T(e, t, s).divideScalar(2).subScalar(n),
            h = this.attributes.position.array,
            u = this.attributes.normal.array,
            d = this.attributes.uv.array,
            g = h.length / 6,
            p = new T,
            I = .5 / o;
        for (let C = 0, E = 0; C < h.length; C += 3, E += 2) switch (l.fromArray(h, C), A.copy(l), A.x -= Math.sign(A.x) * I, A.y -= Math.sign(A.y) * I, A.z -= Math.sign(A.z) * I, A.normalize(), h[C + 0] = c.x * Math.sign(l.x) + A.x * n, h[C + 1] = c.y * Math.sign(l.y) + A.y * n, h[C + 2] = c.z * Math.sign(l.z) + A.z * n, u[C + 0] = A.x, u[C + 1] = A.y, u[C + 2] = A.z, Math.floor(C / g)) {
            case 0:
                p.set(1, 0, 0), d[E + 0] = ce(p, A, "z", "y", n, s), d[E + 1] = 1 - ce(p, A, "y", "z", n, t);
                break;
            case 1:
                p.set(-1, 0, 0), d[E + 0] = 1 - ce(p, A, "z", "y", n, s), d[E + 1] = 1 - ce(p, A, "y", "z", n, t);
                break;
            case 2:
                p.set(0, 1, 0), d[E + 0] = 1 - ce(p, A, "x", "z", n, e), d[E + 1] = ce(p, A, "z", "x", n, s);
                break;
            case 3:
                p.set(0, -1, 0), d[E + 0] = 1 - ce(p, A, "x", "z", n, e), d[E + 1] = 1 - ce(p, A, "z", "x", n, s);
                break;
            case 4:
                p.set(0, 0, 1), d[E + 0] = 1 - ce(p, A, "x", "y", n, e), d[E + 1] = 1 - ce(p, A, "y", "x", n, t);
                break;
            case 5:
                p.set(0, 0, -1), d[E + 0] = ce(p, A, "x", "y", n, e), d[E + 1] = 1 - ce(p, A, "y", "x", n, t);
                break
        }
    }
    static fromJSON(e) {
        return new hi(e.width, e.height, e.depth, e.segments, e.radius)
    }
}

