class Xx {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_MATERIALS_ANISOTROPY
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        if (n === null) return Promise.resolve();
        const i = [];
        return n.anisotropyStrength !== void 0 && (t.anisotropy = n.anisotropyStrength), n.anisotropyRotation !== void 0 && (t.anisotropyRotation = n.anisotropyRotation), n.anisotropyTexture !== void 0 && i.push(this.parser.assignTexture(t, "anisotropyMap", n.anisotropyTexture)), Promise.all(i)
    }
}
