function aa(i, e) {
    const t = i.localName;
    if (i.repeated) return e[t].length > 0;
    if (i.oneof) return e[i.oneof.localName].case === t;
    switch (i.kind) {
        case "enum":
        case "scalar":
            return i.opt || i.req ? e[t] !== void 0 : i.kind == "enum" ? e[t] !== i.T.values[0].no : !ia(i.T, e[t]);
        case "message":
            return e[t] !== void 0;
        case "map":
            return Object.keys(e[t]).length > 0
    }
}

