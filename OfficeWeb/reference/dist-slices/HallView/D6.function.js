function D6({
    value: r,
    onChange: e
}) {
    const [t, s] = _.useState(!1);
    return y.jsxs(y.Fragment, {
        children: [y.jsxs("div", {
            className: "settings-look-live",
            children: [y.jsx(S3, {
                value: r,
                face: t
            }), y.jsxs("div", {
                className: "settings-look-caption",
                children: [y.jsx("strong", {
                    children: "实时预览"
                }), y.jsx("p", {
                    children: "修改即刻显示，向下挑选配饰时也能看见。"
                }), y.jsxs("div", {
                    className: "chips",
                    role: "group",
                    "aria-label": "预览视角",
                    children: [y.jsx("button", {
                        type: "button",
                        "aria-pressed": !t,
                        onClick: () => s(!1),
                        children: "全身"
                    }), y.jsx("button", {
                        type: "button",
                        "aria-pressed": t,
                        onClick: () => s(!0),
                        children: "配饰特写"
                    })]
                })]
            })]
        }), y.jsx(G0, {
            title: "颜色",
            children: y.jsx("div", {
                className: "sw2",
                children: M3.map(i => y.jsx("button", {
                    type: "button",
                    title: i.label,
                    "aria-label": i.label,
                    "aria-pressed": r.color === i.id,
                    style: {
                        background: i.hex
                    },
                    onClick: () => e({
                        ...r,
                        color: i.id
                    })
                }, i.id))
            })
        }), ["hair", "hat", "glasses", "beard"].filter(i => k3.includes(i)).map(i => y.jsx(G0, {
            title: M6[i],
            children: y.jsx("div", {
                className: "chips",
                children: T3[i].map(n => y.jsx("button", {
                    type: "button",
                    "aria-pressed": r.accessories[i] === n.id,
                    onClick: () => e({
                        ...r,
                        accessories: {
                            ...r.accessories,
                            [i]: n.id
                        }
                    }),
                    children: n.label
                }, n.id))
            })
        }, i)), y.jsx("small", {
            className: "muted",
            children: "改动马上生效，Dock 头像也会一起换。"
        })]
    })
}

