const R = yu("proto3", i => new ku(i, e => _u(e)), i => {
    for (const e of i.getType().fields.byMember()) {
        if (e.opt) continue;
        const t = e.localName,
            n = i;
        if (e.repeated) {
            n[t] = [];
            continue
        }
        switch (e.kind) {
            case "oneof":
                n[t] = {
                    case: void 0
                };
                break;
            case "enum":
                n[t] = 0;
                break;
            case "map":
                n[t] = {};
                break;
            case "scalar":
                n[t] = Jt(e.T, e.L);
                break
        }
    }
});
