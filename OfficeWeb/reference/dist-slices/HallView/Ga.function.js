function Ga(r, e) {
    var t = r == null ? null : typeof Symbol < "u" && r[Symbol.iterator] || r["@@iterator"];
    if (t != null) {
        var s, i, n, o, a = [],
            l = !0,
            A = !1;
        try {
            if (n = (t = t.call(r)).next, e !== 0)
                for (; !(l = (s = n.call(t)).done) && (a.push(s.value), a.length !== e); l = !0);
        } catch (c) {
            A = !0, i = c
        } finally {
            try {
                if (!l && t.return != null && (o = t.return(), Object(o) !== o)) return
            } finally {
                if (A) throw i
            }
        }
        return a
    }
}

