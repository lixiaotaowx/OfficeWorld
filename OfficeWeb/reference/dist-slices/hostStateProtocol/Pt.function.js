function Pt(n, e) {
    fe || (fe = new TextDecoder);
    const t = [];
    let s = 0,
        r = -1,
        i = !1;
    return new TransformStream({
        transform(o, a) {
            for (t.push(o);;) {
                if (s === 0) {
                    if (Z(t) < 1) break;
                    const f = ee(t, 1);
                    i = (f[0] & 128) === 128, r = f[0] & 127, r < 126 ? s = 3 : r === 126 ? s = 1 : s = 2
                } else if (s === 1) {
                    if (Z(t) < 2) break;
                    const f = ee(t, 2);
                    r = new DataView(f.buffer, f.byteOffset, f.length).getUint16(0), s = 3
                } else if (s === 2) {
                    if (Z(t) < 8) break;
                    const f = ee(t, 8),
                        d = new DataView(f.buffer, f.byteOffset, f.length),
                        m = d.getUint32(0);
                    if (m > Math.pow(2, 21) - 1) {
                        a.enqueue(de);
                        break
                    }
                    r = m * Math.pow(2, 32) + d.getUint32(4), s = 3
                } else {
                    if (Z(t) < r) break;
                    const f = ee(t, r);
                    a.enqueue(ve(i ? f : fe.decode(f), e)), s = 0
                }
                if (r === 0 || r > n) {
                    a.enqueue(de);
                    break
                }
            }
        }
    })
}
