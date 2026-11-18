class Iv extends Lh {
    constructor(e, t, n, i, r, a) {
        super(e, t, n, r, a), this.isCompressedArrayTexture = !0, this.image.depth = i, this.wrapR = on, this.layerUpdates = new Set
    }
    copy(e) {
        return super.copy(e), this.wrapR = e.wrapR, this
    }
    addLayerUpdate(e) {
        this.layerUpdates.add(e)
    }
    clearLayerUpdates() {
        this.layerUpdates.clear()
    }
}
