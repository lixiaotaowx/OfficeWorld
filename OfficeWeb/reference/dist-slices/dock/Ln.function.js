function Ln(t, s) {
    var r;
    const n = (r = t.meeting) == null ? void 0 : r.active,
        c = (t.huddles || [])[0];
    return s.length ? {
        label: n ? "拉大家进来" : "叫大家围过来",
        title: `会响铃：${s.map(i=>i.name).join("、")}`,
        off: !1
    } : c && !n ? {
        label: "加入他们",
        title: `${c.members.map(i=>i.name).join("、")}正在聊`,
        off: !1
    } : n ? {
        label: "大家都在了",
        title: "在座又空着的人都叫过了",
        off: !0
    } : {
        label: "开始会议",
        title: "先进入会议，其他人可以稍后加入",
        off: !1
    }
}

