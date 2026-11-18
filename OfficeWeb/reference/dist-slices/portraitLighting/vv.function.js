function vv(s, e) {
    const {
        width: t,
        height: n
    } = _v(s.image);
    if (!t || !n || typeof document > "u") return s;
    const i = document.createElement("canvas");
    i.width = t, i.height = n;
    const r = i.getContext("2d");
    if (!r) return s;
    r.drawImage(s.image, 0, 0);
    const a = r.getImageData(0, 0, t, n),
        o = a.data,
        l = [1, 3, 5].map(h => parseInt(e.slice(h, h + 2), 16) / 255);
    for (let h = 0; h < o.length; h += 4) {
        const u = Math.max(o[h], o[h + 1], o[h + 2]) / 255,
            d = Math.min(1, u / xv);
        o[h] = Math.round(l[0] * d * 255), o[h + 1] = Math.round(l[1] * d * 255), o[h + 2] = Math.round(l[2] * d * 255)
    }
    r.putImageData(a, 0, 0);
    const c = new of(i);
    return c.colorSpace = s.colorSpace, c.flipY = s.flipY, c.wrapS = s.wrapS, c.wrapT = s.wrapT, c.magFilter = s.magFilter, c.minFilter = s.minFilter, c.anisotropy = s.anisotropy, c.offset.copy(s.offset), c.repeat.copy(s.repeat), c.center.copy(s.center), c.rotation = s.rotation, c.needsUpdate = !0, c
}
