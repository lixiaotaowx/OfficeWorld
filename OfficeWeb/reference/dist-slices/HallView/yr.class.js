class Yr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_volume"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.transmission === 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (n.thicknessFactor = e.thickness, e.thicknessMap) {
            const o = {
                index: await s.processTextureAsync(e.thicknessMap),
                texCoord: e.thicknessMap.channel
            };
            s.applyTextureTransform(o, e.thicknessMap), n.thicknessTexture = o
        }
        e.attenuationDistance !== 1 / 0 && (n.attenuationDistance = e.attenuationDistance), n.attenuationColor = e.attenuationColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
