function da(i) {
    let e = pe.Varint;
    switch (i) {
        case L.BYTES:
        case L.STRING:
            e = pe.LengthDelimited;
            break;
        case L.DOUBLE:
        case L.FIXED64:
        case L.SFIXED64:
            e = pe.Bit64;
            break;
        case L.FIXED32:
        case L.SFIXED32:
        case L.FLOAT:
            e = pe.Bit32;
            break
    }
    const t = L[i].toLowerCase();
    return [e, t]
}

