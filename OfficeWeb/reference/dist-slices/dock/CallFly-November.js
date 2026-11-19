function Rn({
    state: t,
    huddle: s,
    people: n,
    free: c,
    onClose: r,
    onView: i
}) {
    const o = t.meeting;
    if (!(o != null && o.active)) return null;
    const d = s ? s.members : (o.members || []).filter(f => f.status === "joined"),
        m = (s == null ? void 0 : s.ringing) || (o.members || []).filter(f => f.status === "invited"),
        h = s != null && s.sharing ? n.find(f => f.account === s.sharing) : null,
        k = o.sharing;
    return e.jsxs("section", {
        className: "dock-card dk-fly dk-call",
        role: "dialog",
        "aria-label": "通话",
        children: [e.jsxs("header", {
            children: [e.jsx("strong", {
                children: "通话"
            }), e.jsx("small", {
                children: o.busy ? "处理中…" : o.error || "已接通"
            }), e.jsx("button", {
                type: "button",
                className: "dk-icon",
                title: "收起（Esc）",
                "aria-label": "收起",
                onClick: r,
                children: ae.close
            })]
        }), e.jsx("div", {
            className: "dk-people",
            children: [...d.map(f => ({
                ...f,
                ring: !1
            })), ...m.map(f => ({
                ...f,
                ring: !0
            }))].map(f => {
                const b = n.find(g => g.account === f.id);
                return e.jsxs("div", {
                    className: "dk-person",
                    children: [b ? e.jsx(Ie, {
                        person: b,
                        size: 28
                    }) : e.jsx("span", {
                        className: "dk-blank"
                    }), e.jsx("span", {
                        children: b != null && b.self ? "我" : f.name
                    }), e.jsx("small", {
                        children: [(s == null ? void 0 : s.sharing) === f.id ? "在共享" : "", f.ring ? "响铃中" : b != null && b.self && !o.mic ? "静音" : ""].filter(Boolean).join(" · ")
                    })]
                }, f.id)
            })
        }), c.length > 0 && e.jsxs("div", {
            className: "dk-add",
            children: [e.jsx("small", {
                children: "拉人进来（也可以把头像拖到泡泡上）"
            }), c.map(f => e.jsxs("button", {
                type: "button",
                onClick: () => G("huddle-invite", "", {
                    ids: [f.account || ""]
                }),
                children: ["+ ", f.name]
            }, f.id))]
        }), e.jsxs("div", {
            className: "dk-callbar",
            children: [e.jsxs("button", {
                type: "button",
                className: "dk-mic" + (o.mic ? " on" : ""),
                "data-mic-level": gt(o.micLevel, o.mic),
                onClick: () => G("meeting-mute", o.id || ""),
                children: [o.mic && e.jsx("i", {
                    className: "dk-mic-fill",
                    "aria-hidden": "true",
                    style: {
                        transform: `scaleY(${gt(o.micLevel,!0)})`
                    }
                }), o.mic ? ae.mic : ae.micOff, o.mic ? "麦克风开" : "已静音"]
            }), e.jsxs("button", {
                type: "button",
                className: k ? "on" : "",
                onClick: () => h && !k ? i ? i(h.id) : G("meeting-view", h.id) : G("meeting-share", o.id || ""),
                children: [ae.screen, k ? "停止共享" : h ? `看${h.name}的屏幕` : "共享屏幕"]
            }), e.jsxs("button", {
                type: "button",
                className: "leave",
                onClick: () => {
                    G("meeting-leave", o.id || ""), r()
                },
                children: [ae.leave, "离开"]
            })]
        })]
    })
}