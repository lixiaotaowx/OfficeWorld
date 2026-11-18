function jn(n, e) {
    const t = {};
    let s;
    const r = () => {
            s = void 0;
            const o = {
                ...t
            };
            for (const a of Object.keys(t)) delete t[a];
            e(o)
        },
        i = ({
            id: o,
            image: a
        }) => {
            t[o] = a ? String(a) : null, s ?? (s = setTimeout(r, En))
        };
    return n.on("preview", i), () => {
        s && clearTimeout(s), s = void 0, n.off("preview", i)
    }
}

