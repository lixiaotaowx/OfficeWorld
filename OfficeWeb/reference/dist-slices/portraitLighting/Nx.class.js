class Nx {
    constructor() {
        this.name = Ze.KHR_MATERIALS_UNLIT
    }
    getMaterialType() {
        return Ni
    }
    extendParams(e, t, n) {
        const i = [];
        e.color = new Fe(1, 1, 1), e.opacity = 1;
        const r = t.pbrMetallicRoughness;
        if (r) {
            if (Array.isArray(r.baseColorFactor)) {
                const a = r.baseColorFactor;
                e.color.setRGB(a[0], a[1], a[2], Xt), e.opacity = a[3]
            }
            r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, bt))
        }
        return Promise.all(i)
    }
}
