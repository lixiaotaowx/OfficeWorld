function L6() {
    const [r, e] = _.useState("Notification" in window ? Notification.permission : "unsupported"), [t, s] = _.useState(D3), [i, n] = _.useState(""), o = _.useRef(() => {});
    return _.useEffect(() => () => o.current(), []), y.jsxs(y.Fragment, {
        children: [y.jsxs(G0, {
            title: "消息提示音",
            children: [y.jsx("p", {
                className: "settings-note",
                children: "12 种动物短拟声，选择后立即生效并保存在本机。来电铃声不受影响。"
            }), y.jsx("div", {
                className: "settings-sounds",
                children: L3.map(([a, l]) => y.jsxs("div", {
                    className: "settings-sound",
                    children: [y.jsxs("button", {
                        type: "button",
                        "aria-pressed": t === a,
                        onClick: () => {
                            if (!R3(a)) {
                                n("保存失败，请检查本机存储后重试。");
                                return
                            }
                            s(a), n(""), o.current(), o.current = n2(a)
                        },
                        children: [l, y.jsx("small", {
                            children: t === a ? "已选择" : "选择"
                        })]
                    }), y.jsx("button", {
                        type: "button",
                        "aria-label": `试听${l}`,
                        onClick: () => {
                            o.current(), o.current = n2(a)
                        },
                        children: "试听"
                    })]
                }, a))
            }), i && y.jsx("p", {
                role: "alert",
                children: i
            })]
        }), y.jsx(G0, {
            title: "系统通知",
            children: y.jsx(g0, {
                label: r === "granted" ? "已经打开" : r === "denied" ? "被系统挡住了" : "来电、会议邀请和新消息",
                sub: r === "denied" ? "在系统或浏览器的通知设置里允许 iruler dream" : "有声音提醒；自己发的和以前的消息不响",
                children: r !== "granted" && r !== "unsupported" && y.jsx("button", {
                    type: "button",
                    onClick: async () => {
                        await F3(), e("Notification" in window ? Notification.permission : "unsupported")
                    },
                    children: "打开"
                })
            })
        })]
    })
}

