class S8 extends dt {
    constructor() {
        super(), this.isOutputPass = !0, this.uniforms = fe.clone(K1.uniforms), this.material = new Jn({
            name: K1.name,
            uniforms: this.uniforms,
            vertexShader: K1.vertexShader,
            fragmentShader: K1.fragmentShader
        }), this._fsQuad = new L1(this.material), this._outputColorSpace = null, this._toneMapping = null
    }
    render(e, t, s) {
        this.uniforms.tDiffuse.value = s.texture, this.uniforms.toneMappingExposure.value = e.toneMappingExposure, (this._outputColorSpace !== e.outputColorSpace || this._toneMapping !== e.toneMapping) && (this._outputColorSpace = e.outputColorSpace, this._toneMapping = e.toneMapping, this.material.defines = {}, u4.getTransfer(this._outputColorSpace) === Kn && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === Xn ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === Zn ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === $n ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === B4 ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === e3 ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === x4 ? this.material.defines.NEUTRAL_TONE_MAPPING = "" : this._toneMapping === t3 && (this.material.defines.CUSTOM_TONE_MAPPING = ""), this.material.needsUpdate = !0), this.renderToScreen === !0 ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e))
    }
    dispose() {
        this.material.dispose(), this._fsQuad.dispose()
    }
}
