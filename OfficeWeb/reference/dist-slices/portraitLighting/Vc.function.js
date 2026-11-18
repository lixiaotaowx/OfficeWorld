function Vc(s, e) {
    if (e === ed) return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), s;
    if (e === po || e === fh) {
        let t = s.getIndex();
        if (t === null) {
            const r = [],
                a = s.getAttribute("position");
            if (a !== void 0) {
                for (let o = 0; o < a.count; o++) r.push(o);
                s.setIndex(r), t = s.getIndex()
            } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), s
        }
        const n = t.count - 2,
            i = [];
        if (e === po)
            for (let r = 1; r <= n; r++) i.push(t.getX(0)), i.push(t.getX(r)), i.push(t.getX(r + 1));
        else
            for (let r = 0; r < n; r++) r % 2 === 0 ? (i.push(t.getX(r)), i.push(t.getX(r + 1)), i.push(t.getX(r + 2))) : (i.push(t.getX(r + 2)), i.push(t.getX(r + 1)), i.push(t.getX(r)));
        return i.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."), s.setIndex(i), s.clearGroups(), s
    } else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), s
}

