function g_(s, e, t) {
    let n;

    function i(l) {
        n = l
    }

    function r(l, c) {
        s.drawArrays(n, l, c), t.update(c, n, 1)
    }

    function a(l, c, h) {
        h !== 0 && (s.drawArraysInstanced(n, l, c, h), t.update(c, n, h))
    }

    function o(l, c, h) {
        if (h === 0) return;
        e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, l, 0, c, 0, h);
        let d = 0;
        for (let f = 0; f < h; f++) d += c[f];
        t.update(d, n, 1)
    }
    this.setMode = i, this.render = r, this.renderInstances = a, this.renderMultiDraw = o
}

