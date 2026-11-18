function Yl() {
    let i = this.buf[this.pos++],
        e = i & 127;
    if (!(i & 128)) return this.assertBounds(), e;
    if (i = this.buf[this.pos++], e |= (i & 127) << 7, !(i & 128)) return this.assertBounds(), e;
    if (i = this.buf[this.pos++], e |= (i & 127) << 14, !(i & 128)) return this.assertBounds(), e;
    if (i = this.buf[this.pos++], e |= (i & 127) << 21, !(i & 128)) return this.assertBounds(), e;
    i = this.buf[this.pos++], e |= (i & 15) << 28;
    for (let t = 5; i & 128 && t < 10; t++) i = this.buf[this.pos++];
    if (i & 128) throw new Error("invalid varint");
    return this.assertBounds(), e >>> 0
}

