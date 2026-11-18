class Vx {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_MATERIALS_SPECULAR
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        if (n === null) return Promise.resolve();
        const i = [];
        t.specularIntensity = n.specularFactor !== void 0 ? n.specularFactor : 1, n.specularTexture !== void 0 && i.push(this.parser.assignTexture(t, "specularIntensityMap", n.specularTexture));
        const r = n.specularColorFactor || [1, 1, 1];
        return t.specularColor = new Fe().setRGB(r[0], r[1], r[2], Xt), n.specularColorTexture !== void 0 && i.push(this.parser.assignTexture(t, "specularColorMap", n.specularColorTexture, bt)), Promise.all(i)
    }
}
