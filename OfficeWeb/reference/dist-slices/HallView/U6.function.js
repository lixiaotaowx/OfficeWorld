function U6({
    act: r
}) {
    const e = t => () => void r(t).catch(() => {});
    return y.jsxs(y.Fragment, {
        children: [y.jsxs(G0, {
            title: "窗口",
            children: [y.jsx(g0, {
                label: "全屏",
                sub: "F11",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("fullscreen"),
                    children: "切换"
                })
            }), y.jsx(g0, {
                label: "最小化",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("minimize"),
                    children: "最小化"
                })
            }), y.jsx(g0, {
                label: "重新连接",
                sub: "Ctrl+R",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("reload"),
                    children: "重连"
                })
            }), y.jsx(g0, {
                label: "在浏览器里打开",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("browser"),
                    children: "打开"
                })
            }), y.jsx(g0, {
                label: "退出 iruler dream",
                sub: "关掉窗口只是回到托盘，这里是真的退出",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("quit"),
                    children: "退出"
                })
            })]
        }), y.jsxs(G0, {
            title: "声音和共享",
            children: [y.jsx(g0, {
                label: "扬声器和麦克风",
                sub: "打开 Windows 的声音设置",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("devices"),
                    children: "打开"
                })
            }), y.jsx(g0, {
                label: "麦克风隐私设置",
                children: y.jsx("button", {
                    type: "button",
                    onClick: e("microphone"),
                    children: "打开"
                })
            })]
        })]
    })
}
