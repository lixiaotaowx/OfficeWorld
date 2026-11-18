function S6(r, e, t) {
    const s = `${r+1} 号工位`,
        i = t ? `${t.name} ${t.atDesk===!1?"正在坐（离开）":"正在坐"}` : "";
    return t && e ? t.clientId === e.id ? {
        label: s,
        sub: i,
        sitter: t.name
    } : {
        label: s,
        sitter: t.name,
        sub: `${i} · 工位属于 ${e.name}${e.online?"（在线）":"（离线）"}`
    } : t ? {
        label: s,
        sub: `${i} · 还没人认领`,
        sitter: t.name
    } : e ? {
        label: s,
        sitter: "",
        sub: `${e.name} · ${e.online?"在线，不在座位":"离线"}`
    } : {
        label: s,
        sub: "空着",
        sitter: ""
    }
}
