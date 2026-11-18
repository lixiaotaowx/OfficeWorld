function mu() {
    return {
        makeReadOptions: uu,
        makeWriteOptions: hu,
        listUnknownFields(i) {
            var e;
            return (e = i[Lt]) !== null && e !== void 0 ? e : []
        },
        discardUnknownFields(i) {
            delete i[Lt]
        },
        writeUnknownFields(i, e) {
            const n = i[Lt];
            if (n)
                for (const s of n) e.tag(s.no, s.wireType).raw(s.data)
        },
        onUnknownField(i, e, t, n) {
            const s = i;
            Array.isArray(s[Lt]) || (s[Lt] = []), s[Lt].push({
                no: e,
                wireType: t,
                data: n
            })
        },
        readMessage(i, e, t, n, s) {
            const r = i.getType(),
                a = s ? e.len : e.pos + t;
            let o, c;
            for (; e.pos < a && ([o, c] = e.tag(), !(s === !0 && c == pe.EndGroup));) {
                const d = r.fields.find(o);
                if (!d) {
                    const l = e.skip(c, o);
                    n.readUnknownFields && this.onUnknownField(i, o, c, l);
                    continue
                }
                xr(i, e, d, c, n)
            }
            if (s && (c != pe.EndGroup || o !== t)) throw new Error("invalid end group tag")
        },
        readField: xr,
        writeMessage(i, e, t) {
            const n = i.getType();
            for (const s of n.fields.byNumber()) {
                if (!aa(s, i)) {
                    if (s.req) throw new Error("cannot encode field ".concat(n.typeName, ".").concat(s.name, " to binary: required field not set"));
                    continue
                }
                const r = s.oneof ? i[s.oneof.localName].value : i[s.localName];
                Mr(s, r, e, t)
            }
            return t.writeUnknownFields && this.writeUnknownFields(i, e), e
        },
        writeField(i, e, t, n) {
            e !== void 0 && Mr(i, e, t, n)
        }
    }
}

