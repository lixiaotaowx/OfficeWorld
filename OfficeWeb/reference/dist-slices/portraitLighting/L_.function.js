function L_(s, e, t) {
    let n;

    function i(u) {
        n = u
    }
    let r, a;

    function o(u) {
        r = u.type, a = u.bytesPerElement
    }

    function l(u, d) {
        s.drawElements(n, d, r, u * a), t.update(d, n, 1)
    }

    function c(u, d, f) {
        f !== 0 && (s.drawElementsInstanced(n, d, r, u * a, f), t.update(d, n, f))
    }

    function h(u, d, f) {
        if (f === 0) return;
        e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, d, 0, r, u, 0, f);
        let x = 0;
        for (let m = 0; m < f; m++) x += d[m];
        t.update(x, n, 1)
    }
    this.setMode = i, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h
}

