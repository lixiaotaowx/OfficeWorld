class Te extends dt {
    constructor(e, t, s = 512, i = 512, n, o, a) {
        super(), this.width = s, this.height = i, this.clear = !0, this.camera = t, this.scene = e, this.output = 0, this._renderGBuffer = !0, this._visibilityCache = [], this.blendIntensity = 1, this.pdRings = 2, this.pdRadiusExponent = 2, this.pdSamples = 16, this.gtaoNoiseTexture = x8(), this.pdNoiseTexture = this._generateNoise(), this.gtaoRenderTarget = new We(this.width, this.height, {
            type: T0,
            depthBuffer: !1
        }), this.pdRenderTarget = this.gtaoRenderTarget.clone(), this.gtaoMaterial = new Y0({
            defines: Object.assign({}, V1.defines),
            uniforms: fe.clone(V1.uniforms),
            vertexShader: V1.vertexShader,
            fragmentShader: V1.fragmentShader,
            blending: Ge,
            depthTest: !1,
            depthWrite: !1
        }), this.gtaoMaterial.defines.PERSPECTIVE_CAMERA = this.camera.isPerspectiveCamera ? 1 : 0, this.gtaoMaterial.uniforms.tNoise.value = this.gtaoNoiseTexture, this.gtaoMaterial.uniforms.resolution.value.set(this.width, this.height), this.gtaoMaterial.uniforms.cameraNear.value = this.camera.near, this.gtaoMaterial.uniforms.cameraFar.value = this.camera.far, this.normalMaterial = new jn, this.normalMaterial.blending = Ge, this.pdMaterial = new Y0({
            defines: Object.assign({}, J1.defines),
            uniforms: fe.clone(J1.uniforms),
            vertexShader: J1.vertexShader,
            fragmentShader: J1.fragmentShader,
            depthTest: !1,
            depthWrite: !1
        }), this.pdMaterial.uniforms.tDiffuse.value = this.gtaoRenderTarget.texture, this.pdMaterial.uniforms.tNoise.value = this.pdNoiseTexture, this.pdMaterial.uniforms.resolution.value.set(this.width, this.height), this.pdMaterial.uniforms.lumaPhi.value = 10, this.pdMaterial.uniforms.depthPhi.value = 2, this.pdMaterial.uniforms.normalPhi.value = 3, this.pdMaterial.uniforms.radius.value = 8, this.depthRenderMaterial = new Y0({
            defines: Object.assign({}, Y1.defines),
            uniforms: fe.clone(Y1.uniforms),
            vertexShader: Y1.vertexShader,
            fragmentShader: Y1.fragmentShader,
            blending: Ge
        }), this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near, this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far, this.copyMaterial = new Y0({
            uniforms: fe.clone(Tt.uniforms),
            vertexShader: Tt.vertexShader,
            fragmentShader: Tt.fragmentShader,
            transparent: !0,
            depthTest: !1,
            depthWrite: !1,
            blendSrc: Xi,
            blendDst: H1,
            blendEquation: O1,
            blendSrcAlpha: Ki,
            blendDstAlpha: H1,
            blendEquationAlpha: O1
        }), this.blendMaterial = new Y0({
            uniforms: fe.clone(As.uniforms),
            vertexShader: As.vertexShader,
            fragmentShader: As.fragmentShader,
            transparent: !0,
            depthTest: !1,
            depthWrite: !1,
            blending: qn,
            blendSrc: Xi,
            blendDst: H1,
            blendEquation: O1,
            blendSrcAlpha: Ki,
            blendDstAlpha: H1,
            blendEquationAlpha: O1
        }), this._fsQuad = new L1(null), this._originalClearColor = new be, this.setGBuffer(n ? n.depthTexture : void 0, n ? n.normalTexture : void 0), o !== void 0 && this.updateGtaoMaterial(o), a !== void 0 && this.updatePdMaterial(a)
    }
    setSize(e, t) {
        this.width = e, this.height = t, this.gtaoRenderTarget.setSize(e, t), this.normalRenderTarget && this.normalRenderTarget.setSize(e, t), this.pdRenderTarget.setSize(e, t), this.gtaoMaterial.uniforms.resolution.value.set(e, t), this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix), this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse), this.pdMaterial.uniforms.resolution.value.set(e, t), this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse)
    }
    dispose() {
        this.gtaoNoiseTexture.dispose(), this.pdNoiseTexture.dispose(), this.normalRenderTarget && this.normalRenderTarget.dispose(), this.gtaoRenderTarget.dispose(), this.pdRenderTarget.dispose(), this.normalMaterial.dispose(), this.pdMaterial.dispose(), this.copyMaterial.dispose(), this.depthRenderMaterial.dispose(), this._fsQuad.dispose()
    }
    get gtaoMap() {
        return this.pdRenderTarget.texture
    }
    setGBuffer(e, t) {
        if (e !== void 0) this.depthTexture = e, this.normalTexture = t, this._renderGBuffer = !1;
        else {
            if (this.normalRenderTarget === void 0) {
                const i = new Wn;
                i.format = Vn, i.type = Yn, this.normalRenderTarget = new We(this.width, this.height, {
                    minFilter: xe,
                    magFilter: xe,
                    type: T0,
                    depthTexture: i
                })
            }
            this.depthTexture = this.normalRenderTarget.depthTexture, this.normalTexture = this.normalRenderTarget.texture, this._renderGBuffer = !0
        }
        const s = this.normalTexture ? 1 : 0;
        this.gtaoMaterial.defines.NORMAL_VECTOR_TYPE = s, this.gtaoMaterial.needsUpdate = !0, this.gtaoMaterial.uniforms.tNormal.value = this.normalTexture, this.gtaoMaterial.uniforms.tDepth.value = this.depthTexture, this.pdMaterial.defines.NORMAL_VECTOR_TYPE = s, this.pdMaterial.needsUpdate = !0, this.pdMaterial.uniforms.tNormal.value = this.normalTexture, this.pdMaterial.uniforms.tDepth.value = this.depthTexture, this.depthRenderMaterial.uniforms.tDepth.value = this.depthTexture
    }
    setSceneClipBox(e) {
        e ? (this.gtaoMaterial.needsUpdate = this.gtaoMaterial.defines.SCENE_CLIP_BOX !== 1, this.gtaoMaterial.defines.SCENE_CLIP_BOX = 1, this.gtaoMaterial.uniforms.sceneBoxMin.value.copy(e.min), this.gtaoMaterial.uniforms.sceneBoxMax.value.copy(e.max)) : (this.gtaoMaterial.needsUpdate = this.gtaoMaterial.defines.SCENE_CLIP_BOX === 0, this.gtaoMaterial.defines.SCENE_CLIP_BOX = 0)
    }
    updateGtaoMaterial(e) {
        e.radius !== void 0 && (this.gtaoMaterial.uniforms.radius.value = e.radius), e.distanceExponent !== void 0 && (this.gtaoMaterial.uniforms.distanceExponent.value = e.distanceExponent), e.thickness !== void 0 && (this.gtaoMaterial.uniforms.thickness.value = e.thickness), e.distanceFallOff !== void 0 && (this.gtaoMaterial.uniforms.distanceFallOff.value = e.distanceFallOff, this.gtaoMaterial.needsUpdate = !0), e.scale !== void 0 && (this.gtaoMaterial.uniforms.scale.value = e.scale), e.samples !== void 0 && e.samples !== this.gtaoMaterial.defines.SAMPLES && (this.gtaoMaterial.defines.SAMPLES = e.samples, this.gtaoMaterial.needsUpdate = !0), e.screenSpaceRadius !== void 0 && (e.screenSpaceRadius ? 1 : 0) !== this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS && (this.gtaoMaterial.defines.SCREEN_SPACE_RADIUS = e.screenSpaceRadius ? 1 : 0, this.gtaoMaterial.needsUpdate = !0)
    }
    updatePdMaterial(e) {
        let t = !1;
        e.lumaPhi !== void 0 && (this.pdMaterial.uniforms.lumaPhi.value = e.lumaPhi), e.depthPhi !== void 0 && (this.pdMaterial.uniforms.depthPhi.value = e.depthPhi), e.normalPhi !== void 0 && (this.pdMaterial.uniforms.normalPhi.value = e.normalPhi), e.radius !== void 0 && e.radius !== this.radius && (this.pdMaterial.uniforms.radius.value = e.radius), e.radiusExponent !== void 0 && e.radiusExponent !== this.pdRadiusExponent && (this.pdRadiusExponent = e.radiusExponent, t = !0), e.rings !== void 0 && e.rings !== this.pdRings && (this.pdRings = e.rings, t = !0), e.samples !== void 0 && e.samples !== this.pdSamples && (this.pdSamples = e.samples, t = !0), t && (this.pdMaterial.defines.SAMPLES = this.pdSamples, this.pdMaterial.defines.SAMPLE_VECTORS = E5(this.pdSamples, this.pdRings, this.pdRadiusExponent), this.pdMaterial.needsUpdate = !0)
    }
    render(e, t, s) {
        switch (this._renderGBuffer && (this._overrideVisibility(), this._renderOverride(e, this.normalMaterial, this.normalRenderTarget, 7829503, 1), this._restoreVisibility()), this.gtaoMaterial.uniforms.cameraNear.value = this.camera.near, this.gtaoMaterial.uniforms.cameraFar.value = this.camera.far, this.gtaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix), this.gtaoMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse), this.gtaoMaterial.uniforms.cameraWorldMatrix.value.copy(this.camera.matrixWorld), this._renderPass(e, this.gtaoMaterial, this.gtaoRenderTarget, 16777215, 1), this.pdMaterial.uniforms.cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse), this._renderPass(e, this.pdMaterial, this.pdRenderTarget, 16777215, 1), this.output) {
            case Te.OUTPUT.Off:
                break;
            case Te.OUTPUT.Diffuse:
                this.copyMaterial.uniforms.tDiffuse.value = s.texture, this.copyMaterial.blending = Ge, this._renderPass(e, this.copyMaterial, this.renderToScreen ? null : t);
                break;
            case Te.OUTPUT.AO:
                this.copyMaterial.uniforms.tDiffuse.value = this.gtaoRenderTarget.texture, this.copyMaterial.blending = Ge, this._renderPass(e, this.copyMaterial, this.renderToScreen ? null : t);
                break;
            case Te.OUTPUT.Denoise:
                this.copyMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture, this.copyMaterial.blending = Ge, this._renderPass(e, this.copyMaterial, this.renderToScreen ? null : t);
                break;
            case Te.OUTPUT.Depth:
                this.depthRenderMaterial.uniforms.cameraNear.value = this.camera.near, this.depthRenderMaterial.uniforms.cameraFar.value = this.camera.far, this._renderPass(e, this.depthRenderMaterial, this.renderToScreen ? null : t);
                break;
            case Te.OUTPUT.Normal:
                this.copyMaterial.uniforms.tDiffuse.value = this.normalTexture || null, this.copyMaterial.blending = Ge, this._renderPass(e, this.copyMaterial, this.renderToScreen ? null : t);
                break;
            case Te.OUTPUT.Default:
                this.copyMaterial.uniforms.tDiffuse.value = s.texture, this.copyMaterial.blending = Ge, this._renderPass(e, this.copyMaterial, this.renderToScreen ? null : t), this.blendMaterial.uniforms.intensity.value = this.blendIntensity, this.blendMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture, this._renderPass(e, this.blendMaterial, this.renderToScreen ? null : t);
                break;
            default:
                console.warn("THREE.GTAOPass: Unknown output type.")
        }
    }
    _renderPass(e, t, s, i, n) {
        e.getClearColor(this._originalClearColor);
        const o = e.getClearAlpha(),
            a = e.autoClear;
        e.setRenderTarget(s), e.autoClear = !1, i != null && (e.setClearColor(i), e.setClearAlpha(n || 0), e.clear()), this._fsQuad.material = t, this._fsQuad.render(e), e.autoClear = a, e.setClearColor(this._originalClearColor), e.setClearAlpha(o)
    }
    _renderOverride(e, t, s, i, n) {
        e.getClearColor(this._originalClearColor);
        const o = e.getClearAlpha(),
            a = e.autoClear;
        e.setRenderTarget(s), e.autoClear = !1, i = t.clearColor || i, n = t.clearAlpha || n, i != null && (e.setClearColor(i), e.setClearAlpha(n || 0), e.clear()), this.scene.overrideMaterial = t, e.render(this.scene, this.camera), this.scene.overrideMaterial = null, e.autoClear = a, e.setClearColor(this._originalClearColor), e.setClearAlpha(o)
    }
    _overrideVisibility() {
        const e = this.scene,
            t = this._visibilityCache;
        e.traverse(function(s) {
            (s.isPoints || s.isLine || s.isLine2) && s.visible && (s.visible = !1, t.push(s))
        })
    }
    _restoreVisibility() {
        const e = this._visibilityCache;
        for (let t = 0; t < e.length; t++) e[t].visible = !0;
        e.length = 0
    }
    _generateNoise(e = 64) {
        const t = new Q8,
            s = e * e * 4,
            i = new Uint8Array(s);
        for (let o = 0; o < e; o++)
            for (let a = 0; a < e; a++) {
                const l = o,
                    A = a;
                i[(o * e + a) * 4] = (t.noise(l, A) * .5 + .5) * 255, i[(o * e + a) * 4 + 1] = (t.noise(l + e, A) * .5 + .5) * 255, i[(o * e + a) * 4 + 2] = (t.noise(l, A + e) * .5 + .5) * 255, i[(o * e + a) * 4 + 3] = (t.noise(l + e, A + e) * .5 + .5) * 255
            }
        const n = new De(i, e, e, ne, s0);
        return n.wrapS = e1, n.wrapT = e1, n.needsUpdate = !0, n
    }
}
Te.OUTPUT = {
    Off: -1,
    Default: 0,
    Diffuse: 1,
    Depth: 2,
    Normal: 3,
    AO: 4,
    Denoise: 5
};
