class Xo extends Zt {
    constructor(e) {
        super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Fe(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e)
    }
    copy(e) {
        return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this
    }
}
