function _u(i, e) {
    var t, n, s, r, a, o;
    const c = [];
    let d;
    for (const l of typeof i == "function" ? i() : i) {
        const u = l;
        if (u.localName = la(l.name, l.oneof !== void 0), u.jsonName = (t = l.jsonName) !== null && t !== void 0 ? t : Tu(l.name), u.repeated = (n = l.repeated) !== null && n !== void 0 ? n : !1, l.kind == "scalar" && (u.L = (s = l.L) !== null && s !== void 0 ? s : kt.BIGINT), u.delimited = (r = l.delimited) !== null && r !== void 0 ? r : !1, u.req = (a = l.req) !== null && a !== void 0 ? a : !1, u.opt = (o = l.opt) !== null && o !== void 0 ? o : !1, l.packed === void 0 && (u.packed = l.kind == "enum" || l.kind == "scalar" && l.T != L.BYTES && l.T != L.STRING), l.oneof !== void 0) {
            const h = typeof l.oneof == "string" ? l.oneof : l.oneof.name;
            (!d || d.name != h) && (d = new Ru(h)), u.oneof = d, d.addField(u)
        }
        c.push(u)
    }
    return c
}
