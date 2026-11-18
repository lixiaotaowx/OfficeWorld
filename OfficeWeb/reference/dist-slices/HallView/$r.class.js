class $r {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_emissive_strength"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshStandardMaterial || e.emissiveIntensity === 1) return;
        const i = this.writer.extensionsUsed,
            n = {};
        n.emissiveStrength = e.emissiveIntensity, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
