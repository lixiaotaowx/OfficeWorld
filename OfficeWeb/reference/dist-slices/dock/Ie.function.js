function Ie({
    person: t,
    size: s,
    turned: n = !1,
    blinks: c = !1
}) {
    const r = u.useRef(null),
        i = Ye(t),
        o = on({
            autoExpression: rn(t.character),
            atDesk: t.atDesk,
            sharing: t.sharing
        }),
        d = JSON.stringify(i) + o + n + s;
    return u.useEffect(() => {
        let m = !0,
            h;
        return dn(i, o).then(k => {
            if (!m || !r.current) return;
            const f = (g = !1) => r.current && un(r.current, k, s, {
                blink: g,
                turned: n
            });
            if (f(), !c || n || fn || o === "away") return;
            const b = () => {
                h = setTimeout(() => {
                    f(!0), h = setTimeout(() => {
                        f(), b()
                    }, 150)
                }, 6e3 + Math.random() * 4e3)
            };
            b()
        }).catch(() => {}), () => {
            m = !1, h && clearTimeout(h)
        }
    }, [d, c]), e.jsx("canvas", {
        ref: r,
        "data-pid": t.account || t.id,
        "aria-hidden": "true",
        style: {
            width: s,
            height: s
        }
    })
}

