function F6({
    office: r
}) {
    const e = r.people.find(t => t.id === r.myId);
    return y.jsxs(y.Fragment, {
        children: [window.officeDesktop && y.jsxs(G0, {
            title: "屏幕",
            children: [y.jsx(g0, {
                label: "共享和预览用哪块屏幕",
                sub: "已保存在本机；下次启动、缩略图和视频共享都使用这块屏幕"
            }), y.jsx(N3, {})]
        }), y.jsxs(G0, {
            title: "在不在工位",
            children: [y.jsx(g0, {
                label: "离开的判断方式",
                sub: r.deskSensorLabel
            }), y.jsx(g0, {
                label: "我的工位屏幕",
                sub: r.previewReason
            })]
        }), y.jsxs(G0, {
            title: "预览",
            children: [y.jsx(sn, {
                label: "看别人的工位预览",
                sub: "关掉可以省流量，你自己的预览照常给别人看",
                checked: (e == null ? void 0 : e.previewAllowed) ?? !0,
                disabled: !r.connected,
                onChange: t => r.setPreviewAllowed(t)
            }), !window.officeDesktop && !r.sharing && y.jsx(g0, {
                label: "让工位屏幕显示我的画面",
                sub: "浏览器里要先允许共享屏幕",
                children: y.jsx("button", {
                    type: "button",
                    disabled: !r.connected,
                    onClick: () => void r.share(),
                    children: "允许"
                })
            })]
        })]
    })
}

