function Cx() {
    let s, e;
    onmessage = function(a) {
        const o = a.data;
        switch (o.type) {
            case "init":
                s = o.decoderConfig, e = new Promise(function(h) {
                    s.onModuleLoaded = function(u) {
                        h({
                            draco: u
                        })
                    }, DracoDecoderModule(s)
                });
                break;
            case "decode":
                const l = o.buffer,
                    c = o.taskConfig;
                e.then(h => {
                    const u = h.draco,
                        d = new u.Decoder;
                    try {
                        const f = t(u, d, new Int8Array(l), c),
                            p = f.attributes.map(x => x.array.buffer);
                        f.index && p.push(f.index.array.buffer), self.postMessage({
                            type: "decode",
                            id: o.id,
                            geometry: f
                        }, p)
                    } catch (f) {
                        console.error(f), self.postMessage({
                            type: "error",
                            id: o.id,
                            error: f.message
                        })
                    } finally {
                        u.destroy(d)
                    }
                });
                break
        }
    };

    function t(a, o, l, c) {
        const h = c.attributeIDs,
            u = c.attributeTypes;
        let d, f;
        const p = o.GetEncodedGeometryType(l);
        if (p === a.TRIANGULAR_MESH) d = new a.Mesh, f = o.DecodeArrayToMesh(l, l.byteLength, d);
        else if (p === a.POINT_CLOUD) d = new a.PointCloud, f = o.DecodeArrayToPointCloud(l, l.byteLength, d);
        else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
        if (!f.ok() || d.ptr === 0) throw new Error("THREE.DRACOLoader: Decoding failed: " + f.error_msg());
        const x = {
            index: null,
            attributes: []
        };
        for (const m in h) {
            const g = self[u[m]];
            let M, E;
            if (c.useUniqueIDs) E = h[m], M = o.GetAttributeByUniqueId(d, E);
            else {
                if (E = o.GetAttributeId(d, a[h[m]]), E === -1) continue;
                M = o.GetAttribute(d, E)
            }
            const v = i(a, o, d, m, g, M);
            m === "color" && (v.vertexColorSpace = c.vertexColorSpace), x.attributes.push(v)
        }
        return p === a.TRIANGULAR_MESH && (x.index = n(a, o, d)), a.destroy(d), x
    }

    function n(a, o, l) {
        const h = l.num_faces() * 3,
            u = h * 4,
            d = a._malloc(u);
        o.GetTrianglesUInt32Array(l, u, d);
        const f = new Uint32Array(a.HEAPF32.buffer, d, h).slice();
        return a._free(d), {
            array: f,
            itemSize: 1
        }
    }

    function i(a, o, l, c, h, u) {
        const d = l.num_points(),
            f = u.num_components(),
            p = r(a, h),
            x = f * h.BYTES_PER_ELEMENT,
            m = Math.ceil(x / 4) * 4,
            g = m / h.BYTES_PER_ELEMENT,
            M = d * x,
            E = d * m,
            v = a._malloc(M);
        o.GetAttributeDataArrayForAllPoints(l, u, p, M, v);
        const A = new h(a.HEAPF32.buffer, v, M / h.BYTES_PER_ELEMENT);
        let b;
        if (x === m) b = A.slice();
        else {
            b = new h(E / h.BYTES_PER_ELEMENT);
            let _ = 0;
            for (let T = 0; T < d; T++) {
                for (let I = 0; I < f; I++) b[_ + I] = A[T * f + I];
                _ += g
            }
        }
        return a._free(v), {
            name: c,
            count: d,
            itemSize: f,
            array: b,
            stride: g
        }
    }

    function r(a, o) {
        switch (o) {
            case Float32Array:
                return a.DT_FLOAT32;
            case Int8Array:
                return a.DT_INT8;
            case Int16Array:
                return a.DT_INT16;
            case Int32Array:
                return a.DT_INT32;
            case Uint8Array:
                return a.DT_UINT8;
            case Uint16Array:
                return a.DT_UINT16;
            case Uint32Array:
                return a.DT_UINT32
        }
    }
}

