function b1(r, e, t = "#f2c230") {
    r.traverse(s => {
        const i = s;
        if (!(!i.isMesh || i.userData.nohit)) {
            if (i.userData.plain && !e) {
                i.material.dispose(), i.material = i.userData.plain, delete i.userData.plain;
                return
            }
            e && !Array.isArray(i.material) && i.material.userData.shared && !i.material.userData.lit && (i.userData.plain = i.material, i.material = i.material.clone(), i.material.userData = {});
            for (const n of Array.isArray(i.material) ? i.material : [i.material]) n.emissive && !n.userData.lit && !n.userData.shared && (n.emissive.set(t), n.emissiveIntensity = e)
        }
    })
}

