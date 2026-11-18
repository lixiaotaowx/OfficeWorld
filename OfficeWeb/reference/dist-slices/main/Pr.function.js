function Pr(i, e, t, n, s) {
    let r = t.localName;
    if (t.repeated) {
        if (he(t.kind != "map"), e === null) return;
        if (!Array.isArray(e)) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e)));
        const a = i[r];
        for (const o of e) {
            if (o === null) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(o)));
            switch (t.kind) {
                case "message":
                    a.push(t.T.fromJson(o, n));
                    break;
                case "enum":
                    const c = gn(t.T, o, n.ignoreUnknownFields, !0);
                    c !== Ii && a.push(c);
                    break;
                case "scalar":
                    try {
                        a.push(ci(t.T, o, t.L, !0))
                    } catch (d) {
                        let l = "cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(o));
                        throw d instanceof Error && d.message.length > 0 && (l += ": ".concat(d.message)), new Error(l)
                    }
                    break
            }
        }
    } else if (t.kind == "map") {
        if (e === null) return;
        if (typeof e != "object" || Array.isArray(e)) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e)));
        const a = i[r];
        for (const [o, c] of Object.entries(e)) {
            if (c === null) throw new Error("cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: map value null"));
            let d;
            try {
                d = du(t.K, o)
            } catch (l) {
                let u = "cannot decode map key for field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
                throw l instanceof Error && l.message.length > 0 && (u += ": ".concat(l.message)), new Error(u)
            }
            switch (t.V.kind) {
                case "message":
                    a[d] = t.V.T.fromJson(c, n);
                    break;
                case "enum":
                    const l = gn(t.V.T, c, n.ignoreUnknownFields, !0);
                    l !== Ii && (a[d] = l);
                    break;
                case "scalar":
                    try {
                        a[d] = ci(t.V.T, c, kt.BIGINT, !0)
                    } catch (u) {
                        let h = "cannot decode map value for field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
                        throw u instanceof Error && u.message.length > 0 && (h += ": ".concat(u.message)), new Error(h)
                    }
                    break
            }
        }
    } else switch (t.oneof && (i = i[t.oneof.localName] = {
            case: r
        }, r = "value"), t.kind) {
        case "message":
            const a = t.T;
            if (e === null && a.typeName != "google.protobuf.Value") return;
            let o = i[r];
            ot(o) ? o.fromJson(e, n) : (i[r] = o = a.fromJson(e, n), a.fieldWrapper && !t.oneof && (i[r] = a.fieldWrapper.unwrapField(o)));
            break;
        case "enum":
            const c = gn(t.T, e, n.ignoreUnknownFields, !1);
            switch (c) {
                case Vi:
                    Cr(t, i);
                    break;
                case Ii:
                    break;
                default:
                    i[r] = c;
                    break
            }
            break;
        case "scalar":
            try {
                const d = ci(t.T, e, t.L, !1);
                switch (d) {
                    case Vi:
                        Cr(t, i);
                        break;
                    default:
                        i[r] = d;
                        break
                }
            } catch (d) {
                let l = "cannot decode field ".concat(s.typeName, ".").concat(t.name, " from JSON: ").concat($e(e));
                throw d instanceof Error && d.message.length > 0 && (l += ": ".concat(d.message)), new Error(l)
            }
            break
    }
}

