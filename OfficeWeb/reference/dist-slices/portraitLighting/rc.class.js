class rc extends Mf {
    constructor(e) {
        super(), this.type = "Path", this.currentPoint = new re, e && this.setFromPoints(e)
    }
    setFromPoints(e) {
        this.moveTo(e[0].x, e[0].y);
        for (let t = 1, n = e.length; t < n; t++) this.lineTo(e[t].x, e[t].y);
        return this
    }
    moveTo(e, t) {
        return this.currentPoint.set(e, t), this
    }
    lineTo(e, t) {
        const n = new Fh(this.currentPoint.clone(), new re(e, t));
        return this.curves.push(n), this.currentPoint.set(e, t), this
    }
    quadraticCurveTo(e, t, n, i) {
        const r = new Oh(this.currentPoint.clone(), new re(e, t), new re(n, i));
        return this.curves.push(r), this.currentPoint.set(n, i), this
    }
    bezierCurveTo(e, t, n, i, r, a) {
        const o = new Uh(this.currentPoint.clone(), new re(e, t), new re(n, i), new re(r, a));
        return this.curves.push(o), this.currentPoint.set(r, a), this
    }
    splineThru(e) {
        const t = [this.currentPoint.clone()].concat(e),
            n = new Bh(t);
        return this.curves.push(n), this.currentPoint.copy(e[e.length - 1]), this
    }
    arc(e, t, n, i, r, a) {
        const o = this.currentPoint.x,
            l = this.currentPoint.y;
        return this.absarc(e + o, t + l, n, i, r, a), this
    }
    absarc(e, t, n, i, r, a) {
        return this.absellipse(e, t, n, n, i, r, a), this
    }
    ellipse(e, t, n, i, r, a, o, l) {
        const c = this.currentPoint.x,
            h = this.currentPoint.y;
        return this.absellipse(e + c, t + h, n, i, r, a, o, l), this
    }
    absellipse(e, t, n, i, r, a, o, l) {
        const c = new Jo(e, t, n, i, r, a, o, l);
        if (this.curves.length > 0) {
            const u = c.getPoint(0);
            u.equals(this.currentPoint) || this.lineTo(u.x, u.y)
        }
        this.curves.push(c);
        const h = c.getPoint(1);
        return this.currentPoint.copy(h), this
    }
    copy(e) {
        return super.copy(e), this.currentPoint.copy(e.currentPoint), this
    }
    toJSON() {
        const e = super.toJSON();
        return e.currentPoint = this.currentPoint.toArray(), e
    }
    fromJSON(e) {
        return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this
    }
}
