function ci(i, e, t, n) {
    if (e === null) return n ? Jt(i, t) : Vi;
    switch (i) {
        case L.DOUBLE:
        case L.FLOAT:
            if (e === "NaN") return Number.NaN;
            if (e === "Infinity") return Number.POSITIVE_INFINITY;
            if (e === "-Infinity") return Number.NEGATIVE_INFINITY;
            if (e === "" || typeof e == "string" && e.trim().length !== e.length || typeof e != "string" && typeof e != "number") break;
            const s = Number(e);
            if (Number.isNaN(s) || !Number.isFinite(s)) break;
            return i == L.FLOAT && $o(s), s;
        case L.INT32:
        case L.FIXED32:
        case L.SFIXED32:
        case L.SINT32:
        case L.UINT32:
            let r;
            if (typeof e == "number" ? r = e : typeof e == "string" && e.length > 0 && e.trim().length === e.length && (r = Number(e)), r === void 0) break;
            return i == L.UINT32 || i == L.FIXED32 ? Hn(r) : Ri(r), r;
        case L.INT64:
        case L.SFIXED64:
        case L.SINT64:
            if (typeof e != "number" && typeof e != "string") break;
            const a = de.parse(e);
            return t ? a.toString() : a;
        case L.FIXED64:
        case L.UINT64:
            if (typeof e != "number" && typeof e != "string") break;
            const o = de.uParse(e);
            return t ? o.toString() : o;
        case L.BOOL:
            if (typeof e != "boolean") break;
            return e;
        case L.STRING:
            if (typeof e != "string") break;
            try {
                encodeURIComponent(e)
            } catch {
                throw new Error("invalid UTF8")
            }
            return e;
        case L.BYTES:
            if (e === "") return new Uint8Array(0);
            if (typeof e != "string") break;
            return sa.dec(e)
    }
    throw new Error
}

