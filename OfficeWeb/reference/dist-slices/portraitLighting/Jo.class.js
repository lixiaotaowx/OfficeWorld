class Jo extends bn {
    constructor(e = 0, t = 0, n = 1, i = 1, r = 0, a = Math.PI * 2, o = !1, l = 0) {
        super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = n, this.yRadius = i, this.aStartAngle = r, this.aEndAngle = a, this.aClockwise = o, this.aRotation = l
    }
    getPoint(e, t = new re) {
        const n = t,
            i = Math.PI * 2;
        let r = this.aEndAngle - this.aStartAngle;
        const a = Math.abs(r) < Number.EPSILON;
        for (; r < 0;) r += i;
        for (; r > i;) r -= i;
        r < Number.EPSILON && (a ? r = 0 : r = i), this.aClockwise === !0 && !a && (r === i ? r = -i : r = r - i);
        const o = this.aStartAngle + e * r;
        let l = this.aX + this.xRadius * Math.cos(o),
            c = this.aY + this.yRadius * Math.sin(o);
        if (this.aRotation !== 0) {
            const h = Math.cos(this.aRotation),
                u = Math.sin(this.aRotation),
                d = l - this.aX,
                f = c - this.aY;
            l = d * h - f * u + this.aX, c = d * u + f * h + this.aY
        }
        return n.set(l, c)
    }
    copy(e) {
        return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this
    }
    toJSON() {
        const e = super.toJSON();
        return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e
    }
    fromJSON(e) {
        return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this
    }
}
