function Jt(i, e) {
    switch (i) {
        case L.BOOL:
            return !1;
        case L.UINT64:
        case L.FIXED64:
        case L.INT64:
        case L.SFIXED64:
        case L.SINT64:
            return e == 0 ? de.zero : "0";
        case L.DOUBLE:
        case L.FLOAT:
            return 0;
        case L.BYTES:
            return new Uint8Array(0);
        case L.STRING:
            return "";
        default:
            return 0
    }
}

