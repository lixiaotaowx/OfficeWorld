function U2(r, e) {
    var n;
    let t = r.replace(D0.findPipe, (o, a, l) => {
            let A = !1,
                c = a;
            for (; --c >= 0 && l[c] === "\\";) A = !A;
            return A ? "|" : " |"
        }),
        s = t.split(D0.splitPipe),
        i = 0;
    if (s[0].trim() || s.shift(), s.length > 0 && !((n = s.at(-1)) != null && n.trim()) && s.pop(), e)
        if (s.length > e) s.splice(e);
        else
            for (; s.length < e;) s.push("");
    for (; i < s.length; i++) s[i] = s[i].trim().replace(D0.slashPipe, "|");
    return s
}

