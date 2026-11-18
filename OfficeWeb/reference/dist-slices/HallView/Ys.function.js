function Ys(r, e) {
    r.traverse(t => {
        const s = t;
        if (!s.isMesh || s.userData.token !== "c") return;
        const i = s.userData.finish;
        if (!i) {
            s.material.color.set(e);
            return
        }
        const n = b5(e, i.emissive, i.surface ?? D9(e));
        if (!s.userData.plain) {
            s.material = n;
            return
        }
        const o = s.material,
            a = o.emissive.clone(),
            l = o.emissiveIntensity;
        o.copy(n), o.emissive.copy(a), o.emissiveIntensity = l, o.userData = {}, s.userData.plain = n
    })
}

