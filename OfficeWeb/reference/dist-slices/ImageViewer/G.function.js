function G(c, m) {
    p && (p.root.unmount(), p.node.remove(), URL.revokeObjectURL(p.url));
    const s = document.createElement("div");
    document.body.append(s);
    const r = q.createRoot(s),
        d = URL.createObjectURL(c),
        l = {
            root: r,
            node: s,
            url: d
        };
    p = l;
    const R = () => {
        p === l && (p = void 0, r.unmount(), s.remove(), URL.revokeObjectURL(d))
    };
    r.render(o.jsx(K, {
        url: d,
        name: m,
        onClose: R
    }))
}

