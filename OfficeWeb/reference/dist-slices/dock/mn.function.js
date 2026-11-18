function Mn({
    account: t,
    conversation: s,
    file: n
}) {
    const [c, r] = u.useState(!1), [i, o] = u.useState(""), d = async h => {
        if (!c) {
            r(!0), o("");
            try {
                await Le({
                    kind: h,
                    account: t,
                    conversation: s,
                    file: n
                })
            } catch (k) {
                o(k instanceof Error ? k.message : "操作失败，请重试")
            } finally {
                r(!1)
            }
        }
    }, m = n.size >= 1024 ** 2 ? `${(n.size/1024**2).toFixed(1)} MB` : `${Math.ceil(n.size/1024)} KB`;
    return e.jsxs("div", {
        className: "dk-file-entry",
        children: [e.jsxs("div", {
            className: "dk-file-row",
            children: [e.jsxs("button", {
                type: "button",
                className: "dk-file",
                disabled: c,
                title: n.name,
                onClick: () => void d("open"),
                children: [e.jsx("span", {
                    className: "ext",
                    children: (n.name.split(".").pop() || "").slice(0, 4).toUpperCase()
                }), e.jsxs("span", {
                    children: [e.jsx("b", {
                        children: n.name
                    }), e.jsxs("small", {
                        children: [m, " · ", c ? "正在处理…" : n.state || "点击下载并打开"]
                    })]
                })]
            }), e.jsxs("div", {
                className: "dk-file-actions",
                children: [e.jsx("button", {
                    type: "button",
                    disabled: c,
                    title: "打开文件",
                    "aria-label": "打开文件",
                    onClick: () => void d("open"),
                    children: e.jsx("svg", {
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        children: e.jsx("path", {
                            d: "m8 4 12 8-12 8Z"
                        })
                    })
                }), e.jsx("button", {
                    type: "button",
                    disabled: c,
                    title: "打开文件夹",
                    "aria-label": "打开文件夹",
                    onClick: () => void d("reveal"),
                    children: e.jsx("svg", {
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        children: e.jsx("path", {
                            d: "M3 7V4h6l3 3h9v13H3V7Zm0 3h18"
                        })
                    })
                })]
            })]
        }), i && e.jsx("small", {
            className: "dk-file-error",
            role: "alert",
            children: i
        })]
    })
}

