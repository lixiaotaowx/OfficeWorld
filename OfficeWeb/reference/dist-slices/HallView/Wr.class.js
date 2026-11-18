class Wr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_iridescence"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.iridescence === 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (n.iridescenceFactor = e.iridescence, e.iridescenceMap) {
            const o = {
                index: await s.processTextureAsync(e.iridescenceMap),
                texCoord: e.iridescenceMap.channel
            };
            s.applyTextureTransform(o, e.iridescenceMap), n.iridescenceTexture = o
        }
        if (n.iridescenceIor = e.iridescenceIOR, n.iridescenceThicknessMinimum = e.iridescenceThicknessMinimum, n.iridescenceThicknessMaximum = e.iridescenceThicknessMaximum, e.iridescenceThicknessMap) {
            const o = {
                index: await s.processTextureAsync(e.iridescenceThicknessMap),
                texCoord: e.iridescenceThicknessMap.channel
            };
            s.applyTextureTransform(o, e.iridescenceThicknessMap), n.iridescenceThicknessTexture = o
        }
        t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
