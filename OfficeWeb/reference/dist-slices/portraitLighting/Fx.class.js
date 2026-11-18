class Fx {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_MATERIALS_DIFFUSE_ROUGHNESS
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        if (n === null) return Promise.resolve();
        const i = [];
        return t.diffuseRoughness = n.diffuseRoughnessFactor !== void 0 ? n.diffuseRoughnessFactor : 0, n.diffuseRoughnessTexture !== void 0 && i.push(this.parser.assignTexture(t, "diffuseRoughnessMap", n.diffuseRoughnessTexture)), Promise.all(i)
    }
}
