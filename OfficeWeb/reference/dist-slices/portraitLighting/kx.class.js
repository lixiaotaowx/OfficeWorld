class Kx {
    constructor(e) {
        this.parser = e, this.name = Ze.EXT_TEXTURE_AVIF
    }
    loadTexture(e) {
        const t = this.name,
            n = this.parser,
            i = n.json,
            r = i.textures[e];
        if (!r.extensions || !r.extensions[t]) return null;
        const a = r.extensions[t],
            o = i.images[a.source];
        let l = n.textureLoader;
        if (o.uri) {
            const c = n.options.manager.getHandler(o.uri);
            c !== null && (l = c)
        }
        return n.loadTextureImage(e, a.source, l)
    }
}
