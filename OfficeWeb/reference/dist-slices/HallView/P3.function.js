function P3({
    onClose: r,
    interact: e
}) {
    const [t, s] = _.useState("喵～你好。走到我身边，可以和我打招呼。"), [i, n] = _.useState(!1);
    _.useEffect(() => {
        const a = l => {
            l.key === "Escape" && (l.stopPropagation(), r())
        };
        return window.addEventListener("keydown", a, !0), () => window.removeEventListener("keydown", a, !0)
    }, [r]);
    const o = async a => {
        n(!0);
        try {
            const l = await e(a);
            s((l == null ? void 0 : l.text) || "暂时没连上，稍后再试。")
        } finally {
            n(!1)
        }
    };
    return y.jsx("div", {
        className: "cat-dialog-backdrop",
        onPointerDown: a => {
            a.stopPropagation(), a.target === a.currentTarget && r()
        },
        children: y.jsxs("section", {
            className: "cat-dialog",
            role: "dialog",
            "aria-modal": "true",
            "aria-label": "和猫说说话",
            onKeyDown: a => a.stopPropagation(),
            children: [y.jsxs("header", {
                children: [y.jsx("strong", {
                    children: "办公室的猫"
                }), y.jsx("button", {
                    "aria-label": "关闭猫对话",
                    onClick: r,
                    children: "×"
                })]
            }), y.jsx("p", {
                role: "status",
                children: t
            }), y.jsxs("div", {
                children: [y.jsx("button", {
                    disabled: i,
                    onClick: () => void o("hello"),
                    children: "打个招呼"
                }), y.jsx("button", {
                    disabled: i,
                    onClick: () => void o("pet"),
                    children: "摸摸它"
                })]
            }), y.jsx("small", {
                children: "当前为预设互动，不是 AI 聊天。"
            })]
        })
    })
}

