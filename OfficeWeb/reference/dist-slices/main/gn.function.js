function gn(i, e, t, n) {
    if (e === null) return i.typeName == "google.protobuf.NullValue" ? 0 : n ? i.values[0].no : Vi;
    switch (typeof e) {
        case "number":
            if (Number.isInteger(e)) return e;
            break;
        case "string":
            const s = i.findName(e);
            if (s !== void 0) return s.no;
            if (t) return Ii;
            break
    }
    throw new Error("cannot decode enum ".concat(i.typeName, " from JSON: ").concat($e(e)))
}

