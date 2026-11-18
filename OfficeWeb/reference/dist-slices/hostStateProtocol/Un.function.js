function Un(n, e = [], t = [], s = () => "") {
    const r = typeof n == "string" ? n : n == null ? void 0 : n.id,
        i = typeof n == "string" ? "cancelled" : n == null ? void 0 : n.reason;
    if (!r || i !== "timeout") return null;
    const o = e.find(f => f.id === r);
    if (o) {
        const f = s(o.target) || "对方";
        return {
            id: `${r}:unanswered`,
            kind: "unanswered",
            name: f,
            target: o.target,
            callKind: o.kind,
            title: "没打通，等一下再试",
            detail: `${f}没有接${o.kind==="screen"?"（看屏幕的邀请）":""}`
        }
    }
    const a = t.find(f => f.id === r);
    return a ? {
        id: `${r}:missed`,
        kind: "missed",
        name: a.name,
        target: a.from,
        callKind: a.kind,
        title: "未接来电",
        detail: `${a.name}找过你${a.kind==="screen"?"（看屏幕的邀请）":"（语音）"}`
    } : null
}

