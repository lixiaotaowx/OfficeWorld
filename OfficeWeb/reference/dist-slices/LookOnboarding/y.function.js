function y({
    value: e,
    onChange: i,
    footer: r
}) {
    var a;
    const [l, o] = n.useState("color");
    return s.jsxs("div", {
        className: "look-chooser",
        "data-step": l,
        "data-look": f(e),
        children: [s.jsxs("div", {
            className: "look-body",
            children: [s.jsxs("div", {
                className: "look-stage",
                children: [s.jsx(p, {
                    value: e,
                    size: "large",
                    face: l === "accessory"
                }), s.jsx("strong", {
                    children: (a = x.find(c => c.id === e.color)) == null ? void 0 : a.label
                }), s.jsx("small", {
                    children: "现在的样子 · 实时预览"
                })]
            }), s.jsxs("div", {
                className: "look-options",
                children: [s.jsxs("div", {
                    className: "look-steps",
                    role: "tablist",
                    "aria-label": "形象设置步骤",
                    children: [s.jsx("button", {
                        type: "button",
                        role: "tab",
                        "aria-selected": l === "color",
                        className: l === "color" ? "chosen" : "",
                        onClick: () => o("color"),
                        children: "1 颜色"
                    }), s.jsx("button", {
                        type: "button",
                        role: "tab",
                        "aria-selected": l === "accessory",
                        className: l === "accessory" ? "chosen" : "",
                        onClick: () => o("accessory"),
                        children: "2 配饰"
                    })]
                }), l === "color" ? s.jsx(g, {
                    value: e,
                    onChange: i
                }) : s.jsx(N, {
                    value: e,
                    onChange: i
                })]
            })]
        }), r == null ? void 0 : r(l, o)]
    })
}

