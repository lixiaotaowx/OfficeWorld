class Dh extends Yo {
    constructor(e = 1, t = 1, n = 32, i = 1, r = !1, a = 0, o = Math.PI * 2) {
        super(0, e, t, n, i, r, a, o), this.type = "ConeGeometry", this.parameters = {
            radius: e,
            height: t,
            radialSegments: n,
            heightSegments: i,
            openEnded: r,
            thetaStart: a,
            thetaLength: o
        }
    }
    static fromJSON(e) {
        return new Dh(e.radius, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength)
    }
}
