function Av(s, ...e) {
    for (const t of e) {
        const n = s.find(r => r.name === t);
        if (n) return n;
        const i = s.find(r => r.name.endsWith(t));
        if (i) return i
    }
    for (const t of e) {
        const n = t.toLowerCase().replace(/[^a-z]/g, "");
        if (!n) continue;
        const i = s.find(r => r.name.toLowerCase().replace(/[^a-z]/g, "").includes(n));
        if (i) return i
    }
}
async function Wv(s = bu) {
    const e = await Ev.acquire(),
        {
            gltf: t,
            materials: n
        } = e.value;
    let i;
    try {
        i = uu(t.scene), i.updateMatrixWorld(!0);
        const r = new un().setFromObject(i),
            a = Sv / (r.max.y - r.min.y);
        i.scale.multiplyScalar(a), i.position.y = -r.min.y * a;
        const o = i.position.y,
            l = new Map;
        i.traverse(v => {
            v instanceof Ho && (l.set(v.name, v), l.set(li(v.name), v)), v instanceof At && (v.castShadow = !0, v.receiveShadow = !0, v.frustumCulled = !1)
        });
        const c = pv(i);
        mu(c, s), i.updateMatrixWorld(!0);
        const h = new Map;
        for (const [v, A] of l) h.set(v, {
            quaternion: A.quaternion.clone(),
            position: A.position.clone()
        });
        const u = l.get("mixamorig:Hips") ?? l.get("Hips"),
            d = new Map;
        for (const v of ["L", "R"]) {
            const A = l.get(`mixamorig:Foot${v}`) ?? l.get(`Foot${v}`);
            A && d.set(v, A.getWorldPosition(new N).y)
        }
        const f = u ? u.getWorldPosition(new N).y : 0,
            p = new Pp(i),
            x = (...v) => {
                const A = Av(t.animations, ...v);
                return A ? p.clipAction(A) : void 0
            },
            m = x("Idle", "Idle_Neutral", "Idle"),
            g = x("Walk", "Walk"),
            M = x("Run"),
            E = {
                model: i,
                mixer: p,
                idle: m,
                walk: g,
                run: M,
                action: x,
                clips: t.animations.map(v => v.name),
                bones: l,
                rest: h,
                restHipHeight: f,
                groundY: o,
                groundFootHeights: d,
                look: c,
                appearance: s
            };
        return Ao.set(E, () => {
            try {
                Jc(E.model, n)
            } finally {
                e.release()
            }
        }), E
    } catch (r) {
        try {
            i && Jc(i, n)
        } finally {
            e.release()
        }
        throw r
    }
}

