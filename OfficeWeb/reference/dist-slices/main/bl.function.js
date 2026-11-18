function bl({
    update: i
}) {
    if (!i.copy) return null;
    const {
        title: e,
        detail: t,
        action: n,
        automatic: s,
        secondary: r,
        hint: a
    } = i.copy, o = i.stage === "downloading" || i.stage === "installing", c = i.stage === "ready";
    return v.jsxs("section", {
        className: `update-prompt ${i.stage}`,
        role: "alert",
        "aria-live": "polite",
        children: [v.jsx("div", {
            className: "update-icon",
            children: v.jsx(nr, {})
        }), v.jsxs("div", {
            className: "update-body",
            children: [v.jsx("strong", {
                className: "update-title",
                children: e
            }), v.jsx("small", {
                className: "update-detail",
                children: t
            }), i.stage === "downloading" && v.jsx("div", {
                className: "update-bar",
                role: "progressbar",
                "aria-label": "下载进度",
                "aria-valuemin": 0,
                "aria-valuemax": 100,
                "aria-valuenow": i.percent ?? void 0,
                children: v.jsx("div", {
                    className: "update-bar-fill",
                    style: {
                        width: `${i.percent??0}%`
                    }
                })
            }), i.stage === "downloading" && v.jsx("small", {
                className: "update-bytes",
                children: vl(i)
            }), v.jsxs("div", {
                className: "update-actions",
                children: [v.jsxs("button", {
                    type: "button",
                    className: "primary",
                    disabled: o,
                    onClick: () => void(c ? i.install() : i.start()),
                    children: [v.jsx(nr, {}), n]
                }), r && v.jsx("button", {
                    type: "button",
                    disabled: o,
                    onClick: () => void(c ? i.reveal() : i.copyLink()),
                    children: r
                }), v.jsx("button", {
                    type: "button",
                    onClick: i.later,
                    disabled: o,
                    children: c ? "以后再装" : "以后再说"
                })]
            }), a && v.jsx("small", {
                className: "update-hint",
                children: a
            }), !s && !a && v.jsx("small", {
                className: "update-hint",
                children: "这个客户端不能自动更新，请手动下载安装。"
            })]
        })]
    })
}
