class C8 extends dt {
    constructor(e, t = "tDiffuse") {
        super(), this.textureID = t, this.uniforms = null, this.material = null, e instanceof Y0 ? (this.uniforms = e.uniforms, this.material = e) : e && (this.uniforms = fe.clone(e.uniforms), this.material = new Y0({
            name: e.name !== void 0 ? e.name : "unspecified",
            defines: Object.assign({}, e.defines),
            uniforms: this.uniforms,
            vertexShader: e.vertexShader,
            fragmentShader: e.fragmentShader
        })), this._fsQuad = new L1(this.material)
    }
    render(e, t, s) {
        this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = s.texture), this._fsQuad.material = this.material, this.renderToScreen ? (e.setRenderTarget(null), this._fsQuad.render(e)) : (e.setRenderTarget(t), this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil), this._fsQuad.render(e))
    }
    dispose() {
        this.material.dispose(), this._fsQuad.dispose()
    }
}
