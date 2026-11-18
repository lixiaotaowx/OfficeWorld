function zl() {
    let i = 0,
        e = 0;
    for (let n = 0; n < 28; n += 7) {
        let s = this.buf[this.pos++];
        if (i |= (s & 127) << n, !(s & 128)) return this.assertBounds(), [i, e]
    }
    let t = this.buf[this.pos++];
    if (i |= (t & 15) << 28, e = (t & 112) >> 4, !(t & 128)) return this.assertBounds(), [i, e];
    for (let n = 3; n <= 31; n += 7) {
        let s = this.buf[this.pos++];
        if (e |= (s & 127) << n, !(s & 128)) return this.assertBounds(), [i, e]
    }
    throw new Error("invalid varint")
}

