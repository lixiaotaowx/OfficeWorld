class qr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_dispersion"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.dispersion === 0) return;
        const i = this.writer.extensionsUsed,
            n = {};
        n.dispersion = e.dispersion, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
