class Gx {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_MATERIALS_IOR
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        return n === null || (t.ior = n.ior !== void 0 ? n.ior : 1.5, t.ior === 0 && (t.ior = 1e3)), Promise.resolve()
    }
}
