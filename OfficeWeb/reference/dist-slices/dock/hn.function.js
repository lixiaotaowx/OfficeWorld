function hn({
    person: t,
    turned: s,
    inMine: n,
    active: c,
    dropping: r,
    onClick: i,
    onEnter: o,
    onLeave: d,
    onKeyboardFocus: m,
    onContextMenu: h,
    drag: k
}) {
    const f = !t.atDesk && !s;
    return e.jsxs("button", {
        type: "button",
        "data-person-id": t.id,
        draggable: !t.self,
        className: ["dk-chip", f ? "away" : "", c ? "active" : "", r ? "drop-on" : ""].filter(Boolean).join(" "),
        "aria-label": t.self ? "我" : `${t.name}${s?"，在通话":f?"，不在座位":""}`,
        onClick: i,
        onContextMenu: h,
        onMouseEnter: o,
        onMouseLeave: d,
        onFocus: m,
        onBlur: d,
        ...k,
        children: [e.jsx(Ie, {
            person: t,
            size: 32,
            turned: s,
            blinks: !0
        }), s && e.jsx("span", {
            className: "dk-busy" + (n ? " mine" : ""),
            "aria-hidden": "true"
        }), (t.unread > 0 || t.missed) && e.jsx("span", {
            className: "dk-pip",
            "aria-hidden": "true"
        })]
    })
}

