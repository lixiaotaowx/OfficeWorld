class Wx {
    constructor(e) {
        this.parser = e, this.name = Ze.EXT_MATERIALS_BUMP
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        if (n === null) return Promise.resolve();
        const i = [];
        return t.bumpScale = n.bumpFactor !== void 0 ? n.bumpFactor : 1, n.bumpTexture !== void 0 && i.push(this.parser.assignTexture(t, "bumpMap", n.bumpTexture)), Promise.all(i)
    }
}
