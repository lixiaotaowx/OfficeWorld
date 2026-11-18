const l8 = new Set([ne, Os, C1, E1]),
    A8 = new Set([Ai]),
    ls = {
        [O4]: ne,
        [_4]: C1,
        [z4]: E1,
        [G4]: ne,
        [U4]: C1,
        [P4]: E1,
        [Ai]: ne,
        [N4]: ne,
        [F4]: ne,
        [R4]: C1,
        [L4]: C1,
        [D4]: E1,
        [T4]: E1,
        [j4]: Os,
        [H4]: Os,
        [n5]: m4,
        [i5]: p4,
        [r5]: Pn,
        [o5]: Nn,
        [a5]: Fn,
        [l5]: Rn,
        [ci]: g9,
        [c5]: g9,
        [A5]: g9,
        [m5]: $9,
        [u5]: $9,
        [h5]: $9,
        [Y4]: _s,
        [V4]: _s,
        [W4]: Ji,
        [q4]: Ji,
        [K4]: zs,
        [J4]: zs,
        [Z4]: Ln,
        [X4]: Dn,
        [e5]: Tn,
        [$4]: kn,
        [s5]: Gs,
        [t5]: Gs,
        [p5]: Us,
        [g5]: Us,
        [f5]: Yi,
        [d5]: Yi
    },
    mt = {
        [O4]: St,
        [_4]: St,
        [z4]: St,
        [G4]: T0,
        [U4]: T0,
        [P4]: T0,
        [Ai]: C4,
        [N4]: s0,
        [F4]: s0,
        [R4]: s0,
        [L4]: s0,
        [D4]: s0,
        [T4]: s0,
        [j4]: E4,
        [H4]: I4,
        [n5]: s0,
        [i5]: s0,
        [r5]: s0,
        [o5]: s0,
        [a5]: s0,
        [l5]: s0,
        [ci]: T0,
        [c5]: s0,
        [A5]: s0,
        [m5]: T0,
        [u5]: s0,
        [h5]: s0,
        [Y4]: s0,
        [V4]: s0,
        [W4]: s0,
        [q4]: s0,
        [K4]: s0,
        [J4]: s0,
        [Z4]: s0,
        [X4]: s0,
        [e5]: s0,
        [$4]: s0,
        [s5]: s0,
        [t5]: s0,
        [p5]: s0,
        [g5]: s0,
        [f5]: s0,
        [d5]: s0
    };
async function c8(r) {
    const {
        vkFormat: e
    } = r;
    if (ls[e] === void 0) throw new Error("THREE.KTX2Loader: Unsupported vkFormat: " + e);
    mt[e] === void 0 && console.warn('THREE.KTX2Loader: Missing ".type" for vkFormat: ' + e);
    let t;
    r.supercompressionScheme === r2 && (as || (as = new Promise(async o => {
        const a = new i8;
        await a.init(), o(a)
    })), t = await as);
    const s = [];
    for (let o = 0; o < r.levels.length; o++) {
        const a = Math.max(1, r.pixelWidth >> o),
            l = Math.max(1, r.pixelHeight >> o),
            A = r.pixelDepth ? Math.max(1, r.pixelDepth >> o) : 0,
            c = r.levels[o];
        let h;
        if (r.supercompressionScheme === K3) h = c.levelData;
        else if (r.supercompressionScheme === r2) h = t.decode(c.levelData, c.uncompressedByteLength);
        else throw new Error("THREE.KTX2Loader: Unsupported supercompressionScheme.");
        let u;
        mt[e] === St ? u = new Float32Array(h.buffer, h.byteOffset, h.byteLength / Float32Array.BYTES_PER_ELEMENT) : mt[e] === T0 || mt[e] === C4 ? u = new Uint16Array(h.buffer, h.byteOffset, h.byteLength / Uint16Array.BYTES_PER_ELEMENT) : mt[e] === E4 || mt[e] === I4 ? u = new Uint32Array(h.buffer, h.byteOffset, h.byteLength / Uint32Array.BYTES_PER_ELEMENT) : u = h, s.push({
            data: u,
            width: a,
            height: l,
            depth: A
        })
    }
    const i = r.levelCount === 0 || s.length > 1;
    let n;
    if (l8.has(ls[e])) n = r.pixelDepth === 0 ? new De(s[0].data, r.pixelWidth, r.pixelHeight) : new Un(s[0].data, r.pixelWidth, r.pixelHeight, r.pixelDepth), n.mipmaps = s, n.minFilter = i ? y4 : xe, n.magFilter = xe, n.generateMipmaps = r.levelCount === 0, n.normalized = A8.has(e);
    else {
        if (r.pixelDepth > 0) throw new Error("THREE.KTX2Loader: Unsupported pixelDepth.");
        if (r.faceCount === 6) {
            const o = [];
            for (let a = 0; a < 6; a++) {
                const l = [];
                for (const A of s) {
                    const c = A.data.length / 6;
                    l.push({
                        data: A.data.subarray(a * c, (a + 1) * c),
                        width: A.width,
                        height: A.height
                    })
                }
                o.push({
                    mipmaps: l,
                    width: r.pixelWidth,
                    height: r.pixelHeight
                })
            }
            n = new g4(o)
        } else n = new Jt(s, r.pixelWidth, r.pixelHeight);
        n.minFilter = i ? T9 : pe, n.magFilter = pe
    }
    return n.type = mt[e], n.format = ls[e], n.colorSpace = I5(r), n.needsUpdate = !0, n
}

