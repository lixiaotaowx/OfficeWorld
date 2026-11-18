class j8 {
    constructor(e) {
        m(this, "group", new E0);
        m(this, "panels", []);
        m(this, "glow", new Ie({
            color: "#fff0d5",
            emissive: "#ffc985",
            emissiveIntensity: 1.4,
            roughness: .55
        }));
        m(this, "strip", new U0(2.4, .015, .065));
        m(this, "rim", new oi("#b9d8ff", .4));
        H8.init(), this.group.name = "hall-lighting", this.rim.position.set(-8, 6, -4), this.rim.castShadow = !0, this.rim.shadow.mapSize.set(1024, 1024), Object.assign(this.rim.shadow.camera, {
            left: -14,
            right: 14,
            top: 14,
            bottom: -14,
            near: .5,
            far: 50
        }), this.rim.shadow.camera.updateProjectionMatrix(), this.rim.shadow.bias = -8e-5, this.rim.shadow.normalBias = .04, this.rim.shadow.radius = 1, this.group.add(this.rim, this.rim.target);
        for (const t of [.1, 3.2, 6.1]) {
            const s = new r3("#ffd7a4", 2, 2.4, .6);
            s.position.set(t, 2.46, -3.5), s.lookAt(t, 0, -3.5), s.userData.ceilingLight = !0, this.panels.push(s), this.group.add(s);
            const i = new K(this.strip, this.glow);
            i.position.set(t, 2.465, -3.5), i.userData.nohit = !0, i.userData.ceilingLight = !0, this.group.add(i)
        }
        e.add(this.group)
    }
    setQuality(e) {
        var t;
        this.rim.castShadow = e === "high", this.rim.castShadow || ((t = this.rim.shadow.map) == null || t.dispose(), this.rim.shadow.map = null)
    }
    setTime(e, t) {
        this.panels.forEach(s => s.intensity = e ? 5 : t ? 2.8 : 1.8), this.glow.emissiveIntensity = e ? 3 : 1.4, this.rim.intensity = e ? .25 : .18
    }
    dispose() {
        this.group.removeFromParent(), this.rim.shadow.dispose(), this.strip.dispose(), this.glow.dispose()
    }
}
