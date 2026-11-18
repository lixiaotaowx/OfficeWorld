function Cr(i, e) {
    const t = i.localName,
        n = !i.opt && !i.req;
    if (i.repeated) e[t] = [];
    else if (i.oneof) e[i.oneof.localName] = {
        case: void 0
    };
    else switch (i.kind) {
        case "map":
            e[t] = {};
            break;
        case "enum":
            e[t] = n ? i.T.values[0].no : void 0;
            break;
        case "scalar":
            e[t] = n ? Jt(i.T, i.L) : void 0;
            break;
        case "message":
            e[t] = void 0;
            break
    }
}

