class D8 {
    constructor(e, t, s) {
        m(this, "composer", null);
        m(this, "ao", null);
        m(this, "bloom", null);
        m(this, "environment", null);
        m(this, "quality", C5());
        this.renderer = e, this.scene = t, this.camera = s
    }
    prepare() {
        if (this.composer || this.quality === "standard") return;
        const e = new i3,
            t = new n3(this.renderer);
        try {
            this.environment = t.fromScene(e, .04), this.scene.environment = this.environment.texture, this.scene.environmentIntensity = .035
        } finally {
            e.dispose(), t.dispose()
        }
        const s = new We(1, 1, {
                type: T0,
                samples: 0
            }),
            i = new w8(this.renderer, s);
        this.composer = i, i.addPass(new B8(this.scene, this.camera)), this.ao = new Te(this.scene, this.camera), this.ao.updateGtaoMaterial({
            radius: .3,
            thickness: .2,
            samples: 16,
            scale: 1
        }), this.ao.blendIntensity = .65, i.addPass(this.ao), this.bloom = new t1(new k0(1, 1), .06, .35, 1.5), i.addPass(this.bloom), i.addPass(new S8), i.addPass(new M8)
    }
    resize(e, t) {
        var i, n;
        const s = T8(e, t, window.devicePixelRatio, this.quality);
        this.renderer.setPixelRatio(s), this.renderer.setSize(Math.max(1, e), Math.max(1, t), !1), (i = this.composer) == null || i.setPixelRatio(s), (n = this.composer) == null || n.setSize(Math.max(1, e), Math.max(1, t))
    }
    render(e, t = !0) {
        this.renderer.shadowMap.autoUpdate = !1, t && (this.renderer.shadowMap.needsUpdate = !0), this.ao && (this.ao.enabled = !e), this.bloom && (this.bloom.enabled = !e), this.composer ? this.composer.render() : this.renderer.render(this.scene, this.camera)
    }
    dispose() {
        var e, t, s;
        for (const i of ((e = this.composer) == null ? void 0 : e.passes) || []) i.dispose();
        (t = this.composer) == null || t.dispose(), this.composer = null, this.ao = null, this.bloom = null, this.scene.environment = null, (s = this.environment) == null || s.dispose(), this.environment = null
    }
}
