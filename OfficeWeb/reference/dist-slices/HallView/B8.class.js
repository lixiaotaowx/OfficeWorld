class B8 extends dt {
    constructor(e, t, s = null, i = null, n = null) {
        super(), this.scene = e, this.camera = t, this.overrideMaterial = s, this.clearColor = i, this.clearAlpha = n, this.clear = !0, this.clearDepth = !1, this.needsSwap = !1, this.isRenderPass = !0, this._oldClearColor = new be
    }
    render(e, t, s) {
        const i = e.autoClear;
        e.autoClear = !1;
        let n, o;
        this.overrideMaterial !== null && (o = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (e.getClearColor(this._oldClearColor), e.setClearColor(this.clearColor, e.getClearAlpha())), this.clearAlpha !== null && (n = e.getClearAlpha(), e.setClearAlpha(this.clearAlpha)), this.clearDepth == !0 && e.clearDepth(), e.setRenderTarget(this.renderToScreen ? null : s), this.clear === !0 && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), e.render(this.scene, this.camera), this.clearColor !== null && e.setClearColor(this._oldClearColor), this.clearAlpha !== null && e.setClearAlpha(n), this.overrideMaterial !== null && (this.scene.overrideMaterial = o), e.autoClear = i
    }
}
