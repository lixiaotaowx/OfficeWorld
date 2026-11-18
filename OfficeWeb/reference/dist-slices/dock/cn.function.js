function Cn(t, s = Date.now()) {
    const n = new Date(t),
        c = new Date(s);
    if (!Number.isFinite(n.getTime())) return "时间未知";
    const r = `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
    if (n.toDateString() === c.toDateString()) return r;
    const i = new Date(c);
    return i.setDate(i.getDate() - 1), n.toDateString() === i.toDateString() ? `昨天 ${r}` : `${n.getFullYear()===c.getFullYear()?"":`${n.getFullYear()}年`}${n.getMonth()+1}月${n.getDate()}日 ${r}`
}

