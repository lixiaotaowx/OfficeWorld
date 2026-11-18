function b(i, e, t, n) {
    function s(r) {
        return r instanceof t ? r : new t(function(a) {
            a(r)
        })
    }
    return new(t || (t = Promise))(function(r, a) {
        function o(l) {
            try {
                d(n.next(l))
            } catch (u) {
                a(u)
            }
        }

        function c(l) {
            try {
                d(n.throw(l))
            } catch (u) {
                a(u)
            }
        }

        function d(l) {
            l.done ? r(l.value) : s(l.value).then(o, c)
        }
        d((n = n.apply(i, e || [])).next())
    })
}

