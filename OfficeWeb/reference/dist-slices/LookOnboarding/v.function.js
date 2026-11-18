function v({
    account: e,
    appearance: i,
    onAppearance: r
}) {
    const [l, o] = n.useState(() => e.lookConfirmed !== !0), [a, c] = n.useState(() => h(i)), t = n.useRef(e.lookConfirmed === !0);
    return n.useEffect(() => {
        e.lookConfirmed === !0 && (t.current = !0, o(!1))
    }, [e.lookConfirmed]), !l || t.current ? null : s.jsxs("div", {
        className: "seat-picker-hint",
        role: "dialog",
        "aria-label": "挑一个形象",
        children: [s.jsx("strong", {
            children: "挑一个你自己的形象"
        }), s.jsx("p", {
            children: "先挑颜色，再挑眼镜、发型、胡子和帽子。以后可以在 设置 → 我的形象 里改。"
        }), s.jsx(y, {
            value: a,
            onChange: c
        }), s.jsx("div", {
            className: "hint-actions",
            children: s.jsx("button", {
                className: "primary",
                onClick: () => {
                    t.current = !0, o(!1), r(h(a))
                },
                children: "好了，进去吧"
            })
        })]
    })
}
export {
    v as
    default
};