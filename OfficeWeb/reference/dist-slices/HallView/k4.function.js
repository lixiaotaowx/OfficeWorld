function k4(r, e) {
    const t = r.getWorldScale(new T),
        s = Math.min(.8, Math.abs(t.x) * .8, Math.abs(t.z) * .8, Math.abs(t.y) * 2);
    r.traverse(i => {
        if (i.userData.waterSurface) {
            const n = i.material;
            n.userData.waterTime && (n.userData.waterTime.value = e)
        }
        if (typeof i.userData.fish == "number") {
            const n = i.userData.fish,
                o = e * (.19 + n * .035) + n * 2.1,
                a = .25 + n * .035,
                l = .22 + n * .03;
            i.position.set(Math.cos(o) * a, .1 + n * .025, Math.sin(o) * l), i.scale.set(s / Math.max(.001, Math.abs(t.x)), s / Math.max(.001, Math.abs(t.y)), s / Math.max(.001, Math.abs(t.z)));
            const A = i.getObjectByName("swimmer");
            A && (A.rotation.y = Math.atan2(-Math.sin(o) * a * t.x, Math.cos(o) * l * t.z));
            const c = i.getObjectByName("tail");
            c && (c.rotation.y = Math.sin(e * 7 + n) * .35)
        }
    })
}
