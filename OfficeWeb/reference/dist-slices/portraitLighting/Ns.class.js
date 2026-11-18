class Ns {
    constructor(e) {
        this._renderer = e, this._cubeSize = 0, this._sourceTarget = null, this._cubeCamera = new So(1, 10, null), this._boxMesh = new At(new qi(5, 5, 5), null), this._cubemapMaterial = null, this._equirectMaterial = null, this._blurMaterial = null, this._ggxMaterial = null, this._integrationMaterial = null
    }
    fromScene(e, t = 0, n = .1, i = 100, r = {}) {
        const {
            size: a = 256,
            position: o = y_
        } = r, l = this._renderer;
        this._setSize(a);
        const c = this._allocateTarget(),
            h = this._getSourceTarget(!0);
        t > 0 && (h.texture.mipmapsAutoUpdate = !1);
        const u = l.autoClear,
            d = l.autoClearColor,
            f = l.autoClearDepth,
            p = l.autoClearStencil,
            x = e.background;
        l.autoClear = !0, l.autoClearColor = !0, l.autoClearDepth = !0, l.autoClearStencil = !0, x === null && (e.background = l.getClearColor(T_));
        const m = new So(n, i, h);
        return m.position.copy(o), m.update(l, e), l.autoClear = u, l.autoClearColor = d, l.autoClearDepth = f, l.autoClearStencil = p, e.background = x, t > 0 && (h.texture.mipmapsAutoUpdate = !0, this._blur(c, t)), this._applyPMREM(c), c
    }
    fromEquirectangular(e, t = null) {
        return this._fromTexture(e, t)
    }
    fromCubemap(e, t = null) {
        return this._fromTexture(e, t)
    }
    compileCubemapShader() {
        this._cubemapMaterial === null && (this._cubemapMaterial = Ec(), this._compileMaterial(this._cubemapMaterial))
    }
    compileEquirectangularShader() {
        this._equirectMaterial === null && (this._equirectMaterial = Tc(), this._compileMaterial(this._equirectMaterial))
    }
    dispose() {
        this._sourceTarget !== null && this._sourceTarget.dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose(), this._blurMaterial !== null && this._blurMaterial.dispose(), this._ggxMaterial !== null && this._ggxMaterial.dispose(), this._integrationMaterial !== null && this._integrationMaterial.dispose(), this._boxMesh.geometry.dispose()
    }
    static lodToRoughness(e, t) {
        return t > 0 ? 1 - Math.sqrt(1 - e / t) : 0
    }
    _setSize(e) {
        this._cubeSize = Math.max(Sc, vh(e))
    }
    _fromTexture(e, t) {
        e.mapping === hi || e.mapping === Ms ? this._setSize(e.image.length === 0 ? Sc : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4);
        const n = t || this._allocateTarget();
        return this._textureToCubemap(e), this._applyPMREM(n), n
    }
    _allocateTarget() {
        const e = this._cubeSize,
            t = yc(e, !1, !1),
            n = Math.log2(e) - v_;
        for (let i = 0; i <= n; i++) t.texture.mipmaps.push({
            width: e >> i,
            height: e >> i
        });
        return t.texture.name = "PMREM", t.texture.isPMREMTexture = !0, t
    }
    _getSourceTarget(e = !1) {
        const t = this._cubeSize,
            n = this._sourceTarget;
        return (n === null || n.width !== t || e && n.depthBuffer === !1) && (n !== null && n.dispose(), this._sourceTarget = yc(t, !0, e)), this._sourceTarget
    }
    _compileMaterial(e) {
        this._boxMesh.material = e, this._renderer.compile(this._boxMesh, this._cubeCamera.children[0])
    }
    _renderCube(e, t, n) {
        const i = this._boxMesh,
            r = this._cubeCamera;
        i.material = n, r.renderTarget = e, r.activeMipmapLevel = t;
        const a = e.width >> t;
        e.viewport.set(0, 0, a, a), r.update(this._renderer, i), e.viewport.set(0, 0, e.width, e.height)
    }
    _textureToCubemap(e) {
        let t;
        e.mapping === hi || e.mapping === Ms ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ec()), t = this._cubemapMaterial, t.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : (this._equirectMaterial === null && (this._equirectMaterial = Tc()), t = this._equirectMaterial), t.uniforms.envMap.value = e, this._renderCube(this._getSourceTarget(), 0, t)
    }
    _applyPMREM(e) {
        this._ggxMaterial === null && (this._ggxMaterial = E_(), this._integrationMaterial = b_());
        const t = this._cubeSize,
            n = e.texture.mipmaps.length - 1,
            i = this._ggxMaterial.uniforms;
        i.envMap.value = this._sourceTarget.texture;
        const r = this._integrationMaterial.uniforms;
        r.envMap.value = this._sourceTarget.texture, r.sourceLod.value = Math.log2(t / iu);
        for (let a = 0; a <= n; a++) {
            const o = Ns.lodToRoughness(a, n);
            if (a > n - S_) r.roughness.value = o, this._renderCube(e, a, this._integrationMaterial);
            else {
                const l = o > 0 ? Math.log2(t) + .5 * Math.log2(6 / (nu * Math.pow(o, 4))) + .5 : 0;
                i.roughness.value = o, i.lodBias.value = l, this._renderCube(e, a, this._ggxMaterial)
            }
        }
    }
    _blur(e, t) {
        this._blurMaterial === null && (this._blurMaterial = A_());
        const n = this._blurMaterial,
            i = n.uniforms,
            r = this._sourceTarget;
        i.sigma.value = Math.min(t, Math.PI) / Math.SQRT2, i.envMap.value = r.texture, this._renderCube(e, 0, n), i.envMap.value = e.texture, this._renderCube(r, 0, n)
    }
}

