function Kc(s, e, t) {
    const n = e.attributes,
        i = [];

    function r(a, o) {
        return t.getDependency("accessor", a).then(function(l) {
            s.setAttribute(o, l)
        })
    }
    for (const a in n) {
        const o = Eo[a] || a.toLowerCase();
        o in s.attributes || i.push(r(n[a], o))
    }
    if (e.indices !== void 0 && !s.index) {
        const a = t.getDependency("accessor", e.indices).then(function(o) {
            s.setIndex(o)
        });
        i.push(a)
    }
    return Qe.workingColorSpace !== Xt && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Qe.workingColorSpace}" not supported.`), gn(s, e), hv(s, e, t), Promise.all(i).then(function() {
        return e.targets !== void 0 ? sv(s, e.targets, t) : s
    })
}

