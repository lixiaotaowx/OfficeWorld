function tl({
    state: i,
    summary: e,
    title: t = "Meeting connection"
}) {
    const n = Zd(i.quality),
        s = i.participants.map(r => r.name + ": " + Ho(r.quality)).join(`
`);
    return v.jsxs("span", {
        className: "signal-bars-panel",
        role: "status",
        title: t + ": " + e + (s ? `
` + s : ""),
        children: [v.jsx("span", {
            className: "signal-bars",
            "data-level": i.quality,
            "aria-hidden": "true",
            children: [1, 2, 3].map(r => v.jsx("i", {
                className: r <= n ? "on" : ""
            }, r))
        }), v.jsx("span", {
            children: e
        })]
    })
}

