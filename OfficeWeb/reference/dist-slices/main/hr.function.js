function hr({
    stream: i,
    label: e,
    onClose: t,
    signal: n,
    scope: s,
    annotation: r,
    selfColor: a,
    annotatable: o,
    own: c = !1,
    shareControl: d
}) {
    const [l, u] = I.useState(!1);
    I.useEffect(() => {
        if (u(!1), i) return;
        const f = setTimeout(() => u(!0), 15e3);
        return () => clearTimeout(f)
    }, [i]), I.useEffect(() => {
        if (!i) return;
        const f = i.getVideoTracks()[0];
        if (!f || f.readyState === "ended") {
            t();
            return
        }
        return f.addEventListener("ended", t), () => f.removeEventListener("ended", t)
    }, [i, t]);
    const h = v.jsx("button", {
            type: "button",
            disabled: d.busy,
            onClick: d.onToggle,
            title: d.sharing ? "停止共享我的屏幕" : "共享我的屏幕，接替当前分享",
            children: d.sharing ? "退出共享" : "抢占屏幕分享"
        }),
        m = d.error && v.jsx("span", {
            className: "screen-stage-action-error",
            role: "alert",
            children: d.error
        });
    return i ? v.jsx(ws, {
        stream: i,
        scope: s,
        label: e,
        selfColor: a,
        annotatable: o && !c,
        clearsOwnBoard: c,
        initialFullscreen: !0,
        onExitFullscreen: t,
        actions: v.jsxs(v.Fragment, {
            children: [h, m, v.jsx("button", {
                onClick: t,
                children: "回到 Dock"
            }), n ? v.jsx(tl, {
                state: n.state,
                summary: n.summary,
                title: "会议连接情况"
            }) : v.jsx("span", {
                className: "screen-stage-signal-wait",
                children: "检查信号中…"
            })]
        }),
        onDraw: r.draw,
        onClear: r.clear,
        onUndo: r.undo
    }) : jo.createPortal(v.jsxs("section", {
        className: "meeting-screen-wait",
        role: "dialog",
        "aria-label": e,
        children: [v.jsx("h2", {
            children: e
        }), v.jsx("p", {
            role: "status",
            children: l ? "还没收到画面，请对方确认共享仍在进行，或重新共享一次。语音通话不受影响。" : "正在接收共享画面…"
        }), v.jsx("button", {
            type: "button",
            onClick: t,
            children: "回到 Dock"
        }), h, m]
    }), document.body)
}

