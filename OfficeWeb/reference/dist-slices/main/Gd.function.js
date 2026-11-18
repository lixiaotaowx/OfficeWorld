function Gd({
    onFullscreen: i,
    label: e
}) {
    return v.jsx("div", {
        className: "screen-stage-bar minimal",
        children: v.jsxs("button", {
            type: "button",
            className: "screen-stage-expand",
            onClick: i,
            "aria-label": e ? `全屏看${e}` : void 0,
            title: "让共享的屏幕铺满显示器",
            children: [v.jsx(pt, {}), "全屏"]
        })
    })
}
