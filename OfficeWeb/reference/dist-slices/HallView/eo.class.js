class eo {
    constructor(e) {
        this.writer = e, this.name = "EXT_materials_bump"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshStandardMaterial || e.bumpScale === 1 && !e.bumpMap) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (e.bumpMap) {
            const o = {
                index: await s.processTextureAsync(e.bumpMap),
                texCoord: e.bumpMap.channel
            };
            s.applyTextureTransform(o, e.bumpMap), n.bumpTexture = o
        }
        n.bumpFactor = e.bumpScale, t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
