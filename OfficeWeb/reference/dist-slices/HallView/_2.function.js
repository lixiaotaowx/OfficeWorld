function _2(r, e, t, s, i) {
    let n = e.href,
        o = e.title || null,
        a = r[1].replace(i.other.outputLinkReplace, "$1"),
        l = r[0].charAt(0) === "!",
        A = s.state.inLink,
        c = s.state.linkEmitted,
        h = s.state.inRawBlock;
    s.state.inLink = !0, s.state.linkEmitted = !1;
    let u = s.inlineTokens(a),
        d = s.state.linkEmitted;
    if (s.state.linkEmitted = c, s.state.inLink = A, !l) {
        if (d) {
            s.state.inRawBlock = h;
            return
        }
        s.state.linkEmitted = !0
    }
    return {
        type: l ? "image" : "link",
        raw: t,
        href: n,
        title: o,
        text: a,
        tokens: u
    }
}

