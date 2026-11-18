function Ks(r, e) {
    const t = r.kind.startsWith("model:") ? {
            min: [-e[0] / 2, 0, -e[2] / 2],
            max: [e[0] / 2, e[1], e[2] / 2]
        } : P5(r.kind),
        s = r.scale || [1, 1, 1],
        i = new Ve().setFromEuler(new x3((r.pitch || 0) * K0, r.rotation * K0, (r.roll || 0) * K0, "YXZ")),
        n = [1 / 0, 1 / 0, 1 / 0];
    for (let o = 0; o < 8; o++) new T(...[0, 1, 2].map(l => (o & 1 << l ? t.max[l] : t.min[l]) * s[l])).applyQuaternion(i).toArray().forEach((l, A) => {
        n[A] = Math.min(n[A], l)
    });
    return n.map((o, a) => o + [r.x, r.y, r.z][a])
}

