class Vr {
    constructor(e) {
        this.writer = e, this.name = "KHR_materials_transmission"
    }
    async writeMaterialAsync(e, t) {
        if (!e.isMeshPhysicalMaterial || e.transmission === 0) return;
        const s = this.writer,
            i = s.extensionsUsed,
            n = {};
        if (n.transmissionFactor = e.transmission, e.transmissionMap) {
            const o = {
                index: await s.processTextureAsync(e.transmissionMap),
                texCoord: e.transmissionMap.channel
            };
            s.applyTextureTransform(o, e.transmissionMap), n.transmissionTexture = o
        }
        t.extensions = t.extensions || {}, t.extensions[this.name] = n, i[this.name] = !0
    }
}
