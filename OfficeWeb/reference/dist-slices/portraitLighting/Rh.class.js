class Rh extends qo {
    constructor(e, t) {
        super(e, t), this.isLineSegments = !0, this.type = "LineSegments"
    }
    computeLineDistances() {
        const e = this.geometry;
        if (e.index === null) {
            const t = e.attributes.position,
                n = [];
            for (let i = 0, r = t.count; i < r; i += 2) Ql.fromBufferAttribute(t, i), jl.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Ql.distanceTo(jl);
            e.setAttribute("lineDistance", new ut(n, 1))
        } else Ce("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this
    }
}
