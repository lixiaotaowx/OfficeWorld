function U3({
    onClose: r,
    error: e = ""
}) {
    return y.jsx("section", {
        className: "hall-billiards-panel",
        "aria-label": "台球加载",
        children: y.jsxs("div", {
            className: "hall-billiards-loading",
            role: e ? "alert" : "status",
            children: [!e && y.jsx("span", {
                className: "hall-billiards-spinner",
                "aria-hidden": "true"
            }), y.jsx("span", {
                children: e || "正在加载台球…"
            }), y.jsx("button", {
                type: "button",
                onClick: r,
                children: "返回大厅"
            })]
        })
    })
}

