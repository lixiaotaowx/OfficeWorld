function Bo() {
    const r = new E0,
        e = new E0,
        t = [],
        s = (i, n, o, a, l, A) => {
            const c = new Ye({
                color: N5[n],
                depthTest: !1,
                depthWrite: !1,
                transparent: !0,
                opacity: .95,
                fog: !1,
                toneMapped: !1
            });
            o.traverse(h => {
                const u = h;
                u.isMesh && (u.material = c, u.renderOrder = 999)
            }), a.material = new Ye({
                visible: !1
            }), a.userData.h = t.length, A.add(o, a), t.push({
                kind: i,
                axis: n,
                mat: c,
                picker: a,
                prio: l
            })
        };
    for (const i of ["x", "y", "z"]) {
        const n = new Ve().setFromUnitVectors(je.y, je[i]),
            o = new E0,
            a = new K(new qe(.016, .016, .72, 8)),
            l = new K(new ni(.055, .17, 16));
        a.position.y = .5, l.position.y = .94, o.add(a, l), o.quaternion.copy(n);
        const A = new K(new qe(.08, .08, .9, 6));
        A.position.copy(je[i]).multiplyScalar(.58), A.quaternion.copy(n), s("move", i, o, A, 2, r);
        const c = new K(new U0(.1, .1, .1));
        c.position.copy(je[i]).multiplyScalar(1.18);
        const h = new K(new U0(.2, .2, .2));
        h.position.copy(c.position), s("scale", i, c, h, 3, r);
        const u = new K(new s2(1.45, .014, 6, 72)),
            d = new K(new s2(1.45, .08, 4, 48));
        i === "x" && (u.rotation.y = d.rotation.y = Math.PI / 2), i === "y" && (u.rotation.x = d.rotation.x = Math.PI / 2), s("rot", i, u, d, 1, e)
    }
    return s("scale", "u", new K(new U0(.12, .12, .12)), new K(new U0(.22, .22, .22)), 4, r), r.add(e), r.visible = !1, r.traverse(i => {
        i.userData.nohit = !0
    }), {
        gz: r,
        rings: e,
        handles: t
    }
}
