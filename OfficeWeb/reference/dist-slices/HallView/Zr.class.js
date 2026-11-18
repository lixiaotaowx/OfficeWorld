class Zr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_anisotropy"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.anisotropy == 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (e.anisotropyMap) {
            const o = {
                index: await s.processTextureAsync(e.anisotropyMap)
            };
            s.applyTextureTransform(o, e.anisotropyMap), n.anisotropyTexture = o
        }
        n.anisotropyStrength = e.anisotropy, n.anisotropyRotation = e.anisotropyRotation, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
