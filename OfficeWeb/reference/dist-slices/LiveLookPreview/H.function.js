function H(s) {
    const o = S(s);
    if (o.isEmpty()) {
        const i = new w(-.22, d.half, d.half, -.22, .1, 20);
        return i.position.set(0, d.y, 3), i.lookAt(0, d.y, 0), i
    }
    const a = o.getCenter(new x),
        e = o.getSize(new x),
        t = Math.max(.12, Math.max(e.x, e.y) * .5 * G),
        n = new w(-t, t, t, -t, .1, 20);
    return n.position.set(a.x + .26, a.y + .065, 3), n.lookAt(a.x, a.y, 0), n
}

