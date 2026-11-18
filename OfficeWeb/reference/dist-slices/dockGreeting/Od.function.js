function Od({
    enabled: p,
    own: S = !1,
    active: f,
    color: R,
    onToggle: E,
    onColor: z,
    onUndo: F,
    onClear: O
}) {
    return S ? X.jsx("button", {
        type: "button",
        title: "清掉所有人在共享屏幕上的标注",
        onClick: O,
        children: "清掉标注"
    }) : p ? X.jsxs(X.Fragment, {
        children: [X.jsx("button", {
            type: "button",
            "aria-pressed": f,
            title: "在共享的屏幕上标注",
            onClick: E,
            children: "标注"
        }), f && X.jsxs(X.Fragment, {
            children: [X.jsx(cd, {
                value: R,
                onPick: z
            }), X.jsx("button", {
                type: "button",
                title: "撤销我画的最后一笔",
                onClick: F,
                children: "撤销"
            }), X.jsx("button", {
                type: "button",
                title: "清掉所有人的标注",
                onClick: O,
                children: "清空"
            })]
        })]
    }) : null
}

