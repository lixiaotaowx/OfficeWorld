function N_(s, e, t, n, i) {
    let r = new WeakMap;

    function a(c) {
        const h = i.render.frame,
            u = c.geometry,
            d = e.get(c, u);
        if (r.get(d) !== h && (e.update(d), r.set(d, h)), c.isInstancedMesh && (c.hasEventListener("dispose", l) === !1 && c.addEventListener("dispose", l), r.get(c) !== h && (t.update(c.instanceMatrix, s.ARRAY_BUFFER), c.instanceColor !== null && t.update(c.instanceColor, s.ARRAY_BUFFER), r.set(c, h))), c.isSkinnedMesh) {
            const f = c.skeleton;
            r.get(f) !== h && (f.update(), r.set(f, h))
        }
        return d
    }

    function o() {
        r = new WeakMap
    }

    function l(c) {
        const h = c.target;
        h.removeEventListener("dispose", l), n.releaseStatesOfObject(h), t.remove(h.instanceMatrix), h.instanceColor !== null && t.remove(h.instanceColor)
    }
    return {
        update: a,
        dispose: o
    }
}
