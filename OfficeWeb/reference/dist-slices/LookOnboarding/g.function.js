function g({
    value: e,
    onChange: i
}) {
    return s.jsx("div", {
        className: "color-grid",
        role: "listbox",
        "aria-label": "选颜色",
        children: x.map(r => s.jsxs("button", {
            type: "button",
            role: "option",
            "aria-selected": e.color === r.id,
            "aria-label": r.label,
            className: e.color === r.id ? "chosen" : "",
            onClick: () => i({
                ...e,
                color: r.id
            }),
            title: r.label,
            children: [s.jsx(p, {
                value: {
                    ...e,
                    color: r.id
                },
                size: "small"
            }), s.jsx("span", {
                children: r.label
            }), s.jsx("i", {
                className: "swatch",
                style: {
                    background: r.hex
                },
                "aria-hidden": "true"
            })]
        }, r.id))
    })
}

