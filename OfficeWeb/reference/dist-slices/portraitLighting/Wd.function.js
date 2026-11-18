function Wd() {
    const s = new ArrayBuffer(4),
        e = new Float32Array(s),
        t = new Uint32Array(s),
        n = new Uint32Array(512),
        i = new Uint32Array(512);
    for (let l = 0; l < 256; ++l) {
        const c = l - 127;
        c < -27 ? (n[l] = 0, n[l | 256] = 32768, i[l] = 24, i[l | 256] = 24) : c < -14 ? (n[l] = 1024 >> -c - 14, n[l | 256] = 1024 >> -c - 14 | 32768, i[l] = -c - 1, i[l | 256] = -c - 1) : c <= 15 ? (n[l] = c + 15 << 10, n[l | 256] = c + 15 << 10 | 32768, i[l] = 13, i[l | 256] = 13) : c < 128 ? (n[l] = 31744, n[l | 256] = 64512, i[l] = 24, i[l | 256] = 24) : (n[l] = 31744, n[l | 256] = 64512, i[l] = 13, i[l | 256] = 13)
    }
    const r = new Uint32Array(2048),
        a = new Uint32Array(64),
        o = new Uint32Array(64);
    for (let l = 1; l < 1024; ++l) {
        let c = l << 13,
            h = 0;
        for (; !(c & 8388608);) c <<= 1, h -= 8388608;
        c &= -8388609, h += 947912704, r[l] = c | h
    }
    for (let l = 1024; l < 2048; ++l) r[l] = 939524096 + (l - 1024 << 13);
    for (let l = 1; l < 31; ++l) a[l] = l << 23;
    a[31] = 1199570944, a[32] = 2147483648;
    for (let l = 33; l < 63; ++l) a[l] = 2147483648 + (l - 32 << 23);
    a[63] = 3347054592;
    for (let l = 1; l < 64; ++l) l !== 32 && (o[l] = 1024);
    return {
        floatView: e,
        uint32View: t,
        baseTable: n,
        shiftTable: i,
        mantissaTable: r,
        exponentTable: a,
        offsetTable: o
    }
}

