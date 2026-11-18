function cu() {
    return {
        makeReadOptions: ou,
        makeWriteOptions: au,
        readMessage(i, e, t, n) {
            if (e == null || Array.isArray(e) || typeof e != "object") throw new Error("cannot decode message ".concat(i.typeName, " from JSON: ").concat($e(e)));
            n = n ?? new i;
            const s = new Map,
                r = t.typeRegistry;
            for (const [a, o] of Object.entries(e)) {
                const c = i.fields.findJsonName(a);
                if (c) {
                    if (c.oneof) {
                        if (o === null && c.kind == "scalar") continue;
                        const d = s.get(c.oneof);
                        if (d !== void 0) throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: multiple keys for oneof "').concat(c.oneof.name, '" present: "').concat(d, '", "').concat(a, '"'));
                        s.set(c.oneof, a)
                    }
                    Pr(n, o, c, t, i)
                } else {
                    let d = !1;
                    if (r != null && r.findExtension && a.startsWith("[") && a.endsWith("]")) {
                        const l = r.findExtension(a.substring(1, a.length - 1));
                        if (l && l.extendee.typeName == i.typeName) {
                            d = !0;
                            const [u, h] = na(l);
                            Pr(u, o, l.field, t, l), ru(n, l, h(), t)
                        }
                    }
                    if (!d && !t.ignoreUnknownFields) throw new Error("cannot decode message ".concat(i.typeName, ' from JSON: key "').concat(a, '" is unknown'))
                }
            }
            return n
        },
        writeMessage(i, e) {
            const t = i.getType(),
                n = {};
            let s;
            try {
                for (s of t.fields.byNumber()) {
                    if (!aa(s, i)) {
                        if (s.req) throw "required field not set";
                        if (!e.emitDefaultValues || !lu(s)) continue
                    }
                    const a = s.oneof ? i[s.oneof.localName].value : i[s.localName],
                        o = Rr(s, a, e);
                    o !== void 0 && (n[e.useProtoFieldName ? s.name : s.jsonName] = o)
                }
                const r = e.typeRegistry;
                if (r != null && r.findExtensionFor)
                    for (const a of t.runtime.bin.listUnknownFields(i)) {
                        const o = r.findExtensionFor(t.typeName, a.no);
                        if (o && ra(i, o)) {
                            const c = su(i, o, e),
                                d = Rr(o.field, c, e);
                            d !== void 0 && (n[o.field.jsonName] = d)
                        }
                    }
            } catch (r) {
                const a = s ? "cannot encode field ".concat(t.typeName, ".").concat(s.name, " to JSON") : "cannot encode message ".concat(t.typeName, " to JSON"),
                    o = r instanceof Error ? r.message : String(r);
                throw new Error(a + (o.length > 0 ? ": ".concat(o) : ""))
            }
            return n
        },
        readScalar(i, e, t) {
            return ci(i, e, t ?? kt.BIGINT, !0)
        },
        writeScalar(i, e, t) {
            if (e !== void 0 && (t || ia(i, e))) return xi(i, e)
        },
        debug: $e
    }
}

