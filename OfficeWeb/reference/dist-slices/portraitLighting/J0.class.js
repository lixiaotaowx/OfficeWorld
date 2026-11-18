class J0 {
    constructor() {
        this.shaderCache = new Map, this.materialCache = new Map
    }
    update(e, t, n) {
        const i = this._getShaderCacheForMaterial(e);
        return i.has(t) === !1 && (i.add(t), t.usedTimes++), i.has(n) === !1 && (i.add(n), n.usedTimes++), this
    }
    remove(e) {
        const t = this.materialCache.get(e);
        for (const n of t) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
        return this.materialCache.delete(e), this
    }
    getVertexShaderStage(e) {
        return this._getShaderStage(e.vertexShader)
    }
    getFragmentShaderStage(e) {
        return this._getShaderStage(e.fragmentShader)
    }
    dispose() {
        this.shaderCache.clear(), this.materialCache.clear()
    }
    _getShaderCacheForMaterial(e) {
        const t = this.materialCache;
        let n = t.get(e);
        return n === void 0 && (n = new Set, t.set(e, n)), n
    }
    _getShaderStage(e) {
        const t = this.shaderCache;
        let n = t.get(e);
        return n === void 0 && (n = new Z0(e), t.set(e, n)), n
    }
}
