class Zx {
    constructor(e) {
        this.name = Ze.KHR_BINARY_GLTF, this.content = null, this.body = null;
        const t = new DataView(e, 0, os),
            n = new TextDecoder;
        if (this.header = {
                magic: n.decode(new Uint8Array(e.slice(0, 4))),
                version: t.getUint32(4, !0),
                length: t.getUint32(8, !0)
            }, this.header.magic !== fu) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
        if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
        const i = this.header.length - os,
            r = new DataView(e, os);
        let a = 0;
        for (; a < i;) {
            const o = r.getUint32(a, !0);
            a += 4;
            const l = r.getUint32(a, !0);
            if (a += 4, l === Xc.JSON) {
                const c = new Uint8Array(e, os + a, o);
                this.content = n.decode(c)
            } else if (l === Xc.BIN) {
                const c = os + a;
                this.body = e.slice(c, c + o)
            }
            a += o
        }
        if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.")
    }
}
