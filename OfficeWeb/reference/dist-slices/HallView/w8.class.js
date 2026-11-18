class w8 {
    constructor(e, t) {
        if (this.renderer = e, this._pixelRatio = e.getPixelRatio(), t === void 0) {
            const s = e.getSize(new k0);
            this._width = s.width, this._height = s.height, t = new We(this._width * this._pixelRatio, this._height * this._pixelRatio, {
                type: T0
            }), t.texture.name = "EffectComposer.rt1"
        } else this._width = t.width, this._height = t.height;
        this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = !0, this.passes = [], this.copyPass = new C8(Tt), this.copyPass.material.blending = Ge, this.timer = new Hn
    }
    swapBuffers() {
        const e = this.readBuffer;
        this.readBuffer = this.writeBuffer, this.writeBuffer = e
    }
    addPass(e) {
        this.passes.push(e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
    }
    insertPass(e, t) {
        this.passes.splice(t, 0, e), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
    }
    removePass(e) {
        const t = this.passes.indexOf(e);
        t !== -1 && this.passes.splice(t, 1)
    }
    isLastEnabledPass(e) {
        for (let t = e + 1; t < this.passes.length; t++)
            if (this.passes[t].enabled) return !1;
        return !0
    }
    render(e) {
        this.timer.update(), e === void 0 && (e = this.timer.getDelta());
        const t = this.renderer.getRenderTarget();
        let s = !1;
        for (let i = 0, n = this.passes.length; i < n; i++) {
            const o = this.passes[i];
            if (o.enabled !== !1) {
                if (o.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i), o.render(this.renderer, this.writeBuffer, this.readBuffer, e, s), o.needsSwap) {
                    if (s) {
                        const a = this.renderer.getContext(),
                            l = this.renderer.state.buffers.stencil;
                        l.setFunc(a.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e), l.setFunc(a.EQUAL, 1, 4294967295)
                    }
                    this.swapBuffers()
                }
                c2 !== void 0 && (o instanceof c2 ? s = !0 : o instanceof y8 && (s = !1))
            }
        }
        this.renderer.setRenderTarget(t)
    }
    reset(e) {
        if (e === void 0) {
            const t = this.renderer.getSize(new k0);
            this._pixelRatio = this.renderer.getPixelRatio(), this._width = t.width, this._height = t.height, e = this.renderTarget1.clone(), e.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
        }
        this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2
    }
    setSize(e, t) {
        this._width = e, this._height = t;
        const s = this._width * this._pixelRatio,
            i = this._height * this._pixelRatio;
        this.renderTarget1.setSize(s, i), this.renderTarget2.setSize(s, i);
        for (let n = 0; n < this.passes.length; n++) this.passes[n].setSize(s, i)
    }
    setPixelRatio(e) {
        this._pixelRatio = e, this.setSize(this._width, this._height)
    }
    dispose() {
        this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose()
    }
}
