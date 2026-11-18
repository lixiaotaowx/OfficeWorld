function fu(i, e, t) {
    const n = e.uint32(),
        s = e.pos + n;
    let r, a;
    for (; e.pos < s;) {
        const [o] = e.tag();
        switch (o) {
            case 1:
                r = qi(e, i.K);
                break;
            case 2:
                switch (i.V.kind) {
                    case "scalar":
                        a = qi(e, i.V.T);
                        break;
                    case "enum":
                        a = e.int32();
                        break;
                    case "message":
                        a = Mi(e, new i.V.T, t, void 0);
                        break
                }
                break
        }
    }
    if (r === void 0 && (r = Jt(i.K, kt.BIGINT)), typeof r != "string" && typeof r != "number" && (r = r.toString()), a === void 0) switch (i.V.kind) {
        case "scalar":
            a = Jt(i.V.T, kt.BIGINT);
            break;
        case "enum":
            a = i.V.T.values[0].no;
            break;
        case "message":
            a = new i.V.T;
            break
    }
    return [r, a]
}

