function qi(i, e) {
    switch (e) {
        case L.STRING:
            return i.string();
        case L.BOOL:
            return i.bool();
        case L.DOUBLE:
            return i.double();
        case L.FLOAT:
            return i.float();
        case L.INT32:
            return i.int32();
        case L.INT64:
            return i.int64();
        case L.UINT64:
            return i.uint64();
        case L.FIXED64:
            return i.fixed64();
        case L.BYTES:
            return i.bytes();
        case L.FIXED32:
            return i.fixed32();
        case L.SFIXED32:
            return i.sfixed32();
        case L.SFIXED64:
            return i.sfixed64();
        case L.SINT64:
            return i.sint64();
        case L.UINT32:
            return i.uint32();
        case L.SINT32:
            return i.sint32()
    }
}

