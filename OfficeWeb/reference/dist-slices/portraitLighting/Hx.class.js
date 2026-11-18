class Hx {
    constructor(e) {
        this.parser = e, this.name = Ze.KHR_MATERIALS_VOLUME
    }
    getMaterialType(e) {
        return Mt(this.parser, e, this.name) !== null ? dn : null
    }
    extendMaterialParams(e, t) {
        const n = Mt(this.parser, e, this.name);
        if (n === null) return Promise.resolve();
        const i = [];
        t.thickness = n.thicknessFactor !== void 0 ? n.thicknessFactor : 0, n.thicknessTexture !== void 0 && i.push(this.parser.assignTexture(t, "thicknessMap", n.thicknessTexture)), t.attenuationDistance = n.attenuationDistance || 1 / 0;
        const r = n.attenuationColor || [1, 1, 1];
        return t.attenuationColor = new Fe().setRGB(r[0], r[1], r[2], Xt), Promise.all(i)
    }
}
