class Qx {
    constructor() {
        this.name = Ze.KHR_TEXTURE_TRANSFORM
    }
    extendTexture(e, t) {
        if ((t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0) return e;
        if (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), t.rotation !== void 0) {
            const n = Math.cos(e.rotation),
                i = Math.sin(e.rotation);
            e.matrix.set(e.repeat.x * n, e.repeat.y * i, e.offset.x, -e.repeat.x * i, e.repeat.y * n, e.offset.y, 0, 0, 1), e.matrixAutoUpdate = !1
        }
        return e.needsUpdate = !0, e
    }
}
