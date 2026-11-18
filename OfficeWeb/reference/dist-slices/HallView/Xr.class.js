class Xr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_sheen"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.sheen == 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (e.sheenRoughnessMap) {
            const o = {
                index: await s.processTextureAsync(e.sheenRoughnessMap),
                texCoord: e.sheenRoughnessMap.channel
            };
            s.applyTextureTransform(o, e.sheenRoughnessMap), n.sheenRoughnessTexture = o
        }
        if (e.sheenColorMap) {
            const o = {
                index: await s.processTextureAsync(e.sheenColorMap),
                texCoord: e.sheenColorMap.channel
            };
            s.applyTextureTransform(o, e.sheenColorMap), n.sheenColorTexture = o
        }
        n.sheenRoughnessFactor = e.sheenRoughness, n.sheenColorFactor = e.sheenColor.toArray(), t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
