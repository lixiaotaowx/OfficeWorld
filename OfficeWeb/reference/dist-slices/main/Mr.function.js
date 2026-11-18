function Mr(i, e, t, n) {
    he(e !== void 0);
    const s = i.repeated;
    switch (i.kind) {
        case "scalar":
        case "enum":
            let r = i.kind == "enum" ? L.INT32 : i.T;
            if (s)
                if (he(Array.isArray(e)), i.packed) vu(t, r, i.no, e);
                else
                    for (const a of e) di(t, r, i.no, a);
            else di(t, r, i.no, e);
            break;
        case "message":
            if (s) {
                he(Array.isArray(e));
                for (const a of e) Or(t, n, i, a)
            } else Or(t, n, i, e);
            break;
        case "map":
            he(typeof e == "object" && e != null);
            for (const [a, o] of Object.entries(e)) gu(t, n, i, a, o);
            break
    }
}

