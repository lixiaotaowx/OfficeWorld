class jr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_clearcoat"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.clearcoat === 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (n.clearcoatFactor = e.clearcoat, e.clearcoatMap) {
            const o = {
                index: await s.processTextureAsync(e.clearcoatMap),
                texCoord: e.clearcoatMap.channel
            };
            s.applyTextureTransform(o, e.clearcoatMap), n.clearcoatTexture = o
        }
        if (n.clearcoatRoughnessFactor = e.clearcoatRoughness, e.clearcoatRoughnessMap) {
            const o = {
                index: await s.processTextureAsync(e.clearcoatRoughnessMap),
                texCoord: e.clearcoatRoughnessMap.channel
            };
            s.applyTextureTransform(o, e.clearcoatRoughnessMap), n.clearcoatRoughnessTexture = o
        }
        if (e.clearcoatNormalMap) {
            const o = {
                index: await s.processTextureAsync(e.clearcoatNormalMap),
                texCoord: e.clearcoatNormalMap.channel
            };
            e.clearcoatNormalScale.x !== 1 && (o.scale = e.clearcoatNormalScale.x), s.applyTextureTransform(o, e.clearcoatNormalMap), n.clearcoatNormalTexture = o
        }
        t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
