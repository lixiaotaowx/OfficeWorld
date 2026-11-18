function s8(r) {
    const e = new Uint8Array(r.buffer, r.byteOffset, O0.length);
    if (e[0] !== O0[0] || e[1] !== O0[1] || e[2] !== O0[2] || e[3] !== O0[3] || e[4] !== O0[4] || e[5] !== O0[5] || e[6] !== O0[6] || e[7] !== O0[7] || e[8] !== O0[8] || e[9] !== O0[9] || e[10] !== O0[10] || e[11] !== O0[11]) throw new Error("Missing KTX 2.0 identifier.");
    const t = {
            vkFormat: 0,
            typeSize: 1,
            pixelWidth: 0,
            pixelHeight: 0,
            pixelDepth: 0,
            layerCount: 0,
            faceCount: 1,
            levelCount: 0,
            supercompressionScheme: 0,
            levels: [],
            dataFormatDescriptor: [{
                vendorId: 0,
                descriptorType: 0,
                versionNumber: 2,
                colorModel: 0,
                colorPrimaries: 1,
                transferFunction: 2,
                flags: 0,
                texelBlockDimension: [0, 0, 0, 0],
                bytesPlane: [0, 0, 0, 0, 0, 0, 0, 0],
                samples: []
            }],
            keyValue: {},
            globalData: null
        },
        s = 17 * Uint32Array.BYTES_PER_ELEMENT,
        i = new h1(r, O0.length, s, !0);
    t.vkFormat = i._nextUint32(), t.typeSize = i._nextUint32(), t.pixelWidth = i._nextUint32(), t.pixelHeight = i._nextUint32(), t.pixelDepth = i._nextUint32(), t.layerCount = i._nextUint32(), t.faceCount = i._nextUint32(), t.levelCount = i._nextUint32(), t.supercompressionScheme = i._nextUint32();
    const n = i._nextUint32(),
        o = i._nextUint32(),
        a = i._nextUint32(),
        l = i._nextUint32(),
        A = i._nextUint64(),
        c = i._nextUint64(),
        h = 3 * Math.max(t.levelCount, 1) * 8,
        u = new h1(r, O0.length + s, h, !0);
    for (let W = 0, t0 = Math.max(t.levelCount, 1); W < t0; W++) t.levels.push({
        levelData: new Uint8Array(r.buffer, r.byteOffset + u._nextUint64(), u._nextUint64()),
        uncompressedByteLength: u._nextUint64()
    });
    const d = new h1(r, n, o, !0);
    d._skip(4);
    const g = d._nextUint16(),
        p = d._nextUint16(),
        I = d._nextUint16(),
        C = d._nextUint16(),
        E = {
            vendorId: g,
            descriptorType: p,
            versionNumber: I,
            colorModel: d._nextUint8(),
            colorPrimaries: d._nextUint8(),
            transferFunction: d._nextUint8(),
            flags: d._nextUint8(),
            texelBlockDimension: [d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8()],
            bytesPlane: [d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8()],
            samples: []
        },
        x = (C / 4 - 6) / 4;
    for (let W = 0; W < x; W++) {
        const t0 = {
            bitOffset: d._nextUint16(),
            bitLength: d._nextUint8(),
            channelType: d._nextUint8(),
            samplePosition: [d._nextUint8(), d._nextUint8(), d._nextUint8(), d._nextUint8()],
            sampleLower: Number.NEGATIVE_INFINITY,
            sampleUpper: Number.POSITIVE_INFINITY
        };
        64 & t0.channelType ? (t0.sampleLower = d._nextInt32(), t0.sampleUpper = d._nextInt32()) : (t0.sampleLower = d._nextUint32(), t0.sampleUpper = d._nextUint32()), E.samples[W] = t0
    }
    t.dataFormatDescriptor.length = 0, t.dataFormatDescriptor.push(E);
    const B = new h1(r, a, l, !0);
    for (; B._offset < l;) {
        const W = B._nextUint32(),
            t0 = B._scan(W),
            o0 = a2(t0);
        if (t.keyValue[o0] = B._nextUint8Array(W - t0.byteLength - 1), o0.match(/^ktx/i)) {
            const d0 = a2(t.keyValue[o0]);
            t.keyValue[o0] = d0.substring(0, d0.lastIndexOf("\0"))
        }
        B._skip(W % 4 ? 4 - W % 4 : 0)
    }
    if (c <= 0) return t;
    const b = new h1(r, A, c, !0),
        v = b._nextUint16(),
        L = b._nextUint16(),
        D = b._nextUint32(),
        P = b._nextUint32(),
        U = b._nextUint32(),
        R = b._nextUint32(),
        Q = [];
    for (let W = 0, t0 = Math.max(t.levelCount, 1); W < t0; W++) Q.push({
        imageFlags: b._nextUint32(),
        rgbSliceByteOffset: b._nextUint32(),
        rgbSliceByteLength: b._nextUint32(),
        alphaSliceByteOffset: b._nextUint32(),
        alphaSliceByteLength: b._nextUint32()
    });
    const H = A + b._offset,
        N = H + D,
        G = N + P,
        q = G + U,
        j = new Uint8Array(r.buffer, r.byteOffset + H, D),
        h0 = new Uint8Array(r.buffer, r.byteOffset + N, P),
        i0 = new Uint8Array(r.buffer, r.byteOffset + G, U),
        u0 = new Uint8Array(r.buffer, r.byteOffset + q, R);
    return t.globalData = {
        endpointCount: v,
        selectorCount: L,
        imageDescs: Q,
        endpointsData: j,
        selectorsData: h0,
        tablesData: i0,
        extendedData: u0
    }, t
}
let is, _e, qs;
