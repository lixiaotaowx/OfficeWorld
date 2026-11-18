function cd({
    value: p,
    onPick: S
}) {
    return X.jsx("span", {
        className: "screen-stage-inks",
        role: "group",
        "aria-label": "画笔颜色",
        children: Ha.map(f => X.jsx("button", {
            type: "button",
            className: "screen-stage-ink-swatch",
            style: {
                background: f
            },
            "aria-label": `使用${Aa[f]||f}画笔`,
            "aria-pressed": p === f,
            title: `使用${Aa[f]||f}画笔`,
            onClick: () => S(f)
        }, f))
    })
}

