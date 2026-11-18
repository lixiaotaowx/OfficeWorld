function P6({
    office: r
}) {
    const [e, t] = _.useState(""), [s, i] = _.useState(""), [n, o] = _.useState(null);
    return y.jsxs("div", {
        className: "admin",
        children: [y.jsx("input", {
            type: "password",
            placeholder: "管理员密码",
            "aria-label": "管理员密码",
            value: e,
            onChange: a => {
                t(a.target.value), i("")
            }
        }), r.seats.map((a, l) => {
            const A = S6(l, a, Q6(r.people, l));
            return y.jsx(g0, {
                label: A.label,
                sub: A.sub,
                children: y.jsx("button", {
                    type: "button",
                    disabled: !a || n !== null || !e,
                    onClick: async () => {
                        o(l);
                        const c = await r.adminKick(l, e);
                        o(null), i(c.ok ? `已释放 ${l+1} 号工位（${c.name}）` : c.error || "没成功")
                    },
                    children: n === l ? "…" : "释放"
                })
            }, l)
        }), s && y.jsx("small", {
            className: "muted",
            role: "status",
            children: s
        })]
    })
}

