function ut(i, e, t) {
    if (e === t) return !0;
    if (i == L.BYTES) {
        if (!(e instanceof Uint8Array) || !(t instanceof Uint8Array) || e.length !== t.length) return !1;
        for (let n = 0; n < e.length; n++)
            if (e[n] !== t[n]) return !1;
        return !0
    }
    switch (i) {
        case L.UINT64:
        case L.FIXED64:
        case L.INT64:
        case L.SFIXED64:
        case L.SINT64:
            return e == t
    }
    return !1
}

