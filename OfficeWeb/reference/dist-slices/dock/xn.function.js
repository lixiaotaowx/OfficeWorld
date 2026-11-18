function xn({
    huddle: t,
    people: s,
    mine: n,
    now: c,
    onClick: r,
    drag: i
}) {
    var h;
    const o = t.members.map(k => s.find(f => f.account === k.id) || {
            id: k.id,
            account: k.id,
            name: k.name,
            character: "",
            atDesk: !0,
            sharing: !1,
            inCall: !0,
            hasPreview: !1,
            unread: 0,
            missed: !1
        }),
        d = t.members.map(k => k.name).join("、"),
        m = (h = t.members.find(k => k.id === t.sharing)) == null ? void 0 : h.name;
    return e.jsxs("button", {
        type: "button",
        "data-huddle": t.id,
        className: "dk-bubble" + (n ? " mine" : ""),
        onClick: r,
        "aria-label": n ? `我的通话：${d}` : `${d}正在聊，点一下加入`,
        title: n ? "点开通话控制，或把头像拖进来拉人" : `${d}正在聊${m?` · ${m}在共享屏幕`:""} · 点一下加入`,
        ...i,
        children: [o.map(k => e.jsx(Ie, {
            person: k,
            size: 22
        }, k.id)), t.ringing.length > 0 && e.jsx("span", {
            className: "dk-ringing",
            "aria-hidden": "true",
            children: "·".repeat(Math.min(3, t.ringing.length))
        }), t.sharing && e.jsx("svg", {
            className: "dk-sharing",
            viewBox: "0 0 24 24",
            "aria-hidden": "true",
            children: e.jsx("path", {
                fill: "currentColor",
                d: "M3 4h18v12H3zM8 20h8v-2H8z"
            })
        }), e.jsx("span", {
            className: "dk-time",
            children: gn(Math.max(0, c - t.since))
        })]
    })
}

