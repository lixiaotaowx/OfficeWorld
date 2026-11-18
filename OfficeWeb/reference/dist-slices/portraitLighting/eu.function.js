function eu() {
    let s = null,
        e = !1,
        t = null,
        n = null;

    function i(r, a) {
        n = s.requestAnimationFrame(i), t(r, a)
    }
    return {
        start: function() {
            e !== !0 && t !== null && s !== null && (n = s.requestAnimationFrame(i), e = !0)
        },
        stop: function() {
            s !== null && s.cancelAnimationFrame(n), e = !1
        },
        setAnimationLoop: function(r) {
            t = r
        },
        setContext: function(r) {
            s = r
        }
    }
}

