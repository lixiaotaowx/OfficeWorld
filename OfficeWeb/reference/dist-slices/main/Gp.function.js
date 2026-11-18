function Gp({
    busy: i,
    error: e,
    choose: t
}) {
    return v.jsx("main", {
        className: "account-page role-page",
        children: v.jsxs("section", {
            className: "role-card",
            children: [v.jsx("span", {
                className: "eyebrow",
                children: "先认识一下"
            }), v.jsx("h2", {
                children: "你是以什么身份进来的？"
            }), v.jsx("p", {
                children: "成员有自己的工位；访客坐在公共区域。大家都能开会、聊天、通话和共享屏幕。"
            }), v.jsxs("div", {
                className: "role-options",
                children: [v.jsxs("button", {
                    type: "button",
                    className: "role-option",
                    disabled: i,
                    onClick: () => t("employee"),
                    children: [v.jsx("strong", {
                        children: "iruler dream 成员"
                    }), v.jsx("small", {
                        children: "有自己的工位，桌上的屏幕显示你的工作画面"
                    })]
                }), v.jsxs("button", {
                    type: "button",
                    className: "role-option",
                    onClick: () => t("visitor"),
                    disabled: i,
                    children: [v.jsx("strong", {
                        children: "访客"
                    }), v.jsx("small", {
                        children: "坐在公共区域，不显示屏幕画面"
                    })]
                })]
            }), e && v.jsx("p", {
                className: "account-error",
                role: "alert",
                children: e
            }), v.jsx("small", {
                className: "role-note",
                children: "选好后会记住，之后管理员可以帮你改。"
            })]
        })
    })
}

