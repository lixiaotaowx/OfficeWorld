function N({
    value: e,
    onChange: i
}) {
    const [r, l] = n.useState("hair");

    function o(a, c) {
        i({
            ...e,
            accessories: {
                ...e.accessories,
                [a]: c
            }
        })
    }
    return s.jsxs("div", {
        className: "accessory-list",
        role: "group",
        "aria-label": "选配饰",
        children: [s.jsx("div", {
            className: "accessory-tabs",
            "aria-label": "配饰种类",
            children: b.map(a => s.jsx("button", {
                "aria-pressed": r === a,
                className: r === a ? "chosen" : "",
                onClick: () => l(a),
                children: d[a]
            }, a))
        }), [r].map(a => s.jsxs("section", {
            className: "accessory-row",
            children: [s.jsx("span", {
                className: "accessory-slot",
                children: d[a]
            }), s.jsx("div", {
                className: "accessory-grid",
                role: "listbox",
                "aria-label": d[a],
                children: u[a].map(c => s.jsxs("button", {
                    type: "button",
                    role: "option",
                    "aria-selected": e.accessories[a] === c.id,
                    className: e.accessories[a] === c.id ? "chosen" : "",
                    onClick: () => o(a, c.id),
                    title: c.label,
                    children: [c.mesh ? s.jsx("img", {
                        src: m(`wear-${a}-${c.id}`),
                        alt: "",
                        draggable: !1
                    }) : s.jsx("i", {
                        className: "none-mark",
                        "aria-hidden": "true",
                        children: "—"
                    }), s.jsx("span", {
                        children: c.label
                    })]
                }, c.id))
            })]
        }, a))]
    })
}

