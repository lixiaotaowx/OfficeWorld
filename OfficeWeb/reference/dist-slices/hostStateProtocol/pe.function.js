function pe(n) {
    if (n.length > 8e3) throw "URI too long";
    const e = n,
        t = n.indexOf("["),
        s = n.indexOf("]");
    t != -1 && s != -1 && (n = n.substring(0, t) + n.substring(t, s).replace(/:/g, ";") + n.substring(s, n.length));
    let r = sn.exec(n || ""),
        i = {},
        o = 14;
    for (; o--;) i[rn[o]] = r[o] || "";
    return t != -1 && s != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = on(i, i.path), i.queryKey = an(i, i.query), i
}

