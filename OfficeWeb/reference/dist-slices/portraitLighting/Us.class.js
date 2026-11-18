class Us extends gt {
    static registerNode(e) {
        this.prototype._lightNode = e
    }
    constructor(e, t = 1) {
        super(), this.isLight = !0, this.type = "Light", this.color = new Fe(e), this.intensity = t
    }
    copy(e, t) {
        return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, t
    }
}
