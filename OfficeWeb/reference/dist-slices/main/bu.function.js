function bu() {
    return {
        setEnumType: Yo,
        initPartial(i, e) {
            if (i === void 0) return;
            const t = e.getType();
            for (const n of t.fields.byMember()) {
                const s = n.localName,
                    r = e,
                    a = i;
                if (a[s] != null) switch (n.kind) {
                    case "oneof":
                        const o = a[s].case;
                        if (o === void 0) continue;
                        const c = n.findField(o);
                        let d = a[s].value;
                        c && c.kind == "message" && !ot(d, c.T) ? d = new c.T(d) : c && c.kind === "scalar" && c.T === L.BYTES && (d = Xt(d)), r[s] = {
                            case: o,
                            value: d
                        };
                        break;
                    case "scalar":
                    case "enum":
                        let l = a[s];
                        n.T === L.BYTES && (l = n.repeated ? l.map(Xt) : Xt(l)), r[s] = l;
                        break;
                    case "map":
                        switch (n.V.kind) {
                            case "scalar":
                            case "enum":
                                if (n.V.T === L.BYTES)
                                    for (const [m, f] of Object.entries(a[s])) r[s][m] = Xt(f);
                                else Object.assign(r[s], a[s]);
                                break;
                            case "message":
                                const h = n.V.T;
                                for (const m of Object.keys(a[s])) {
                                    let f = a[s][m];
                                    h.fieldWrapper || (f = new h(f)), r[s][m] = f
                                }
                                break
                        }
                        break;
                    case "message":
                        const u = n.T;
                        if (n.repeated) r[s] = a[s].map(h => ot(h, u) ? h : new u(h));
                        else {
                            const h = a[s];
                            u.fieldWrapper ? u.typeName === "google.protobuf.BytesValue" ? r[s] = Xt(h) : r[s] = h : r[s] = ot(h, u) ? h : new u(h)
                        }
                        break
                }
            }
        },
        equals(i, e, t) {
            return e === t ? !0 : !e || !t ? !1 : i.fields.byMember().every(n => {
                const s = e[n.localName],
                    r = t[n.localName];
                if (n.repeated) {
                    if (s.length !== r.length) return !1;
                    switch (n.kind) {
                        case "message":
                            return s.every((a, o) => n.T.equals(a, r[o]));
                        case "scalar":
                            return s.every((a, o) => ut(n.T, a, r[o]));
                        case "enum":
                            return s.every((a, o) => ut(L.INT32, a, r[o]))
                    }
                    throw new Error("repeated cannot contain ".concat(n.kind))
                }
                switch (n.kind) {
                    case "message":
                        let a = s,
                            o = r;
                        return n.T.fieldWrapper && (a !== void 0 && !ot(a) && (a = n.T.fieldWrapper.wrapField(a)), o !== void 0 && !ot(o) && (o = n.T.fieldWrapper.wrapField(o))), n.T.equals(a, o);
                    case "enum":
                        return ut(L.INT32, s, r);
                    case "scalar":
                        return ut(n.T, s, r);
                    case "oneof":
                        if (s.case !== r.case) return !1;
                        const c = n.findField(s.case);
                        if (c === void 0) return !0;
                        switch (c.kind) {
                            case "message":
                                return c.T.equals(s.value, r.value);
                            case "enum":
                                return ut(L.INT32, s.value, r.value);
                            case "scalar":
                                return ut(c.T, s.value, r.value)
                        }
                        throw new Error("oneof cannot contain ".concat(c.kind));
                    case "map":
                        const d = Object.keys(s).concat(Object.keys(r));
                        switch (n.V.kind) {
                            case "message":
                                const l = n.V.T;
                                return d.every(h => l.equals(s[h], r[h]));
                            case "enum":
                                return d.every(h => ut(L.INT32, s[h], r[h]));
                            case "scalar":
                                const u = n.V.T;
                                return d.every(h => ut(u, s[h], r[h]))
                        }
                        break
                }
            })
        },
        clone(i) {
            const e = i.getType(),
                t = new e,
                n = t;
            for (const s of e.fields.byMember()) {
                const r = i[s.localName];
                let a;
                if (s.repeated) a = r.map(Ti);
                else if (s.kind == "map") {
                    a = n[s.localName];
                    for (const [o, c] of Object.entries(r)) a[o] = Ti(c)
                } else s.kind == "oneof" ? a = s.findField(r.case) ? {
                    case: r.case,
                    value: Ti(r.value)
                } : {
                    case: void 0
                } : a = Ti(r);
                n[s.localName] = a
            }
            for (const s of e.runtime.bin.listUnknownFields(i)) e.runtime.bin.onUnknownField(n, s.no, s.wireType, s.data);
            return t
        }
    }
}

