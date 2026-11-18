function gu(i, e, t, n, s) {
    i.tag(t.no, pe.LengthDelimited), i.fork();
    let r = n;
    switch (t.K) {
        case L.INT32:
        case L.FIXED32:
        case L.UINT32:
        case L.SFIXED32:
        case L.SINT32:
            r = Number.parseInt(n);
            break;
        case L.BOOL:
            he(n == "true" || n == "false"), r = n == "true";
            break
    }
    switch (di(i, t.K, 1, r), t.V.kind) {
        case "scalar":
            di(i, t.V.T, 2, s);
            break;
        case "enum":
            di(i, L.INT32, 2, s);
            break;
        case "message":
            he(s !== void 0), i.tag(2, pe.LengthDelimited).bytes(s.toBinary(e));
            break
    }
    i.join()
}

