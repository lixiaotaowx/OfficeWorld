function At({
    screen: t,
    state: s,
    className: n
}) {
    var r;
    const c = t.meeting ? s.meeting : (r = s.privateCalls) == null ? void 0 : r.sessions.find(i => i.id === t.sessionId);
    return e.jsx("button", {
        type: "button",
        className: n,
        disabled: t.busy,
        title: c != null && c.sharing ? "停止共享我的屏幕" : "共享我的屏幕，接替当前分享",
        onClick: () => {
            var i, o;
            (o = (i = window.officeDock) == null ? void 0 : i.action) == null || o.call(i, "screen-control", t.id, void 0, {
                text: "share"
            })
        },
        children: c != null && c.sharing ? "退出共享" : "抢占屏幕分享"
    })
}

