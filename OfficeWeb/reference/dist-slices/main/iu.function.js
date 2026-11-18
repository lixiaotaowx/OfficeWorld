function iu(i) {
    const e = i.field;
    if (e.repeated) return [];
    if (e.default !== void 0) return e.default;
    switch (e.kind) {
        case "enum":
            return e.T.values[0].no;
        case "scalar":
            return Jt(e.T, e.L);
        case "message":
            const t = e.T,
                n = new t;
            return t.fieldWrapper ? t.fieldWrapper.unwrapField(n) : n;
        case "map":
            throw "map fields are not allowed to be extensions"
    }
}

