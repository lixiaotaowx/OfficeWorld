class v5 {
    constructor() {
        m(this, "boxes", []);
        m(this, "grid", new Map);
        m(this, "stamp", new Uint32Array(0));
        m(this, "stampN", 0);
        m(this, "last", [])
    }
    set(e) {
        this.boxes = e, this.grid.clear(), this.stamp = new Uint32Array(e.length), e.forEach((t, s) => {
            for (let i = Math.floor(t.x0 / rt); i <= Math.floor(t.x1 / rt); i++)
                for (let n = Math.floor(t.z0 / rt); n <= Math.floor(t.z1 / rt); n++) {
                    const o = i * 4096 + n;
                    let a = this.grid.get(o);
                    a || this.grid.set(o, a = []), a.push(s)
                }
        })
    }
    get list() {
        return this.boxes
    }
    near(e, t, s, i, n, o) {
        const a = [],
            l = Math.min(e, s) - .02,
            A = Math.max(e, s) + .02,
            c = Math.min(t, i) - .02,
            h = Math.max(t, i) + .02;
        this.stampN++;
        for (let u = Math.floor(l / rt); u <= Math.floor(A / rt); u++)
            for (let d = Math.floor(c / rt); d <= Math.floor(h / rt); d++)
                for (const g of this.grid.get(u * 4096 + d) || []) {
                    if (this.stamp[g] === this.stampN) continue;
                    this.stamp[g] = this.stampN;
                    const p = this.boxes[g];
                    p.x1 < l || p.x0 > A || p.z1 < c || p.z0 > h || p.y1 < n || p.y0 > o || a.push(g)
                }
        return this.last = a, a
    }
    groundAt(e, t, s) {
        let i = null;
        for (const n of this.near(e, t, e, t, -99, s)) {
            const o = this.boxes[n];
            e < o.x0 - .03 || e > o.x1 + .03 || t < o.z0 - .03 || t > o.z1 + .03 || o.y1 > s + .001 || !o.water && (i === null || o.y1 > i) && (i = o.y1)
        }
        return i !== null && this.waterAt(e, t, i) ? null : i
    }
    waterAt(e, t, s) {
        return this.near(e - M0, t - M0, e + M0, t + M0, s - .05, s + Kt).some(i => {
            const n = this.boxes[i];
            return n.water && s <= n.y1 + .05 && s >= n.y0 - .5
        })
    }
    blocksAt(e, t, s) {
        const i = M0 - .02;
        return this.waterAt(e, t, s) || this.near(e - i, t - i, e + i, t + i, s + P0 + .01, s + Kt).length > 0
    }
    canJump(e, t, s) {
        const i = this.groundAt(t, s, e.y + g2 + .05);
        return i === null || i <= e.y + P0 || i > e.y + g2 + .001 || this.blocksAt(t, s, i) || this.near(e.x - M0, e.z - M0, e.x + M0, e.z + M0, e.y + Kt, i + Kt).length ? null : i
    }
}

