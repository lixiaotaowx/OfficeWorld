class Hr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_unlit"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshBasicMaterial) return;
        const i = this.writer.extensionsUsed;
        t.extensions = t.extensions || {}, t.extensions[this.name] = {}, i[this.name] = !0, t.pbrMetallicRoughness.metallicFactor = 0, t.pbrMetallicRoughness.roughnessFactor = .9
    }
}
