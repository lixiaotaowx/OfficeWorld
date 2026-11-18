function so(r, e) {
    e === "cd46ea91-b2b8-4ca0-9b8f-b7a9be915731.glb" && r.traverse(t => {
        var a;
        if (!(t instanceof K) || !t.geometry) return;
        t.geometry.computeBoundingBox();
        const s = (a = t.geometry.boundingBox) == null ? void 0 : a.getSize(new T);
        if (!s) return;
        const i = (l, A) => Math.abs(l - A) < .002,
            n = i(s.x, .12) && i(s.y, 1.05) && i(s.z, 1.8),
            o = i(s.x, .14) && i(s.y, .04) && i(s.z, 1.8);
        (n || o) && (t.geometry = k5(t.geometry.clone()), t.geometry.scale(1, n ? .96 : 1, n ? .97 : .955))
    })
}
