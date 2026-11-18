function xr(i, e, t, n, s) {
    let {
        repeated: r,
        localName: a
    } = t;
    switch (t.oneof && (i = i[t.oneof.localName], i.case != a && delete i.value, i.case = a, a = "value"), t.kind) {
        case "scalar":
        case "enum":
            const o = t.kind == "enum" ? L.INT32 : t.T;
            let c = qi;
            if (t.kind == "scalar" && t.L > 0 && (c = pu), r) {
                let h = i[a];
                if (n == pe.LengthDelimited && o != L.STRING && o != L.BYTES) {
                    let f = e.uint32() + e.pos;
                    for (; e.pos < f;) h.push(c(e, o))
                } else h.push(c(e, o))
            } else i[a] = c(e, o);
            break;
        case "message":
            const d = t.T;
            r ? i[a].push(Mi(e, new d, s, t)) : ot(i[a]) ? Mi(e, i[a], s, t) : (i[a] = Mi(e, new d, s, t), d.fieldWrapper && !t.oneof && !t.repeated && (i[a] = d.fieldWrapper.unwrapField(i[a])));
            break;
        case "map":
            let [l, u] = fu(t, e, s);
            i[a][l] = u;
            break
    }
}

