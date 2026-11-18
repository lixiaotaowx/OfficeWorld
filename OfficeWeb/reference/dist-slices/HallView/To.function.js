function To(r, e = 256, t = 192, s) {
    const i = document.createElement("canvas");
    i.width = e, i.height = t;
    const n = i.getContext("2d"),
        o = (l, A = 500) => `${A} ${Math.round(l)}px "Microsoft YaHei","PingFang SC",sans-serif`,
        a = (l, A, c, h, u, d) => {
            let g = "",
                p = c,
                I = 0;
            for (const C of l)
                if (n.measureText(g + C).width > h && g) {
                    if (n.fillText(I === d - 1 ? g.slice(0, -1) + "…" : g, A, p), ++I >= d) return;
                    g = C, p += u
                } else g += C;
            n.fillText(g, A, p)
        };
    if (r.type === "image") {
        if (n.fillStyle = "#2a2f33", n.fillRect(0, 0, e, t), s != null && s.complete && s.naturalWidth) {
            const l = Math.max(e / s.naturalWidth, t / s.naturalHeight),
                A = s.naturalWidth * l,
                c = s.naturalHeight * l;
            n.drawImage(s, (e - A) / 2, (t - c) / 2, A, c)
        }
    } else if (r.type === "note") {
        let l = 0;
        for (const A of r.id) l = (l + A.charCodeAt(0)) % D2.length;
        n.fillStyle = D2[l], n.fillRect(0, 0, e, t), n.fillStyle = "#3b3410", n.font = o(t / 7.5, 600), a(r.title, e * .09, t * .22, e * .82, t / 6.5, 2), n.font = o(t / 10, 400), n.fillStyle = "rgba(59,52,16,.75)", a(r.value, e * .09, t * .6, e * .82, t / 8, 3)
    } else {
        const l = ut(r.value);
        if (l) {
            const A = n.createLinearGradient(0, 0, e, t);
            A.addColorStop(0, "#22313a"), A.addColorStop(1, "#b8573a"), n.fillStyle = A, n.fillRect(0, 0, e, t), n.fillStyle = "rgba(255,255,255,.9)", n.beginPath(), n.moveTo(e / 2 - t * .09, t * .38), n.lineTo(e / 2 + t * .12, t * .5), n.lineTo(e / 2 - t * .09, t * .62), n.fill()
        } else n.fillStyle = "#f2f0ea", n.fillRect(0, 0, e, t), n.fillStyle = "#1c2321", n.font = `700 ${Math.round(t/3.4)}px Georgia,serif`, n.fillText("Aa", e * .09, t * .42);
        n.fillStyle = l ? "#fff" : "#1c2321", n.font = o(t / 9.5, 600), a(r.title, e * .09, t * (l ? .82 : .66), e * .82, t / 8, 1), n.fillStyle = l ? "rgba(255,255,255,.75)" : "#5d6a66", n.font = o(t / 12, 400), n.fillText((l == null ? void 0 : l.platform) || ko(r.value), e * .09, t * .92)
    }
    return i
}
