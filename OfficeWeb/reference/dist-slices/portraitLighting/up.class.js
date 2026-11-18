class up extends Us {
    constructor(e, t, n) {
        super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(gt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Fe(t)
    }
    copy(e, t) {
        return super.copy(e, t), this.groundColor.copy(e.groundColor), this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.groundColor = this.groundColor.getHex(), t
    }
}
