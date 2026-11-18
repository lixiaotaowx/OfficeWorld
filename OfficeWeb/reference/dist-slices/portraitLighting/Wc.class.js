class Wc {
    constructor(e, t) {
        this.name = t, this.parser = e
    }
    loadBufferView(e) {
        const t = this.parser.json,
            n = t.bufferViews[e];
        if (n.extensions && n.extensions[this.name]) {
            const i = n.extensions[this.name],
                r = this.parser.getDependency("buffer", i.buffer),
                a = this.parser.options.meshoptDecoder;
            if (!a || !a.supported) {
                if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
                return null
            }
            return r.then(function(o) {
                const l = i.byteOffset || 0,
                    c = i.byteLength || 0,
                    h = i.count,
                    u = i.byteStride,
                    d = new Uint8Array(o, l, c);
                return a.decodeGltfBufferAsync ? a.decodeGltfBufferAsync(h, u, d, i.mode, i.filter).then(function(f) {
                    return f.buffer
                }) : a.ready.then(function() {
                    const f = new ArrayBuffer(h * u);
                    return a.decodeGltfBuffer(new Uint8Array(f), h, u, d, i.mode, i.filter), f
                })
            })
        } else return null
    }
}
