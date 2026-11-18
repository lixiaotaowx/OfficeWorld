function Mt() {
    return new TransformStream({
        transform(n, e) {
            Rt(n, t => {
                const s = t.length;
                let r;
                if (s < 126) r = new Uint8Array(1), new DataView(r.buffer).setUint8(0, s);
                else if (s < 65536) {
                    r = new Uint8Array(3);
                    const i = new DataView(r.buffer);
                    i.setUint8(0, 126), i.setUint16(1, s)
                } else {
                    r = new Uint8Array(9);
                    const i = new DataView(r.buffer);
                    i.setUint8(0, 127), i.setBigUint64(1, BigInt(s))
                }
                n.data && typeof n.data != "string" && (r[0] |= 128), e.enqueue(r), e.enqueue(t)
            })
        }
    })
}
let fe;

