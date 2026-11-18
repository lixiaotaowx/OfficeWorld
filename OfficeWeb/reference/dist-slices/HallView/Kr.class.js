class Kr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_specular"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.specularIntensity === 1 && e.specularColor.equals(Dr) && !e.specularIntensityMap && !e.specularColorMap) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (e.specularIntensityMap) {
            const o = {
                index: await s.processTextureAsync(e.specularIntensityMap),
                texCoord: e.specularIntensityMap.channel
            };
            s.applyTextureTransform(o, e.specularIntensityMap), n.specularTexture = o
        }
        if (e.specularColorMap) {
            const o = {
                index: await s.processTextureAsync(e.specularColorMap),
                texCoord: e.specularColorMap.channel
            };
            s.applyTextureTransform(o, e.specularColorMap), n.specularColorTexture = o
        }
        n.specularFactor = e.specularIntensity, n.specularColorFactor = e.specularColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
