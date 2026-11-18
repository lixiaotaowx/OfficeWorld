function Tt({
    name: t,
    text: s,
    person: n,
    action: c,
    onAccept: r,
    onDismiss: i,
    busy: o = !1,
    showAvatar: d = !0
}) {
    return e.jsxs("div", {
        className: "dk-greeting",
        role: "region",
        "aria-label": `${t}的提醒`,
        children: [d && e.jsx(u.Suspense, {
            fallback: e.jsx("div", {
                className: "dk-greeting-avatar"
            }),
            children: e.jsx(Nn, {
                appearance: n ? Ye(n) : Et
            })
        }), e.jsxs("div", {
            className: "dock-card dk-invite",
            role: "status",
            children: [e.jsx("button", {
                className: "dk-greeting-face",
                "aria-label": `${c}：${t}`,
                disabled: o,
                onClick: r,
                children: n ? e.jsx(Ie, {
                    person: n,
                    size: 36
                }) : e.jsx("span", {
                    "aria-hidden": "true",
                    children: "@"
                })
            }), e.jsxs("div", {
                className: "dk-invite-copy",
                children: [e.jsx("b", {
                    children: t
                }), e.jsx("span", {
                    children: s
                })]
            }), e.jsx("button", {
                type: "button",
                className: "yes",
                disabled: o,
                onClick: r,
                children: c
            }), e.jsx("button", {
                type: "button",
                disabled: o,
                onClick: i,
                children: "稍后"
            })]
        })]
    })
}

