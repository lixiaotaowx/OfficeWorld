class fp extends Us {
    constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
        super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(gt.DEFAULT_UP), this.updateMatrix(), this.target = new gt, this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new dp
    }
    get power() {
        return this.intensity * Math.PI
    }
    set power(e) {
        this.intensity = e / Math.PI
    }
    dispose() {
        super.dispose(), this.shadow.dispose()
    }
    copy(e, t) {
        return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.map = e.map, this.shadow = e.shadow.clone(), this
    }
    toJSON(e) {
        const t = super.toJSON(e);
        return t.object.distance = this.distance, t.object.angle = this.angle, t.object.decay = this.decay, t.object.penumbra = this.penumbra, t.object.target = this.target.uuid, this.map && this.map.isTexture && (t.object.map = this.map.toJSON(e).uuid), t.object.shadow = this.shadow.toJSON(), t
    }
}
