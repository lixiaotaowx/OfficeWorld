function Tn({
    me: t,
    onClose: s,
    quick: n = !1
}) {
    return e.jsxs("section", {
        className: "dock-card dk-fly dk-me",
        role: "dialog",
        "aria-label": "我",
        children: [e.jsxs("header", {
            children: [e.jsx("strong", {
                children: n ? "快捷操作" : t.name
            }), e.jsx("small", {
                children: t.status || (t.atDesk ? "在座" : "离开")
            }), e.jsx("button", {
                type: "button",
                className: "dk-icon",
                title: "收起（Esc）",
                "aria-label": "收起",
                onClick: s,
                children: ae.close
            })]
        }), !n && e.jsxs("div", {
            className: "dk-profile",
            children: [e.jsx(Ie, {
                person: t,
                size: 56
            }), e.jsxs("div", {
                children: [e.jsx("strong", {
                    children: t.name
                }), e.jsx("p", {
                    children: t.status || (t.atDesk ? "在座 · 这是你的个人面板" : "离开座位")
                })]
            })]
        }), e.jsxs("div", {
            className: "dk-menu",
            children: [e.jsxs("button", {
                type: "button",
                onClick: () => {
                    G("status", t.id), s()
                },
                children: ["写个状态", e.jsx("small", {
                    children: t.status ? "改一下" : "别人在你脸上看到"
                })]
            }), t.status && e.jsx("button", {
                type: "button",
                onClick: () => {
                    G("status-clear", t.id), s()
                },
                children: "清除状态"
            }), e.jsxs("button", {
                type: "button",
                onClick: () => {
                    G("focus", t.id), s()
                },
                children: ["去办公室走走", e.jsx("small", {
                    children: "打开 3D 空间"
                })]
            }), e.jsx("button", {
                type: "button",
                onClick: () => {
                    G("focus", t.id), s()
                },
                children: "设置"
            })]
        })]
    })
}

