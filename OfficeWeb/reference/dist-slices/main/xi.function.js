function xi(i, e) {
    switch (i) {
        case L.INT32:
        case L.SFIXED32:
        case L.SINT32:
        case L.FIXED32:
        case L.UINT32:
            return he(typeof e == "number"), e;
        case L.FLOAT:
        case L.DOUBLE:
            return he(typeof e == "number"), Number.isNaN(e) ? "NaN" : e === Number.POSITIVE_INFINITY ? "Infinity" : e === Number.NEGATIVE_INFINITY ? "-Infinity" : e;
        case L.STRING:
            return he(typeof e == "string"), e;
        case L.BOOL:
            return he(typeof e == "boolean"), e;
        case L.UINT64:
        case L.FIXED64:
        case L.INT64:
        case L.SFIXED64:
        case L.SINT64:
            return he(typeof e == "bigint" || typeof e == "string" || typeof e == "number"), e.toString();
        case L.BYTES:
            return he(e instanceof Uint8Array), sa.enc(e)
    }
}
