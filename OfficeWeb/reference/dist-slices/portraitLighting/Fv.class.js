class Fv extends Us {
    constructor(e, t, n = 10, i = 10) {
        super(e, t), this.isRectAreaLight = !0, this.type = "RectAreaLight", this.width = n, this.height = i
    }
    get power() {
        return this.intensity * this.width * this.height * Math.PI
    }
    set power(e) {
        this.intensity = e / (this.width * this.height * Math.PI)
    }
    copy(e) {
        return super.copy(e), this.width = e.width, this.height = e.height, this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.width = this.width, t.object.height = this.height, t
    }
}
