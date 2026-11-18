function uu(s) {
    const e = new Map,
        t = new Map,
        n = s.clone();
    return du(s, n, function(i, r) {
        e.set(r, i), t.set(i, r)
    }), n.traverse(function(i) {
        if (!i.isSkinnedMesh) return;
        const r = i,
            a = e.get(i),
            o = a.skeleton.bones;
        r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(l) {
            return t.get(l)
        }), r.bind(r.skeleton, r.bindMatrix)
    }), n
}

