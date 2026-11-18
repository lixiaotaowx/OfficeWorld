function un(t, s, n, c = {}) {
    const r = window.devicePixelRatio || 1,
        i = Math.round(n * r);
    t.width !== i && (t.width = i, t.height = i);
    const o = t.getContext("2d");
    if (o.clearRect(0, 0, i, i), o.imageSmoothingQuality = "high", c.turned) {
        o.save(), o.translate(i / 2, 0), o.transform(.8, -.06, 0, 1, 0, 0), o.translate(-i / 2, i * .03), o.drawImage(s.back, 0, 0, i, i), o.restore();
        return
    }
    const d = s.geo.box,
        m = $t(d);
    o.drawImage(s.front, 0, 0, i, i);
    const h = s.geo.eyes;
    if (c.blink && s.closed && h) {
        const k = d.y1 - d.y0,
            f = i / m.w,
            b = d.x0 + h.x0 * m.bw - m.bw * .02,
            g = d.y0 + h.y0 * k - k * .01,
            R = (h.x1 - h.x0) * m.bw + m.bw * .04,
            N = (h.y1 - h.y0) * k + k * .02;
        o.save(), o.beginPath(), o.rect((b - m.x) * f, (g - m.y) * f, R * f, N * f), o.clip(), o.drawImage(s.closed, 0, 0, i, i), o.restore()
    }
}
