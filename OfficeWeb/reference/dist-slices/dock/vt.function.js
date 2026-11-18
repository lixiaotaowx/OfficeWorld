function vt(t, s = "happy") {
    const n = `${Wt(t)}:${s}`,
        c = De.get(n);
    if (c) return c;
    const r = (async () => {
        const i = await bt(`${Ke}/${s}.png`),
            o = document.createElement("canvas");
        o.width = o.height = 512;
        const d = o.getContext("2d", {
            willReadFrequently: !0
        });
        d.save(), s === "sleepy" && (d.translate(512 * .54, 512 * .475), d.scale(.925, .925), d.translate(-512 * .537, -512 * .458)), d.drawImage(i, 0, 0, 512, 512), d.restore(), cn(d, t.color);
        const m = ["hair", "hat", "beard", "glasses"];
        for (const h of m) {
            const k = t.accessories[h];
            if (k === "none") continue;
            const f = await bt(`${Ke}/layers/${h}-${k}.png?v=1`);
            d.drawImage(f, 0, 0, 512, 512)
        }
        return o.toDataURL("image/png")
    })();
    return De.set(n, r), De.size > 96 && De.delete(De.keys().next().value), r.catch(() => De.delete(n)), r
}
